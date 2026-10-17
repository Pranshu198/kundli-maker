/**
 * Vimshottari Dasha — Mahadasha -> Antardasha -> Pratyantar -> Sookshm
 * with exact calendar dates. 1 dasha-year = 365.25 days (standard software convention).
 * Verified: fixture birth gives Rahu MD / Shukra AD ending ~22 Jul 2029 (janampatri).
 */
import { DASHA_SEQ, NAK_LORDS, GRAHA_HI, GRAHA_EN } from './constants.js';

export const YEAR_MS = 365.25 * 86400000;

const lordYears = (lord) => DASHA_SEQ.find((d) => d.lord === lord).years;

/**
 * @param {Date} birthDate
 * @param {number} nakIdx 0-26 Moon nakshatra
 * @param {number} nakFraction 0-1 traversed portion of nakshatra
 */
export function vimshottariDasha(birthDate, nakIdx, nakFraction) {
  const startLord = NAK_LORDS[nakIdx % 9];
  const startIdx = DASHA_SEQ.findIndex((d) => d.lord === startLord);
  const balanceYears = lordYears(startLord) * (1 - nakFraction);

  const mahadashas = [];
  let cursor = birthDate.getTime();
  for (let i = 0; i < 9; i++) {
    const seq = DASHA_SEQ[(startIdx + i) % 9];
    const years = i === 0 ? balanceYears : seq.years;
    const start = new Date(cursor);
    const end = new Date(cursor + years * YEAR_MS);
    mahadashas.push({
      lord: seq.lord, lordHi: GRAHA_HI[seq.lord], lordEn: GRAHA_EN[seq.lord],
      years, fullYears: seq.years, balance: i === 0,
      start, end,
    });
    cursor = end.getTime();
  }

  const api = {
    mahadashas,
    balanceYears,
    startLord,
    /** 9 antardashas within mahadasha i */
    antardashasOf(i) {
      const md = mahadashas[i];
      const mdStartIdx = DASHA_SEQ.findIndex((d) => d.lord === md.lord);
      const out = [];
      let c = md.start.getTime();
      for (let k = 0; k < 9; k++) {
        const seq = DASHA_SEQ[(mdStartIdx + k) % 9];
        const years = (md.years * seq.years) / 120;
        const start = new Date(c);
        const end = new Date(c + years * YEAR_MS);
        out.push({ lord: seq.lord, lordHi: GRAHA_HI[seq.lord], years, start, end, parent: md.lord });
        c = end.getTime();
      }
      return out;
    },
    /** 9 pratyantars within antardasha (mdI, adJ) */
    pratyantarsOf(mdI, adJ) {
      const ad = api.antardashasOf(mdI)[adJ];
      const adStartIdx = DASHA_SEQ.findIndex((d) => d.lord === ad.lord);
      const out = [];
      let c = ad.start.getTime();
      for (let k = 0; k < 9; k++) {
        const seq = DASHA_SEQ[(adStartIdx + k) % 9];
        const years = (ad.years * seq.years) / 120;
        const start = new Date(c);
        const end = new Date(c + years * YEAR_MS);
        out.push({ lord: seq.lord, lordHi: GRAHA_HI[seq.lord], years, start, end, parent: ad.lord, grandParent: ad.parent });
        c = end.getTime();
      }
      return out;
    },
    /** 9 sookshms within pratyantar (mdI, adJ, pdK) */
    sookshmasOf(mdI, adJ, pdK) {
      const pd = api.pratyantarsOf(mdI, adJ)[pdK];
      const pdStartIdx = DASHA_SEQ.findIndex((d) => d.lord === pd.lord);
      const out = [];
      let c = pd.start.getTime();
      for (let k = 0; k < 9; k++) {
        const seq = DASHA_SEQ[(pdStartIdx + k) % 9];
        const years = (pd.years * seq.years) / 120;
        const start = new Date(c);
        const end = new Date(c + years * YEAR_MS);
        out.push({ lord: seq.lord, lordHi: GRAHA_HI[seq.lord], years, start, end, parent: pd.lord });
        c = end.getTime();
      }
      return out;
    },
    /** running dasha at `at` (default now): {md, ad, pd, sookshm} with indices */
    current(at = new Date()) {
      const t = at.getTime();
      // beyond 120y? wrap note — clamp to last
      let mdI = mahadashas.findIndex((m) => t >= m.start.getTime() && t < m.end.getTime());
      if (mdI < 0) mdI = mahadashas.length - 1;
      const ads = api.antardashasOf(mdI);
      let adJ = ads.findIndex((a) => t >= a.start.getTime() && t < a.end.getTime());
      if (adJ < 0) adJ = ads.length - 1;
      const pds = api.pratyantarsOf(mdI, adJ);
      let pdK = pds.findIndex((p) => t >= p.start.getTime() && t < p.end.getTime());
      if (pdK < 0) pdK = pds.length - 1;
      const sks = api.sookshmasOf(mdI, adJ, pdK);
      let skL = sks.findIndex((s) => t >= s.start.getTime() && t < s.end.getTime());
      if (skL < 0) skL = sks.length - 1;
      return {
        md: { ...mahadashas[mdI], index: mdI },
        ad: { ...ads[adJ], index: adJ },
        pd: { ...pds[pdK], index: pdK },
        sookshm: { ...sks[skL], index: skL },
      };
    },
  };
  return api;
}

export function fmtDate(d) {
  if (!(d instanceof Date)) d = new Date(d);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

export function fmtDateLong(d) {
  if (!(d instanceof Date)) d = new Date(d);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
