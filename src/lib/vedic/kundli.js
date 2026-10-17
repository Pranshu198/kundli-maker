/**
 * Kundli orchestrator — Layer 1 (Swiss Ephemeris) + Layer 2 (Vedic rules).
 * Produces the exact object described in SPEC.md. Deterministic, no invented data.
 */
import { initEngine, setAyanamsaMode, getAyanamsa, getPositions, getTropical, getAscendant, julianDayUT, norm360, engineStatus } from '../engine/sweph.js';
import { GRAHAS, GRAHA_HI, GRAHA_EN, GRAHA_ABBR, GRAHA_ABBR_HI, DIGNITY, COMBUST_ORBS, RASHIS } from './constants.js';
import { nakshatraOf, rashiOf, panchangOf, formatDMS } from './panchang.js';
import { vargasOf } from './vargas.js';
import { vimshottariDasha } from './dasha.js';
import { houseOf, manglikDosha, kaalSarpYoga, pitraDosha } from './doshas.js';
import { detectYogas } from './yogas.js';
import { ashtakavargaOf } from './ashtakavarga.js';
import { shadbalaOf } from './shadbala.js';

export function dignityOf(graha, rashiIdx, degInRashi) {
  const d = DIGNITY[graha];
  if (!d) return { type: 'neutral', label: 'Neutral', labelHi: 'सम', score: 7.5 };
  if (d.ex && rashiIdx === d.ex[0]) {
    const deep = Math.abs(degInRashi - d.ex[1]) <= 3;
    return { type: 'exalted', label: deep ? 'Deeply Exalted' : 'Exalted', labelHi: 'उच्च', score: deep ? 45 : 30 };
  }
  if (d.deb && rashiIdx === d.deb[0])
    return { type: 'debilitated', label: 'Debilitated', labelHi: 'नीच', score: 1.875 };
  if (d.moola && rashiIdx === d.moola[0] && degInRashi >= d.moola[1] && degInRashi <= d.moola[2])
    return { type: 'moolatrikona', label: 'Moolatrikona', labelHi: 'मूलत्रिकोण', score: 45 };
  if (d.own && d.own.includes(rashiIdx))
    return { type: 'own', label: 'Own Sign', labelHi: 'स्वराशि', score: 30 };
  const friends = {
    Surya: [0, 3, 8, 11], Chandra: [0, 2, 4, 8, 11], Mangal: [4, 8, 11, 1, 6],
    Budh: [4, 5, 1, 6], Guru: [0, 3, 4, 7], Shukra: [2, 5, 9, 10], Shani: [1, 5, 2, 6],
  };
  if ((friends[graha] || []).includes(rashiIdx))
    return { type: 'friend', label: "Friend's Sign", labelHi: 'मित्र राशि', score: 15 };
  if (['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani'].includes(graha))
    return { type: 'enemy', label: "Enemy's Sign", labelHi: 'शत्रु राशि', score: 3.75 };
  return { type: 'neutral', label: 'Neutral', labelHi: 'सम', score: 7.5 };
}

export function avasthaOf(degInRashi, rashiIdx) {
  const odd = rashiIdx % 2 === 0;
  const d = degInRashi;
  let name, hi, strength;
  if (odd) {
    if (d < 6) [name, hi, strength] = ['Bala', 'बाल', 'weak'];
    else if (d < 12) [name, hi, strength] = ['Kumara', 'कुमार', 'moderate'];
    else if (d < 18) [name, hi, strength] = ['Yuva', 'युवा', 'strongest'];
    else if (d < 24) [name, hi, strength] = ['Vriddha', 'वृद्ध', 'weak'];
    else [name, hi, strength] = ['Mrita', 'मृत', 'very_weak'];
  } else {
    if (d < 6) [name, hi, strength] = ['Mrita', 'मृत', 'very_weak'];
    else if (d < 12) [name, hi, strength] = ['Vriddha', 'वृद्ध', 'weak'];
    else if (d < 18) [name, hi, strength] = ['Yuva', 'युवा', 'strongest'];
    else if (d < 24) [name, hi, strength] = ['Kumara', 'कुमार', 'moderate'];
    else [name, hi, strength] = ['Bala', 'बाल', 'weak'];
  }
  return { name, hi, strength };
}

function angDist(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function isCombust(graha, lon, sunLon, speed) {
  if (graha === 'Surya' || graha === 'Rahu' || graha === 'Ketu' || graha === 'Chandra' && false) return false;
  let orb = COMBUST_ORBS[graha];
  if (orb == null) return false;
  if (graha === 'Budh' && speed < 0) orb = 12;
  if (graha === 'Shukra' && speed < 0) orb = 8;
  return angDist(lon, sunLon) < orb;
}

/**
 * Main entry. input: { name, gender, dateStr, timeStr, lat, lon, place,
 *   utcOffsetHours, ayanamsaMode, customAyanamsa, nodeType }
 */
export async function computeKundli(input) {
  await initEngine();
  setAyanamsaMode(input.ayanamsaMode || 'lahiri', input.customAyanamsa);

  const [Y, M, D] = input.dateStr.split('-').map(Number);
  const tp = input.timeStr.split(':').map(Number);
  const tH = tp[0] + (tp[1] || 0) / 60 + (tp[2] || 0) / 3600;
  const hourUT = tH - input.utcOffsetHours;
  const jdUT = julianDayUT(Y, M, D, hourUT);
  const birthDate = new Date((jdUT - 2440587.5) * 86400000);

  const ayanamsa = getAyanamsa(jdUT);
  const pos = getPositions(jdUT, input.nodeType || 'mean');
  const trop = getTropical(jdUT);
  const lagnaLon = getAscendant(jdUT, input.lat, input.lon);
  const lagna = rashiOf(lagnaLon);
  lagna.lon = lagnaLon;
  lagna.dms = formatDMS(lagna.degree);

  // grahas
  const grahas = GRAHAS.map((id) => {
    const p = pos[id];
    const r = rashiOf(p.lon);
    const dignity = dignityOf(id, r.idx, r.degree);
    const retro = id === 'Rahu' || id === 'Ketu' ? true : p.speed < 0;
    return {
      id, hi: GRAHA_HI[id], en: GRAHA_EN[id], abbr: GRAHA_ABBR[id], abbrHi: GRAHA_ABBR_HI[id],
      lon: p.lon, tropLon: trop[id] != null ? trop[id] : null, lat: p.lat, speed: p.speed,
      retro,
      combust: isCombust(id, p.lon, pos.Surya.lon, p.speed),
      rashiIdx: r.idx, rashi: r.name, rashiHi: r.nameHi,
      degInRashi: r.degree, dms: formatDMS(r.degree),
      nakshatra: (() => { const n = nakshatraOf(p.lon); return { idx: n.idx, name: n.name, nameHi: n.nameHi, pada: n.pada }; })(),
      dignity,
      avastha: avasthaOf(r.degree, r.idx),
      house: houseOf(r.idx, lagna.idx),
      vargas: vargasOf(p.lon),
    };
  });
  // lagna vargas
  const lagnaVargas = vargasOf(lagnaLon);

  // whole-sign houses
  const houses = [];
  for (let i = 0; i < 12; i++) {
    const rashiIdx = (lagna.idx + i) % 12;
    houses.push({
      num: i + 1, rashiIdx, rashi: RASHIS[rashiIdx],
      grahaIds: grahas.filter((g) => g.house === i + 1).map((g) => g.id),
    });
  }

  // panchang (local civil date for vara)
  const localDate = new Date(birthDate.getTime() + input.utcOffsetHours * 3600000);
  const pan = panchangOf({
    sunSidereal: pos.Surya.lon, moonSidereal: pos.Chandra.lon,
    sunTropical: trop.Surya, moonTropical: trop.Chandra, localDate,
  });
  const moonR = rashiOf(pos.Chandra.lon);
  pan.varna = moonR.varna; pan.vashya = moonR.vashya; pan.tatva = moonR.tatva;

  // dasha
  const dasha = vimshottariDasha(birthDate, pan.nakshatra.idx, pan.nakshatra.fraction);

  // doshas
  const pmap = {};
  grahas.forEach((g) => (pmap[g.id] = g));
  const doshas = {
    manglik: manglikDosha(pmap, lagna.idx),
    kaalSarp: kaalSarpYoga(pmap, lagna.idx),
    pitra: pitraDosha(pmap, lagna.idx),
  };

  const kundli = {
    meta: {
      name: input.name || '', gender: input.gender || '',
      dateStr: input.dateStr, timeStr: input.timeStr, place: input.place || '',
      lat: input.lat, lon: input.lon, utcOffsetHours: input.utcOffsetHours,
      ayanamsaMode: input.ayanamsaMode || 'lahiri', nodeType: input.nodeType || 'mean',
      engineType: engineStatus().engineType,
      ayanamsa, jdUT, birthDate,
      isDayBirth: pmap.Surya.house === 1 || (pmap.Surya.house >= 7 && pmap.Surya.house <= 12),
      computedAt: new Date().toISOString(),
    },
    lagna: { lon: lagnaLon, rashiIdx: lagna.idx, rashi: lagna.name, rashiHi: lagna.nameHi, degree: lagna.degree, dms: lagna.dms, vargas: lagnaVargas, nakshatra: (() => { const n = nakshatraOf(lagnaLon); return { idx: n.idx, name: n.name, nameHi: n.nameHi, pada: n.pada }; })() },
    chandra: {
      lon: pos.Chandra.lon, rashiIdx: moonR.idx, rashi: moonR.name, rashiHi: moonR.nameHi,
      degree: moonR.degree, dms: formatDMS(moonR.degree), nakshatra: pan.nakshatra,
    },
    panchang: pan,
    grahas, houses, dasha, doshas,
    yogas: [], ashtakavarga: null, shadbala: [],
  };

  // Layer-2 extras (separate modules)
  kundli.yogas = detectYogas(kundli);
  kundli.ashtakavarga = ashtakavargaOf(kundli);
  kundli.shadbala = shadbalaOf(kundli);

  return kundli;
}

/** Lightweight: positions for any date (gochar/muhurat). Returns {jdUT, pos, trop, ayanamsa}. */
export async function positionsAt(date, nodeType = 'mean') {
  await initEngine();
  const jdUT = date.getTime() / 86400000 + 2440587.5;
  return { jdUT, pos: getPositions(jdUT, nodeType), trop: getTropical(jdUT), ayanamsa: getAyanamsa(jdUT) };
}

export { engineStatus };
