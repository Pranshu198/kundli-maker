/**
 * Panchang + nakshatra attributes (Layer 2 — deterministic Vedic rules).
 * Fixes vs old omnitools core:
 *  - Yoga uses SIDEREAL Sun+Moon (old used tropical -> could shift yoga by ~48°)
 *  - Karana uses the proper 60-half-tithi sequence (old used idx % 11 — wrong after idx 7)
 *  - Vara from local civil date (old derived from JD_UTC)
 */
import {
  NAKSHATRAS, NAKSHATRA_HI, NAK_GANA, NAK_YONI, NAK_NADI, NAK_DEVATA, NAK_LORDS,
  TITHIS, TITHI_HI, VARAS, VARA_HI, YOGAS, YOGA_HI, karanaName,
  RASHIS, RASHI_HI, RASHI_VARNA, RASHI_VASHYA, RASHI_TATVA, RASHI_TATVA_HI,
} from './constants.js';
import { norm360 } from '../engine/sweph.js';

const NAK_SPAN = 360 / 27;      // 13°20'
const PADA_SPAN = 360 / 108;    // 3°20'

export function nakshatraOf(moonSidereal) {
  const lon = norm360(moonSidereal);
  const idx = Math.floor(lon / NAK_SPAN) % 27;
  const degInNak = lon - idx * NAK_SPAN;
  const pada = Math.floor(degInNak / PADA_SPAN) + 1;
  const name = NAKSHATRAS[idx];
  return {
    idx, name, nameHi: NAKSHATRA_HI[idx], pada,
    degInNakshatra: degInNak,
    fraction: degInNak / NAK_SPAN,
    lord: NAK_LORDS[idx % 9],
    gana: NAK_GANA[name], yoni: NAK_YONI[name], nadi: NAK_NADI[name], devata: NAK_DEVATA[name],
  };
}

export function rashiOf(siderealLon) {
  const lon = norm360(siderealLon);
  const idx = Math.floor(lon / 30) % 12;
  return {
    idx, name: RASHIS[idx], nameHi: RASHI_HI[idx],
    degree: lon - idx * 30,
    varna: RASHI_VARNA[RASHIS[idx]], vashya: RASHI_VASHYA[RASHIS[idx]],
    tatva: [RASHI_TATVA[idx], RASHI_TATVA_HI[idx]],
  };
}

/**
 * @param {Object} p
 * @param {number} p.sunSidereal, p.moonSidereal — sidereal longitudes
 * @param {number} p.sunTropical, p.moonTropical — tropical longitudes
 * @param {Date} p.localDate — civil local date (for vara)
 */
export function panchangOf({ sunSidereal, moonSidereal, sunTropical, moonTropical, localDate }) {
  const elongation = norm360(moonTropical - sunTropical); // 0-360

  // Tithi
  const tithiIdx = Math.floor(elongation / 12); // 0-29
  const paksha = tithiIdx < 15 ? ['Shukla', 'शुक्ल'] : ['Krishna', 'कृष्ण'];

  // Karana — proper 60-sequence
  const karanaIdx = Math.floor(elongation / 6); // 0-59
  const karana = karanaName(karanaIdx);

  // Yoga — from SIDEREAL longitudes (classical)
  const yogaLong = norm360(sunSidereal + moonSidereal);
  const yogaIdx = Math.floor(yogaLong / NAK_SPAN) % 27;

  // Vara — from local civil date
  const varaIdx = localDate.getDay(); // 0 = Sunday

  const nak = nakshatraOf(moonSidereal);

  return {
    tithi: { idx: tithiIdx, name: TITHIS[tithiIdx], nameHi: TITHI_HI[tithiIdx], paksha, elongation: +elongation.toFixed(3) },
    karana: { idx: karanaIdx, name: karana[0], nameHi: karana[1] },
    yoga: { idx: yogaIdx, name: YOGAS[yogaIdx], nameHi: YOGA_HI[yogaIdx], longitude: +yogaLong.toFixed(3) },
    vara: { idx: varaIdx, name: VARAS[varaIdx], nameHi: VARA_HI[varaIdx] },
    nakshatra: nak,
  };
}

export function formatDMS(deg) {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = ((deg - d) * 60 - m) * 60;
  return `${d}° ${String(m).padStart(2, '0')}' ${s.toFixed(1)}"`;
}

export function formatDegMin(deg) {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}'`;
}
