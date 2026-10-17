/**
 * Parashari Shodasvarga (divisional charts) — verified formulas.
 * Fixes vs old omnitools core (which used (s*k + n) % 12 shortcuts that are
 * wrong for D7/D9/D10/D12 and for even-sign D30):
 *  D9: chara (s+n), sthira (s+8+n), dwisva (s+4+n)
 *  D10: odd (s+n), even (s+8+n)
 *  D7: odd (s+n), even (s+6+n)
 *  D12: (s+n)
 *  D30: odd [Aries,Aquarius,Sagittarius,Gemini,Libra] / even [Taurus,Virgo,Pisces,Capricorn,Scorpio]
 *  D16: movable->Mesha, fixed->Simha, dual->Dhanu
 *  D20: movable->Mesha, fixed->Dhanu, dual->Simha
 *  D24: odd->Simha, even->Karka
 *  D27: fiery->Mesha, earthy->Karka, airy->Tula, watery->Makara
 *  D40: odd->Mesha, even->Tula
 *  D45: odd->Mesha, even->Simha
 *  D60: counted from Mesha
 */
import { RASHIS, RASHI_HI } from './constants.js';

const norm12 = (n) => ((n % 12) + 12) % 12;
const isOddSign = (s) => s % 2 === 0; // Mesh(0) is odd
const isMovable = (s) => [0, 3, 6, 9].includes(s);
const isFixed = (s) => [1, 4, 7, 10].includes(s);

function vargaResult(key, rashiIdx, degree, span) {
  return {
    key, rashiIdx, rashi: RASHIS[rashiIdx], rashiHi: RASHI_HI[rashiIdx],
    degree: +degree.toFixed(4), span,
  };
}

/** All vargas for one sidereal longitude. */
export function vargasOf(siderealLon) {
  const s = Math.floor(siderealLon / 30) % 12;
  const deg = siderealLon - Math.floor(siderealLon / 30) * 30;
  const V = {};

  V.D1 = vargaResult('D1', s, deg, 30);

  // D2 Hora
  let d2;
  if (isOddSign(s)) d2 = deg < 15 ? 4 : 3;
  else d2 = deg < 15 ? 3 : 4;
  V.D2 = vargaResult('D2', d2, (deg % 15) * 2, 15);

  // D3 Drekkana
  const q3 = Math.floor(deg / 10);
  V.D3 = vargaResult('D3', norm12(s + q3 * 4), (deg % 10) * 3, 10);

  // D4 Chaturthamsha — kendras from the sign
  const q4 = Math.floor(deg / 7.5);
  V.D4 = vargaResult('D4', norm12(s + q4 * 3), (deg % 7.5) * 4, 7.5);

  // D7 Saptamsha
  const n7 = Math.floor(deg / (30 / 7));
  const d7 = isOddSign(s) ? norm12(s + n7) : norm12(s + 6 + n7);
  V.D7 = vargaResult('D7', d7, (deg % (30 / 7)) * 7, 30 / 7);

  // D9 Navamsha
  const n9 = Math.floor(deg / (30 / 9));
  let d9;
  if (isMovable(s)) d9 = norm12(s + n9);
  else if (isFixed(s)) d9 = norm12(s + 8 + n9);
  else d9 = norm12(s + 4 + n9);
  V.D9 = { ...vargaResult('D9', d9, (deg % (30 / 9)) * 9, 30 / 9), vargottama: d9 === s };

  // D10 Dashamsha
  const n10 = Math.floor(deg / 3);
  const d10 = isOddSign(s) ? norm12(s + n10) : norm12(s + 8 + n10);
  V.D10 = vargaResult('D10', d10, (deg % 3) * 10, 3);

  // D12 Dwadashamsha
  const n12 = Math.floor(deg / 2.5);
  V.D12 = vargaResult('D12', norm12(s + n12), (deg % 2.5) * 12, 2.5);

  // D16 Shodashamsha
  const n16 = Math.floor(deg / 1.875);
  const start16 = isMovable(s) ? 0 : isFixed(s) ? 4 : 8;
  V.D16 = vargaResult('D16', norm12(start16 + n16), (deg % 1.875) * 16, 1.875);

  // D20 Vimshamsha
  const n20 = Math.floor(deg / 1.5);
  const start20 = isMovable(s) ? 0 : isFixed(s) ? 8 : 4;
  V.D20 = vargaResult('D20', norm12(start20 + n20), (deg % 1.5) * 20, 1.5);

  // D24 Chaturvimshamsha
  const n24 = Math.floor(deg / 1.25);
  const start24 = isOddSign(s) ? 4 : 3;
  V.D24 = vargaResult('D24', norm12(start24 + n24), (deg % 1.25) * 24, 1.25);

  // D27 Bhamsha — by element
  const n27 = Math.floor(deg / (30 / 27));
  const el = s % 4; // 0 fire, 1 earth, 2 air, 3 water
  const start27 = [0, 3, 6, 9][el];
  V.D27 = vargaResult('D27', norm12(start27 + n27), (deg % (30 / 27)) * 27, 30 / 27);

  // D30 Trimshamsha — unequal divisions
  let d30;
  if (isOddSign(s)) {
    d30 = deg < 5 ? 0 : deg < 10 ? 10 : deg < 18 ? 8 : deg < 25 ? 2 : 6;
  } else {
    d30 = deg < 5 ? 1 : deg < 12 ? 5 : deg < 20 ? 11 : deg < 25 ? 9 : 7;
  }
  V.D30 = vargaResult('D30', d30, deg, 1);

  // D40 Khavedamsha
  const n40 = Math.floor(deg / 0.75);
  const start40 = isOddSign(s) ? 0 : 6;
  V.D40 = vargaResult('D40', norm12(start40 + n40), (deg % 0.75) * 40, 0.75);

  // D45 Akshavedamsha
  const n45 = Math.floor(deg / (30 / 45));
  const start45 = isOddSign(s) ? 0 : 4;
  V.D45 = vargaResult('D45', norm12(start45 + n45), (deg % (30 / 45)) * 45, 30 / 45);

  // D60 Shashtiamsha — counted from Mesha
  const n60 = Math.floor(deg / 0.5);
  V.D60 = vargaResult('D60', norm12(n60), (deg % 0.5) * 60, 0.5);

  return V;
}

/** Divisional chart metadata for UI. */
export const VARGA_INFO = {
  D1: ['Rashi', 'राशि', 'Overall life'],
  D2: ['Hora', 'होरा', 'Wealth'],
  D3: ['Drekkana', 'द्रेष्काण', 'Siblings, courage'],
  D4: ['Chaturthamsha', 'चतुर्थांश', 'Property, fortune'],
  D7: ['Saptamsha', 'सप्तांश', 'Children'],
  D9: ['Navamsha', 'नवांश', 'Marriage, dharma'],
  D10: ['Dashamsha', 'दशमांश', 'Career'],
  D12: ['Dwadashamsha', 'द्वादशांश', 'Parents'],
  D16: ['Shodashamsha', 'षोडशांश', 'Vehicles, comfort'],
  D20: ['Vimshamsha', 'विंशांश', 'Spiritual progress'],
  D24: ['Chaturvimshamsha', 'चतुर्विंशांश', 'Education'],
  D27: ['Bhamsha', 'भांश', 'Strength'],
  D30: ['Trimshamsha', 'त्रिंशांश', 'Evils, misfortunes'],
  D40: ['Khavedamsha', 'खवेदांश', 'Maternal'],
  D45: ['Akshavedamsha', 'अक्षवेदांश', 'Paternal'],
  D60: ['Shashtiamsha', 'षष्ट्यांश', 'Past karma'],
};
