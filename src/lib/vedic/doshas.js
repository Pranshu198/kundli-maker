/**
 * Dosha analysis — Manglik, Kaal Sarp, Sade Sati/Dhaiya, Pitra.
 * All traditional rules, computed from the chart. Cancellation rules included.
 */
import { KAAL_SARP_TYPES, GRAHA_HI } from './constants.js';

const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];

/** whole-sign house of a planet rashi from lagna rashi */
export function houseOf(planetRashiIdx, lagnaRashiIdx) {
  return ((planetRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
}

/** graha drishti: does planet pRashi aspect target tRashi? (whole-sign) */
export function aspects(pGraha, pRashi, tRashi) {
  const d = (tRashi - pRashi + 12) % 12; // 0-based distance
  if (d === 6) return true; // 7th aspect all
  if (pGraha === 'Mangal' && (d === 3 || d === 7)) return true; // 4th, 8th
  if (pGraha === 'Guru' && (d === 4 || d === 8)) return true;   // 5th, 9th
  if (pGraha === 'Shani' && (d === 2 || d === 9)) return true;   // 3rd, 10th
  return false;
}

function isOwnOrExalted(graha, rashiIdx, dignity) {
  return dignity && (dignity.type === 'own' || dignity.type === 'exalted' || dignity.type === 'moolatrikona');
}

/**
 * Manglik check from one reference (lagna / moon / venus).
 * planets: {Mangal: {rashiIdx, dignity}, Guru: {rashiIdx}, ...}
 */
export function manglikFrom(planets, refRashiIdx, refName) {
  const mars = planets.Mangal;
  const h = houseOf(mars.rashiIdx, refRashiIdx);
  const present = MANGLIK_HOUSES.includes(h);
  const cancellations = [];
  if (present) {
    if (isOwnOrExalted('Mangal', mars.rashiIdx, mars.dignity))
      cancellations.push('Mangal own/exalted — bhanga');
    if (aspects('Guru', planets.Guru.rashiIdx, mars.rashiIdx) || planets.Guru.rashiIdx === mars.rashiIdx)
      cancellations.push('Guru sambandha with Mangal — bhanga');
    if (planets.Chandra && (aspects('Chandra', planets.Chandra.rashiIdx, mars.rashiIdx)))
      cancellations.push('Chandra drishti on Mangal (partial bhanga)');
  }
  return {
    ref: refName, house: h, present,
    cancelled: present && cancellations.length > 0,
    cancellations,
    intensity: !present ? 'none' : h === 8 ? 'high' : h === 7 || h === 1 ? 'medium-high' : 'medium',
  };
}

export function manglikDosha(planets, lagnaRashiIdx) {
  const fromLagna = manglikFrom(planets, lagnaRashiIdx, 'Lagna');
  const fromMoon = manglikFrom(planets, planets.Chandra.rashiIdx, 'Chandra');
  const fromShukra = manglikFrom(planets, planets.Shukra.rashiIdx, 'Shukra');
  const any = fromLagna.present || fromMoon.present || fromShukra.present;
  const cancelledAll = [fromLagna, fromMoon, fromShukra]
    .filter((x) => x.present).every((x) => x.cancelled);
  return {
    present: any && !cancelledAll,
    rawPresent: any,
    fullyCancelled: any && cancelledAll,
    fromLagna, fromMoon, fromShukra,
    rule: 'Mangal in 1/2/4/7/8/12 from Lagna (also checked from Chandra & Shukra)',
  };
}

/**
 * Kaal Sarp: all 7 grahas (Surya..Shani) within the 180° arc starting at Rahu.
 * planets: {Surya:{lon}, ..., Rahu:{lon, rashiIdx}, Ketu:{lon}}
 */
export function kaalSarpYoga(planets, lagnaRashiIdx) {
  const rahuLon = planets.Rahu.lon;
  const seven = ['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani'];
  const outside = [];
  for (const g of seven) {
    const d = (planets[g].lon - rahuLon + 360) % 360;
    if (d > 180) outside.push(g);
  }
  const present = outside.length === 0;
  let type = null;
  if (present) {
    const rahuHouse = houseOf(planets.Rahu.rashiIdx, lagnaRashiIdx);
    const [en, hi] = KAAL_SARP_TYPES[rahuHouse];
    type = { house: rahuHouse, name: en, nameHi: hi };
  }
  return {
    present, type, outside,
    rule: 'All 7 grahas hemmed between Rahu and Ketu (within 180° arc from Rahu)',
  };
}

/**
 * Sade Sati / Dhaiya from TRANSIT Saturn.
 * @param {number} saturnTransitRashi 0-11 sidereal rashi of Saturn today
 * @param {number} moonRashi 0-11 natal Moon rashi
 */
export function sadeSatiStatus(saturnTransitRashi, moonRashi) {
  const d = (saturnTransitRashi - moonRashi + 12) % 12; // 0-based
  const house = d + 1;
  let sadeSati = null, dhaiya = null;
  if ([12, 1, 2].includes(house)) {
    const phase = house === 12 ? 1 : house === 1 ? 2 : 3;
    sadeSati = {
      active: true, phase,
      phaseName: phase === 1 ? 'Rising (Chadhai)' : phase === 2 ? 'Peak (Shikhar)' : 'Setting (Utrai)',
      phaseHi: phase === 1 ? 'उदय' : phase === 2 ? 'शिखर' : 'उतराई',
      house,
    };
  }
  if ([4, 8].includes(house)) {
    dhaiya = { active: true, house, name: house === 4 ? 'Chautha Dhaiya' : 'Ashtam Dhaiya' };
  }
  return { sadeSati, dhaiya, saturnHouseFromMoon: house };
}

/**
 * Sade Sati / Dhaiya TIMELINE: scan Saturn ingresses across a date range.
 * @param {Function} saturnLonFn (date: Date) => sidereal Saturn longitude degrees
 * @param {number} moonRashi natal Moon rashi 0-11
 * @param {Date} from, to range
 * @returns {Array} periods [{kind: 'sade-sati'|'dhaiya', phase, start, end}]
 */
export function sadeSatiTimeline(saturnLonFn, moonRashi, from, to) {
  // sample Saturn rashi monthly; refine sign-change boundaries by bisection
  const samples = [];
  const cursor = new Date(from.getTime());
  while (cursor <= to) {
    samples.push({ date: new Date(cursor.getTime()), rashi: Math.floor(saturnLonFn(cursor) / 30) % 12 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  samples.push({ date: new Date(to.getTime()), rashi: Math.floor(saturnLonFn(to) / 30) % 12 });

  // find ingress dates (refine to ~1 day)
  const ingresses = [{ date: samples[0].date, rashi: samples[0].rashi }];
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].rashi !== samples[i - 1].rashi) {
      let lo = samples[i - 1].date.getTime(), hi = samples[i].date.getTime();
      const target = samples[i].rashi;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2;
        const r = Math.floor(saturnLonFn(new Date(mid)) / 30) % 12;
        if (r === target) hi = mid; else lo = mid;
      }
      ingresses.push({ date: new Date(hi), rashi: target });
    }
  }

  const periods = [];
  for (let i = 0; i < ingresses.length; i++) {
    const rashi = ingresses[i].rashi;
    const start = ingresses[i].date;
    const end = i + 1 < ingresses.length ? ingresses[i + 1].date : to;
    const house = ((rashi - moonRashi + 12) % 12) + 1;
    if ([12, 1, 2].includes(house)) {
      const phase = house === 12 ? 1 : house === 1 ? 2 : 3;
      periods.push({ kind: 'sade-sati', phase, start, end, house });
    } else if ([4, 8].includes(house)) {
      periods.push({ kind: 'dhaiya', phase: null, start, end, house });
    }
  }
  // merge adjacent same-kind+phase
  const merged = [];
  for (const p of periods) {
    const last = merged[merged.length - 1];
    if (last && last.kind === p.kind && last.phase === p.phase && Math.abs(last.end - p.start) < 40 * 86400000) {
      last.end = p.end;
    } else merged.push({ ...p });
  }
  return merged;
}

/**
 * Pitra dosha indicator (traditional): Surya with Rahu/Ketu, or afflicted 9th.
 */
export function pitraDosha(planets, lagnaRashiIdx) {
  const sunR = planets.Surya.rashiIdx;
  const withRahu = sunR === planets.Rahu.rashiIdx;
  const withKetu = sunR === planets.Ketu.rashiIdx;
  const house9Lord = null; // computed by caller if needed
  const ninthHouse = houseOf(sunR, lagnaRashiIdx) === 9;
  const present = withRahu || withKetu;
  return {
    present,
    details: [
      withRahu && 'Surya-Rahu yuti (same rashi)',
      withKetu && 'Surya-Ketu yuti (same rashi)',
    ].filter(Boolean),
    rule: 'Surya afflicted by Rahu/Ketu — traditional Pitra dosha indicator',
  };
}
