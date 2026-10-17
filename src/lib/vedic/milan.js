/**
 * Kundli Milan — Ashtakoota 36-point compatibility.
 * Standard 8 kootas: varna(1), vashya(2), tara(3), yoni(4), grahaMaitri(5),
 * gana(6), bhakoot(7), nadi(8). Plus Manglik comparison via doshas.manglikDosha.
 *
 * FIX vs old core: Karka vashya = Jalchar (old core wrongly said Vanchar).
 * Vashya map taken from constants.js RASHI_VASHYA.
 */
import {
  RASHIS, RASHI_LORDS, RASHI_VARNA, RASHI_VASHYA,
  NAK_GANA, NAK_YONI, NAK_NADI, YONI_ENEMIES,
} from './constants.js';
import { manglikDosha } from './doshas.js';

const TARA_NAMES = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhana', 'Naidhana', 'Mitra', 'Atimitra'];
const TARA_HI = ['जन्म', 'संपत्', 'विपत्', 'क्षेम', 'प्रत्यरि', 'साधन', 'नैधन', 'मित्र', 'अतिमित्र'];
const GOOD_TARA_REMAINDER = new Set([2, 4, 6, 8, 0]); // remainder 0 = 9th tara

const VARNA_ORDER = ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra'];

// Classical natural friendship (BPHS)
const FRIENDS = {
  Surya: ['Chandra', 'Mangal', 'Guru'],
  Chandra: ['Surya', 'Budh'],
  Mangal: ['Surya', 'Chandra', 'Guru'],
  Budh: ['Surya', 'Shukra'],
  Guru: ['Surya', 'Chandra', 'Mangal'],
  Shukra: ['Budh', 'Shani'],
  Shani: ['Budh', 'Shukra'],
};
const ENEMIES = {
  Surya: ['Shukra', 'Shani'],
  Chandra: [],
  Mangal: ['Budh'],
  Budh: ['Chandra'],
  Guru: ['Budh', 'Shukra'],
  Shukra: ['Surya', 'Chandra'],
  Shani: ['Surya', 'Chandra', 'Mangal'],
};
function relation(a, b) {
  if (a === b) return 'friend';
  if ((FRIENDS[a] || []).includes(b)) return 'friend';
  if ((ENEMIES[a] || []).includes(b)) return 'enemy';
  return 'neutral';
}

function genderOf(kundli) {
  const g = String(kundli?.meta?.gender || '').trim().toLowerCase();
  if (/^(f|female|girl|ladki|kanya|kanya\b|स्त्री|कन्या)/.test(g)) return 'F';
  if (/^(m|male|boy|ladka|var|groom|पुरुष|वर)/.test(g)) return 'M';
  return null;
}

function moonRashiIdx(kundli) { return kundli.chandra.rashiIdx; }
function moonRashiName(kundli) { return RASHIS[kundli.chandra.rashiIdx]; }
function nakName(kundli) { return kundli.chandra.nakshatra.name; }

function planetMap(kundli) {
  const m = {};
  for (const g of kundli.grahas) {
    m[g.id] = { rashiIdx: g.rashiIdx, dignity: g.dignity, lon: g.lon };
  }
  return m;
}

function varnaKoota(varK, kanyaK) {
  const vVar = RASHI_VARNA[moonRashiName(varK)][0];
  const vKanya = RASHI_VARNA[moonRashiName(kanyaK)][0];
  const ok = VARNA_ORDER.indexOf(vKanya) >= VARNA_ORDER.indexOf(vVar);
  return {
    name: 'Varna', nameHi: 'वर्ण', points: ok ? 1 : 0, maxPoints: 1,
    aValue: vVar, bValue: vKanya,
    description: ok
      ? `Var (${vVar}) + Kanya (${vKanya}) — groom's varna is equal/higher; spiritual/ego harmony. / वर (${vVar}) + कन्या (${vKanya}) — अनुकूल।`
      : `Var (${vVar}) + Kanya (${vKanya}) — kanya's varna is higher than groom's; mismatch. / प्रतिकूल।`,
  };
}

function vashyaKoota(varK, kanyaK) {
  const vA = RASHI_VASHYA[moonRashiName(varK)][0];
  const vB = RASHI_VASHYA[moonRashiName(kanyaK)][0];
  let points = 0;
  if (vA === vB) points = 2;
  else if ((vA === 'Manav' && vB === 'Chatushpad') || (vA === 'Chatushpad' && vB === 'Manav')) points = 1;
  return {
    name: 'Vashya', nameHi: 'वश्य', points, maxPoints: 2,
    aValue: vA, bValue: vB,
    description: points === 2
      ? `Both ${vA} — strong mutual attraction. / दोनों ${vA} — पूर्ण आकर्षण।`
      : points === 1
        ? `${vA} + ${vB} — moderate attraction. / मध्यम आकर्षण।`
        : `${vA} + ${vB} — weak mutual attraction. / क्षीण आकर्षण।`,
  };
}

function taraKoota(varK, kanyaK) {
  const nA = varK.chandra.nakshatra.idx;
  const nB = kanyaK.chandra.nakshatra.idx;
  const countAB = ((nB - nA + 27) % 27) + 1;
  const countBA = ((nA - nB + 27) % 27) + 1;
  const rAB = countAB % 9, rBA = countBA % 9;
  const goodAB = GOOD_TARA_REMAINDER.has(rAB);
  const goodBA = GOOD_TARA_REMAINDER.has(rBA);
  const tAB = TARA_NAMES[rAB === 0 ? 8 : rAB - 1];
  const tBA = TARA_NAMES[rBA === 0 ? 8 : rBA - 1];
  const points = goodAB && goodBA ? 3 : (goodAB || goodBA) ? 1.5 : 0;
  return {
    name: 'Tara', nameHi: 'तारा', points, maxPoints: 3,
    aValue: `${nakName(varK)} → ${tAB}`, bValue: `${nakName(kanyaK)} → ${tBA}`,
    description: points === 3
      ? `Both taras auspicious (${tAB}, ${tBA}) — health & fortune harmony. / दोनों तारा शुभ — स्वास्थ्य व भाग्य में सामंजस्य।`
      : points === 1.5
        ? `One auspicious tara (${goodAB ? tAB : tBA}) — partial support. / एक तारा शुभ — आंशिक।`
        : `Inauspicious taras (${tAB}, ${tBA}) — health caution. / अशुभ तारा — स्वास्थ्य हेतु सावधानी।`,
  };
}

function yoniKoota(varK, kanyaK) {
  const yA = NAK_YONI[nakName(varK)]; // [en, hi, gender]
  const yB = NAK_YONI[nakName(kanyaK)];
  let points;
  let desc;
  if (yA[0] === yB[0]) {
    points = 4; desc = `Same yoni (${yA[0]}, ${yA[1]}) — highest physical compatibility. / समान योनि — उत्तम शारीरिक सामंजस्य।`;
  } else if (YONI_ENEMIES[yA[0]] === yB[0]) {
    points = 0; desc = `Enemy yonis (${yA[0]} vs ${yB[0]}) — incompatibility. / शत्रु योनि — असामंजस्य।`;
  } else if (yA[2] !== yB[2]) {
    points = 3; desc = `${yA[0]} (${yA[2]}) + ${yB[0]} (${yB[2]}) — good compatibility. / अच्छी योनि मैत्री।`;
  } else {
    points = 2; desc = `${yA[0]} + ${yB[0]} — moderate compatibility. / मध्यम सामंजस्य।`;
  }
  return {
    name: 'Yoni', nameHi: 'योनि', points, maxPoints: 4,
    aValue: `${yA[0]} (${yA[1]}, ${yA[2]})`, bValue: `${yB[0]} (${yB[1]}, ${yB[2]})`,
    description: desc,
  };
}

function maitriKoota(varK, kanyaK) {
  const lordA = RASHI_LORDS[moonRashiIdx(varK)];
  const lordB = RASHI_LORDS[moonRashiIdx(kanyaK)];
  const rAB = relation(lordA, lordB);
  const rBA = relation(lordB, lordA);
  let points;
  if (rAB === 'friend' && rBA === 'friend') points = 5;
  else if ((rAB === 'friend' && rBA === 'neutral') || (rAB === 'neutral' && rBA === 'friend')) points = 4;
  else if (rAB === 'neutral' && rBA === 'neutral') points = 3;
  else if ((rAB === 'friend' && rBA === 'enemy') || (rAB === 'enemy' && rBA === 'friend')) points = 2;
  else if ((rAB === 'neutral' && rBA === 'enemy') || (rAB === 'enemy' && rBA === 'neutral')) points = 1;
  else points = 0;
  return {
    name: 'Graha Maitri', nameHi: 'ग्रह मैत्री', points, maxPoints: 5,
    aValue: `${lordA} (${RASHIS[moonRashiIdx(varK)]} lord)`,
    bValue: `${lordB} (${RASHIS[moonRashiIdx(kanyaK)]} lord)`,
    description: `${lordA}→${lordB}: ${rAB}; ${lordB}→${lordA}: ${rBA} — mental compatibility ${points >= 4 ? 'strong' : points >= 3 ? 'moderate' : 'weak'}. / मानसिक सामंजस्य ${points >= 4 ? 'प्रबल' : points >= 3 ? 'मध्यम' : 'क्षीण'}।`,
  };
}

function ganaKoota(varK, kanyaK) {
  const gA = NAK_GANA[nakName(varK)][0];
  const gB = NAK_GANA[nakName(kanyaK)][0];
  let points;
  if (gA === gB) points = 6;
  else if ((gA === 'Deva' && gB === 'Manushya') || (gA === 'Manushya' && gB === 'Deva')) points = 5;
  else if ((gA === 'Manushya' && gB === 'Rakshasa') || (gA === 'Rakshasa' && gB === 'Manushya')) points = 2;
  else if (gA === 'Deva' && gB === 'Rakshasa') points = 1;
  else points = 0; // Rakshasa var + Deva kanya
  return {
    name: 'Gana', nameHi: 'गण', points, maxPoints: 6,
    aValue: gA, bValue: gB,
    description: `${gA} + ${gB} gana — temperament compatibility ${points >= 5 ? 'excellent' : points >= 2 ? 'workable' : 'difficult'}. / स्वभाव सामंजस्य ${points >= 5 ? 'उत्तम' : points >= 2 ? 'कार्यसाधक' : 'कठिन'}।`,
  };
}

function bhakootKoota(varK, kanyaK) {
  const rA = moonRashiIdx(varK), rB = moonRashiIdx(kanyaK);
  // Classical 1-indexed count: girl's rashi as 1 → boy's rashi. Dosha sets are
  // symmetric pairs (6-8, 9-5, 12-2), so one direction suffices.
  const count = ((rA - rB + 12) % 12) + 1;
  let dosha = null;
  if (count === 6 || count === 8) dosha = 'Shadashtak (6-8)';
  else if (count === 5 || count === 9) dosha = 'Navam-Pancham (9-5)';
  else if (count === 2 || count === 12) dosha = 'Dwir-Dwadash (12-2)';
  return {
    name: 'Bhakoot', nameHi: 'भकूट', points: dosha ? 0 : 7, maxPoints: 7,
    aValue: RASHIS[rA], bValue: RASHIS[rB],
    description: dosha
      ? `Bhakoot dosha: ${dosha} — ${RASHIS[rB]} → ${RASHIS[rA]} (count ${count}); family/financial caution. / भकूट दोष (${dosha}) — शांति पूजा परंपरागत उपाय।`
      : `No bhakoot dosha (count ${count}) — love & family harmony supported. / भकूट दोष नहीं — प्रेम व पारिवारिक सुख में सहायक।`,
  };
}

function nadiKoota(varK, kanyaK) {
  const nA = NAK_NADI[nakName(varK)][0];
  const nB = NAK_NADI[nakName(kanyaK)][0];
  const same = nA === nB;
  return {
    name: 'Nadi', nameHi: 'नाड़ी', points: same ? 0 : 8, maxPoints: 8,
    aValue: nA, bValue: nB,
    description: same
      ? `Same nadi (${nA}) — Nadi dosha. Classical cancellation: same rashi with different nakshatra, or same nakshatra with different pada, cancels it. / समान नाड़ी — नाड़ी दोष; किंतु समान राशि-भिन्न नक्षत्र या समान नक्षत्र-भिन्न चरण होने पर दोष भंग माना जाता है।`
      : `${nA} + ${nB} — no nadi dosha; progeny/health compatibility supported. / नाड़ी दोष नहीं — उत्तम।`,
  };
}

/**
 * @param {Object} kA first kundli (per SPEC shape)
 * @param {Object} kB second kundli
 * @returns {{ kootas, total, maxTotal, percentage, verdict, verdictHi, manglik, recommendations }}
 */
export function milanOf(kA, kB) {
  const gA = genderOf(kA), gB = genderOf(kB);
  // classical roles: groom (var) + bride (kanya); fall back to a=var, b=kanya
  let varK = kA, kanyaK = kB;
  if (gA === 'F' && gB === 'M') { varK = kB; kanyaK = kA; }

  const kootas = [
    varnaKoota(varK, kanyaK),
    vashyaKoota(varK, kanyaK),
    taraKoota(varK, kanyaK),
    yoniKoota(varK, kanyaK),
    maitriKoota(varK, kanyaK),
    ganaKoota(varK, kanyaK),
    bhakootKoota(varK, kanyaK),
    nadiKoota(varK, kanyaK),
  ];
  const total = kootas.reduce((s, k) => s + k.points, 0);
  const maxTotal = 36;
  const percentage = +(total / maxTotal * 100).toFixed(1);

  let verdict, verdictHi;
  if (total >= 32) { verdict = 'Excellent Match (Uttam) — highly recommended'; verdictHi = 'उत्तम मिलान — अत्यंत शुभ'; }
  else if (total >= 24) { verdict = 'Good Match (Shubh) — recommended'; verdictHi = 'शुभ मिलान — अनुशंसित'; }
  else if (total >= 18) { verdict = 'Average Match (Madhyam) — acceptable, remedies advised'; verdictHi = 'मध्यम मिलान — स्वीकार्य, उपाय सहित'; }
  else { verdict = 'Below Average (Ashubh) — not recommended'; verdictHi = 'अशुभ मिलान — अनुशंसित नहीं'; }

  const mA = manglikDosha(planetMap(kA), kA.lagna.rashiIdx);
  const mB = manglikDosha(planetMap(kB), kB.lagna.rashiIdx);

  const recommendations = [];
  if (mA.present && !mB.present) recommendations.push({ type: 'warning', text: 'A is Manglik, B is not — Manglik dosha nivaran advised before marriage. / एक पक्ष मांगलिक — विवाह पूर्व मांगलिक शांति परंपरागत उपाय।' });
  if (!mA.present && mB.present) recommendations.push({ type: 'warning', text: 'B is Manglik, A is not — Manglik dosha nivaran advised before marriage.' });
  if (mA.present && mB.present) recommendations.push({ type: 'info', text: 'Both are Manglik — dosha is traditionally considered cancelled. / दोनों मांगलिक — दोष भंग माना जाता है।' });
  const nadi = kootas[7], bhakoot = kootas[6];
  if (nadi.points === 0) recommendations.push({ type: 'warning', text: 'Nadi dosha present — consult a pandit for Nadi dosha nivaran; check the same-rashi/same-nakshatra cancellation. / नाड़ी दोष — भंग नियम जांचें।' });
  if (bhakoot.points === 0) recommendations.push({ type: 'warning', text: 'Bhakoot dosha present — Bhakoot shanti is the traditional remedy. / भकूट दोष — शांति पूजा परंपरागत उपाय।' });
  if (total >= 18 && total < 24) recommendations.push({ type: 'remedy', text: 'Average score — pre-marriage Gauri-Ganesh puja and daan are traditionally advised. / मध्यम अंक — विवाह पूर्व गौरी-गणेश पूजा परंपरागत।' });

  return {
    kootas, total, maxTotal, percentage, verdict, verdictHi,
    manglik: {
      a: { present: mA.present, rawPresent: mA.rawPresent, fullyCancelled: mA.fullyCancelled, fromLagna: mA.fromLagna, fromMoon: mA.fromMoon, fromShukra: mA.fromShukra },
      b: { present: mB.present, rawPresent: mB.rawPresent, fullyCancelled: mB.fullyCancelled, fromLagna: mB.fromLagna, fromMoon: mB.fromMoon, fromShukra: mB.fromShukra },
    },
    recommendations,
  };
}
