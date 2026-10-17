/**
 * Swiss Ephemeris WASM engine wrapper (Layer 1 — astronomical, deterministic).
 *
 * Primary: @swisseph/browser — the actual Swiss Ephemeris C library compiled to
 * WebAssembly (same engine behind Parashara's Light / Future Point). Works
 * fully client-side, no server, no API keys. Includes Moshier fallback
 * ephemeris built-in (~arcsecond accuracy without data files).
 *
 * If WASM fails to initialise, falls back to astronomy-engine (VSOP87) with
 * our own Lahiri ayanamsa — verified to agree with Swiss Ephemeris to a few
 * arcseconds (see verify-engines.mjs).
 *
 * Verified fixture (16 Mar 2007, 12:07 PM IST, Delhi):
 *   Mithun lagna, Makar rashi, Shravana pada 4, Shiv yog, Taitil karan,
 *   Mars exalted (Makar), Saturn retro (Kark), Rahu Kumbh, Ketu Simha — 15/15.
 */

import { SwissEphemeris, Planet, LunarPoint, SiderealMode, CalculationFlag } from '@swisseph/browser';

let swe = null;
let engineType = null; // 'swisseph-wasm' | 'astronomy-fallback'
let fallbackMod = null;
let ayanamsaMode = 'lahiri';
let customAyanamsaDeg = null;

const SIDEREAL_FLAG = CalculationFlag.Sidereal | CalculationFlag.Speed;
const TROPICAL_FLAG = CalculationFlag.Speed;

const AYANAMSA_MODES = {
  lahiri: () => SiderealMode.Lahiri,
  raman: () => SiderealMode.Raman,
  kp: () => SiderealMode.Krishnamurti,
  fagan: () => SiderealMode.FaganBradley,
  custom: () => SiderealMode.UserDefined,
};

export const ENGINE_META = {
  primary: 'Swiss Ephemeris (WASM)',
  fallback: 'astronomy-engine VSOP87 (fallback)',
};

/** Initialise the engine. Safe to call multiple times. */
export async function initEngine() {
  if (swe || engineType) return { engineType };
  try {
    const instance = new SwissEphemeris();
    await instance.init();
    applyAyanamsa(instance);
    swe = instance;
    engineType = 'swisseph-wasm';
  } catch (e) {
    console.warn('[kundli] Swiss Ephemeris WASM failed, using VSOP87 fallback:', e.message);
    fallbackMod = await import('astronomy-engine');
    engineType = 'astronomy-fallback';
  }
  return { engineType };
}

export function engineStatus() {
  return { ready: !!engineType, engineType };
}

function applyAyanamsa(instance) {
  const mode = AYANAMSA_MODES[ayanamsaMode] ? ayanamsaMode : 'lahiri';
  if (mode === 'custom' && customAyanamsaDeg != null) {
    instance.setSiderealMode(SiderealMode.UserDefined, 2451545.0, customAyanamsaDeg);
  } else {
    instance.setSiderealMode(AYANAMSA_MODES[mode]());
  }
}

/** 'lahiri' | 'raman' | 'kp' | 'fagan' | 'custom' */
export function setAyanamsaMode(mode, customDeg = null) {
  ayanamsaMode = AYANAMSA_MODES[mode] ? mode : 'lahiri';
  customAyanamsaDeg = customDeg;
  if (swe) applyAyanamsa(swe);
}

export function getAyanamsaMode() {
  return { mode: ayanamsaMode, customDeg: customAyanamsaDeg };
}

/** Ayanamsa in degrees for a Julian Day (UT). */
export function getAyanamsa(jdUT) {
  if (engineType === 'swisseph-wasm') return swe.getAyanamsa(jdUT);
  return fallbackAyanamsa(jdUT);
}

// Fallback Lahiri: anchored to measured Swiss Ephemeris values.
// J2000.0 = 23.85708°, rate 50.28"/yr. Agrees with sweph to ~2".
function fallbackAyanamsa(jdUT) {
  const years = (jdUT - 2451545.0) / 365.25;
  const base = 23.85708 + (50.28 / 3600) * years;
  if (ayanamsaMode === 'raman') return base - 1.1;
  if (ayanamsaMode === 'kp') return base - 0.1;
  if (ayanamsaMode === 'fagan') return base + 0.98;
  if (ayanamsaMode === 'custom' && customAyanamsaDeg != null) return customAyanamsaDeg;
  return base;
}

const GRAHA_BODIES = [
  ['Surya', 'Sun'], ['Chandra', 'Moon'], ['Mangal', 'Mars'], ['Budh', 'Mercury'],
  ['Guru', 'Jupiter'], ['Shukra', 'Venus'], ['Shani', 'Saturn'],
];

/**
 * Sidereal longitudes (+speeds) of the 9 grahas.
 * @param {number} jdUT Julian Day in UT
 * @param {'mean'|'true'} nodeType lunar node flavour
 * @returns {Object} { Surya: {lon, lat, speed}, ..., Rahu, Ketu, ayanamsa }
 */
export function getPositions(jdUT, nodeType = 'mean') {
  const ayanamsa = getAyanamsa(jdUT);
  const out = { ayanamsa };
  if (engineType === 'swisseph-wasm') {
    for (const [hi, en] of GRAHA_BODIES) {
      const p = swe.calculatePosition(jdUT, Planet[en], SIDEREAL_FLAG);
      out[hi] = { lon: norm360(p.longitude), lat: p.latitude || 0, speed: p.longitudeSpeed || 0 };
    }
    const nodeBody = nodeType === 'true' ? LunarPoint.TrueNode : LunarPoint.MeanNode;
    const r = swe.calculatePosition(jdUT, nodeBody, SIDEREAL_FLAG);
    out.Rahu = { lon: norm360(r.longitude), lat: 0, speed: -(r.longitudeSpeed || 0.053) };
    out.Ketu = { lon: norm360(r.longitude + 180), lat: 0, speed: out.Rahu.speed };
    return out;
  }
  // ---- astronomy-engine fallback (tropical -> sidereal) ----
  const A = fallbackMod;
  const at = A.MakeTime(new Date((jdUT - 2440587.5) * 86400000));
  const trop = {};
  trop.Surya = A.SunPosition(at).elon;
  trop.Chandra = A.EclipticGeoMoon(at).lon;
  const map = { Mangal: A.Body.Mars, Budh: A.Body.Mercury, Guru: A.Body.Jupiter, Shukra: A.Body.Venus, Shani: A.Body.Saturn };
  for (const [hi, body] of Object.entries(map)) trop[hi] = A.Ecliptic(A.GeoVector(body, at, true)).elon;
  // speeds via 0.5-day numeric derivative
  const dt = 0.5 / 24;
  const at2 = A.MakeTime(new Date((jdUT + dt - 2440587.5) * 86400000));
  const trop2 = {};
  trop2.Surya = A.SunPosition(at2).elon;
  trop2.Chandra = A.EclipticGeoMoon(at2).lon;
  for (const [hi, body] of Object.entries(map)) trop2[hi] = A.Ecliptic(A.GeoVector(body, at2, true)).elon;
  for (const hi of Object.keys(trop)) {
    let d = trop2[hi] - trop[hi];
    if (d > 180) d -= 360; if (d < -180) d += 360;
    out[hi] = { lon: norm360(trop[hi] - ayanamsa), lat: 0, speed: d / dt };
  }
  const T = (jdUT - 2451545.0) / 36525;
  let meanNode = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
  meanNode = norm360(meanNode - ayanamsa);
  out.Rahu = { lon: meanNode, lat: 0, speed: -0.05295 };
  out.Ketu = { lon: norm360(meanNode + 180), lat: 0, speed: -0.05295 };
  return out;
}

/** Tropical longitudes (for panchang elongation which needs tropical). */
export function getTropical(jdUT) {
  if (engineType === 'swisseph-wasm') {
    const out = {};
    for (const [hi, en] of GRAHA_BODIES) {
      const p = swe.calculatePosition(jdUT, Planet[en], TROPICAL_FLAG);
      out[hi] = norm360(p.longitude);
    }
    return out;
  }
  const A = fallbackMod;
  const at = A.MakeTime(new Date((jdUT - 2440587.5) * 86400000));
  const out = { Surya: A.SunPosition(at).elon, Chandra: A.EclipticGeoMoon(at).lon };
  const map = { Mangal: A.Body.Mars, Budh: A.Body.Mercury, Guru: A.Body.Jupiter, Shukra: A.Body.Venus, Shani: A.Body.Saturn };
  for (const [hi, body] of Object.entries(map)) out[hi] = A.Ecliptic(A.GeoVector(body, at, true)).elon;
  return out;
}

/**
 * Sidereal ascendant (Lagna). NOTE: swe_houses returns TROPICAL ascendant —
 * we always subtract ayanamsa ourselves.
 */
export function getAscendant(jdUT, lat, lon) {
  const ayanamsa = getAyanamsa(jdUT);
  let tropAsc;
  if (engineType === 'swisseph-wasm') {
    tropAsc = swe.calculateHouses(jdUT, lat, lon).ascendant;
  } else {
    tropAsc = fallbackAscendant(jdUT, lat, lon);
  }
  return norm360(tropAsc - ayanamsa);
}

function fallbackAscendant(jdUT, lat, lon) {
  const T = (jdUT - 2451545.0) / 36525;
  let GMST = 280.46061837 + 360.98564736629 * (jdUT - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
  GMST = norm360(GMST);
  const LST = norm360(GMST + lon);
  const eps = 23.439291 - 0.0130042 * T;
  const rL = LST * Math.PI / 180, rE = eps * Math.PI / 180, rP = lat * Math.PI / 180;
  const asc = Math.atan2(Math.cos(rL), -(Math.sin(rL) * Math.cos(rE) + Math.tan(rP) * Math.sin(rE))) * 180 / Math.PI;
  return norm360(asc);
}

export function norm360(d) {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

/** Julian Day (UT) from civil components. Month 1-12. */
export function julianDayUT(y, m, d, hourUT) {
  let yy = y, mm = m;
  if (mm <= 2) { yy -= 1; mm += 12; }
  const A = Math.floor(yy / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + hourUT / 24 + B - 1524.5;
}

/** Date -> JD(UT) for a Date object. */
export function jdFromDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/** JD(UT) -> JS Date. */
export function dateFromJd(jd) {
  return new Date((jd - 2440587.5) * 86400000);
}
