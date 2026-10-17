/**
 * Shadbala — sixfold planetary strength for Surya..Shani.
 *
 * HONEST components only: every sub-bala below is computed from the chart or a
 * documented classical table. Nothing is invented, randomised, or fudged.
 *
 * ── Sthana bala ─────────────────────────────────────────────────────────────
 * uchcha:       60 at the deepest exaltation point → 0 at the deepest
 *                debilitation point, linear in ecliptic distance.
 * saptavargaja: dignity in D1, D2, D3, D7, D9, D10, D30. Scale (virupas/varga):
 *                  exalted 20, moolatrikona 18, own 15, friend 10,
 *                  neutral 7, enemy 5, debilitated 3.
 *                (Standard 7-varga scheme; great-friend/great-enemy grades are
 *                folded into friend/enemy because dignityOf() returns a single
 *                grade. Maximum 7 × 20 = 140 virupas.)
 * ojhayugma:    15 virupas — Surya/Mangal/Guru in odd rashi, Chandra/Shukra/
 *                Shani in even rashi (Budh: 0). Odd rashi = rashiIdx even
 *                (Mesh = 0 is odd), matching vargas.js isOddSign.
 * kendra:       60 in kendra (1,4,7,10), 30 in panaphara (2,5,8,11),
 *                15 in apoklima (3,6,9,12).
 * drekkana:     15 — Mangal in 1st drekkana, Shani in 2nd, Guru in 3rd.
 * ── Dig bala ────────────────────────────────────────────────────────────────
 * 60 at the planet's directional peak house, 0 at the opposite house,
 * 30 elsewhere. Peaks: Surya/Mangal 10th, Chandra/Shukra 4th,
 * Budh/Guru 1st, Shani 7th (houses from Lagna).
 * ── Kala bala ───────────────────────────────────────────────────────────────
 * natonnata: 60 — day birth: Surya, Guru, Shukra (+Budh always);
 *                        night birth: Chandra, Mangal, Shani (+Budh always).
 * paksha:    60 — Shukla paksha (waxing): Guru, Shukra, Budh, Chandra;
 *                        Krishna paksha (waning): Surya, Mangal, Shani.
 * tribhaga:  60 — lord of the day/night third of birth: day thirds
 *                        Budh/Surya/Shani, night thirds Chandra/Shukra/Mangal;
 *                        Guru gets 60 in both (BPHS). Thirds are computed from
 *                        the same mean sunrise/sunset as the hora calculation.
 * abda/masa: EXCLUDED (null) — year/month lords need samvatsara tables.
 * dina:      60 for the weekday (vara) lord, 0 otherwise.
 * hora:      60 for the hora lord of birth. Seasonal horas (12 day + 12 night),
 *                        anchored at mean sunrise computed from lat/lon and the
 *                        tropical Sun (declination formula, -0.833° depression,
 *                        no equation-of-time correction — documented). Hora
 *                        sequence starts with the vara lord and follows the
 *                        Chaldean order Shani→Guru→Mangal→Surya→Shukra→Budh→Chandra.
 * ayana:     60 — Uttarayana (tropical Surya in [270°,360°)∪[0°,90°)):
 *                        Surya, Mangal, Guru (+Budh both); Dakshinayana:
 *                        Chandra, Shukra, Shani (+Budh both).
 * yuddha:    EXCLUDED (null) — graha-yuddha needs close-conjunction analysis.
 * ── Chesta bala ─────────────────────────────────────────────────────────────
 * 8 classical states from r = daily speed / mean speed. Thresholds (documented
 * operationalisation; virupas follow the standard 60/45/30/15/7.5 ladder):
 *   combust → Asta 0 | r<0 → Vakra 60 | r≥1.5 → Atichara 45 |
 *   1.15≤r<1.5 → Chara 30 | 0.85≤r<1.15 → Sama 15 | 0.4≤r<0.85 → Manda 7.5 |
 *   0.05≤r<0.4 → Mandatara 15 | 0≤r<0.05 → Vikala 30.
 * Mean speeds (deg/day): Surya 0.9856, Chandra 13.1764, Mangal 0.5240,
 * Budh 4.0923, Guru 0.0831, Shukra 1.6021, Shani 0.0335.
 * ── Naisargika ──────────────────────────────────────────────────────────────
 * From NAISARGIKA_BALA (BPHS, virupas).
 * ── Drik bala ───────────────────────────────────────────────────────────────
 * Each graha-drishti (via aspects() from doshas.js, whole-sign) on the planet:
 * +15 from a benefic, −15 from a malefic. Benefic for drik: Guru, Shukra;
 * Chandra iff waxing; Budh iff not conjunct (same rashi) a natural malefic.
 * Conjunctions are not counted (they belong to yuddha, excluded).
 *
 * Derived: ishta = (uchcha + chesta)/2, kashta = (120 − uchcha − chesta)/2
 * (virupas, standard). rupa = total/60. minRupa per SPEC.
 */
import { GRAHA_HI, NAISARGIKA_BALA, DIGNITY } from './constants.js';
import { aspects } from './doshas.js';

const SEVEN = ['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani'];
const ALL_NINE = [...SEVEN, 'Rahu', 'Ketu'];
const KENDRA = [1, 4, 7, 10];
const PANAPHARA = [2, 5, 8, 11];
const MIN_RUPA = { Surya: 6.5, Chandra: 6, Mangal: 5, Budh: 7, Guru: 6.5, Shukra: 5.5, Shani: 5 };

const SAPTAVARGAJA_SCALE = {
  exalted: 20, moolatrikona: 18, own: 15, friend: 10, neutral: 7, enemy: 5, debilitated: 3,
};
const SAPTA_VARGAS = ['D1', 'D2', 'D3', 'D7', 'D9', 'D10', 'D30'];

const MEAN_SPEED = {
  Surya: 0.9856, Chandra: 13.1764, Mangal: 0.5240, Budh: 4.0923,
  Guru: 0.0831, Shukra: 1.6021, Shani: 0.0335,
};

const DIG_PEAK = { Surya: 10, Mangal: 10, Chandra: 4, Shukra: 4, Budh: 1, Guru: 1, Shani: 7 };

// Chaldean order (slowest → fastest); hora sequence steps through it.
const CHALDEAN = ['Shani', 'Guru', 'Mangal', 'Surya', 'Shukra', 'Budh', 'Chandra'];
// Weekday lords for Ravivar(0) .. Shanivar(1..6)
const VARA_LORDS = ['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani'];

/* ------------------------------------------------------------------ */
/* Local dignity logic — same tables as dignityOf() in kundli.js, kept  */
/* local to avoid a kundli.js ↔ shadbala.js import cycle.               */
/* ------------------------------------------------------------------ */
const FRIENDS = {
  Surya: [0, 3, 8, 11], Chandra: [0, 2, 4, 8, 11], Mangal: [4, 8, 11, 1, 6],
  Budh: [4, 5, 1, 6], Guru: [0, 3, 4, 7], Shukra: [2, 5, 9, 10], Shani: [1, 5, 2, 6],
};
function dignityTypeOf(graha, rashiIdx, degInRashi) {
  const d = DIGNITY[graha];
  if (!d) return 'neutral';
  if (d.ex && rashiIdx === d.ex[0]) return 'exalted';
  if (d.deb && rashiIdx === d.deb[0]) return 'debilitated';
  if (d.moola && rashiIdx === d.moola[0] && degInRashi >= d.moola[1] && degInRashi <= d.moola[2])
    return 'moolatrikona';
  if (d.own && d.own.includes(rashiIdx)) return 'own';
  if ((FRIENDS[graha] || []).includes(rashiIdx)) return 'friend';
  if (SEVEN.includes(graha)) return 'enemy';
  return 'neutral';
}

const angDist = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/* ------------------------------------------------------------------ */
/* Mean sunrise/sunset (civil local hours) from lat/lon + tropical Sun. */
/* ------------------------------------------------------------------ */
function meanSunrise(lat, lon, utcOffsetHours, tropSunLon) {
  const rad = Math.PI / 180;
  const eps = 23.439 * rad;
  const dec = Math.asin(Math.sin(eps) * Math.sin(tropSunLon * rad));
  const phi = lat * rad;
  const cosH = (Math.sin(-0.833 * rad) - Math.sin(phi) * Math.sin(dec)) /
               (Math.cos(phi) * Math.cos(dec));
  let H, dayLen;
  if (cosH <= -1 || cosH >= 1) { H = 90; dayLen = 12; } // polar fallback (documented)
  else { H = Math.acos(cosH) / rad / 15; dayLen = 2 * H; }
  let sunrise = 12 - H + utcOffsetHours - lon / 15;
  sunrise = ((sunrise % 24) + 24) % 24;
  return { sunrise, dayLen };
}

/** Hora lord + tribhaga lord of the birth moment (seasonal horas). */
function horaAndTribhaga({ lat, lon, utcOffsetHours, tropSunLon, birthDate, varaIdx }) {
  const local = new Date(birthDate.getTime() + utcOffsetHours * 3600000);
  const t = local.getUTCHours() + local.getUTCMinutes() / 60 + local.getUTCSeconds() / 3600;
  const { sunrise, dayLen } = meanSunrise(lat, lon, utcOffsetHours, tropSunLon);
  const sunset = sunrise + dayLen;
  const nightLen = 24 - dayLen;
  const varaLord = VARA_LORDS[varaIdx];
  const startIdx = CHALDEAN.indexOf(varaLord);

  let horaLord, tribhagaLord;
  if (t >= sunrise && t < sunset) {
    const n = Math.min(11, Math.floor((t - sunrise) / (dayLen / 12)));
    horaLord = CHALDEAN[(startIdx + n) % 7];
    const third = Math.min(2, Math.floor((t - sunrise) / (dayLen / 3)));
    tribhagaLord = ['Budh', 'Surya', 'Shani'][third];
  } else {
    const nightStart = t >= sunset ? sunset : sunset - 24;
    const t2 = t >= sunset ? t : t + 24;
    const n = Math.min(11, Math.floor((t2 - nightStart) / (nightLen / 12)));
    horaLord = CHALDEAN[(startIdx + 12 + n) % 7];
    const third = Math.min(2, Math.floor((t2 - nightStart) / (nightLen / 3)));
    tribhagaLord = ['Chandra', 'Shukra', 'Mangal'][third];
  }
  return { horaLord, tribhagaLord, sunrise, dayLen };
}

function chestaOf(graha) {
  if (graha.combust) return { state: 'Asta', value: 0 };
  const r = graha.speed / MEAN_SPEED[graha.id];
  if (r < 0) return { state: 'Vakra', value: 60 };
  if (r >= 1.5) return { state: 'Atichara', value: 45 };
  if (r >= 1.15) return { state: 'Chara', value: 30 };
  if (r >= 0.85) return { state: 'Sama', value: 15 };
  if (r >= 0.4) return { state: 'Manda', value: 7.5 };
  if (r >= 0.05) return { state: 'Mandatara', value: 15 };
  return { state: 'Vikala', value: 30 };
}

/**
 * @param {Object} kundli — full kundli object
 * @returns {Array} per-planet shadbala (Surya..Shani)
 */
export function shadbalaOf(kundli) {
  const G = {};
  for (const g of kundli.grahas) G[g.id] = g;
  const waxing = kundli.panchang.tithi.idx < 15; // Shukla paksha
  const dayBirth = kundli.meta.isDayBirth;
  const varaIdx = kundli.panchang.vara.idx;
  const varaLord = VARA_LORDS[varaIdx];

  let tropSun = G.Surya.tropLon;
  if (tropSun == null) tropSun = (G.Surya.lon + kundli.meta.ayanamsa) % 360; // fallback
  const uttarayana = tropSun >= 270 || tropSun < 90;

  const { horaLord, tribhagaLord } = horaAndTribhaga({
    lat: kundli.meta.lat, lon: kundli.meta.lon,
    utcOffsetHours: kundli.meta.utcOffsetHours, tropSunLon: tropSun,
    birthDate: kundli.meta.birthDate, varaIdx,
  });

  // Drik beneficence (documented in header)
  const drikBenefic = (id) => {
    if (id === 'Guru' || id === 'Shukra') return true;
    if (id === 'Chandra') return waxing;
    if (id === 'Budh') {
      const r = G.Budh.rashiIdx;
      return !['Surya', 'Mangal', 'Shani', 'Rahu', 'Ketu'].some((m) => G[m].rashiIdx === r);
    }
    return false;
  };

  return SEVEN.map((id) => {
    const g = G[id];
    const house = g.house;

    // ── Sthana ──
    const ex = DIGNITY[id].ex;
    const exLon = ex[0] * 30 + ex[1];
    const uchcha = 60 * (1 - angDist(g.lon, exLon) / 180);
    let saptavargaja = 0;
    for (const vk of SAPTA_VARGAS) {
      const v = g.vargas[vk];
      saptavargaja += SAPTAVARGAJA_SCALE[dignityTypeOf(id, v.rashiIdx, v.degree)] ?? 0;
    }
    const oddRashi = g.rashiIdx % 2 === 0;
    const ojhayugma =
      (['Surya', 'Mangal', 'Guru'].includes(id) && oddRashi) ||
      (['Chandra', 'Shukra', 'Shani'].includes(id) && !oddRashi) ? 15 : 0;
    const kendra = KENDRA.includes(house) ? 60 : PANAPHARA.includes(house) ? 30 : 15;
    const drek = Math.floor(g.degInRashi / 10); // 0,1,2
    const drekkana =
      (id === 'Mangal' && drek === 0) || (id === 'Shani' && drek === 1) ||
      (id === 'Guru' && drek === 2) ? 15 : 0;
    const sthanaTotal = uchcha + saptavargaja + ojhayugma + kendra + drekkana;

    // ── Dig ──
    const peak = DIG_PEAK[id];
    const opposite = ((peak + 5) % 12) + 1;
    const dig = house === peak ? 60 : house === opposite ? 0 : 30;

    // ── Kala ──
    const natonnata = dayBirth
      ? (['Surya', 'Guru', 'Shukra', 'Budh'].includes(id) ? 60 : 0)
      : (['Chandra', 'Mangal', 'Shani', 'Budh'].includes(id) ? 60 : 0);
    const paksha = waxing
      ? (['Chandra', 'Guru', 'Shukra', 'Budh'].includes(id) ? 60 : 0)
      : (['Surya', 'Mangal', 'Shani'].includes(id) ? 60 : 0);
    const tribhaga = (tribhagaLord === id || id === 'Guru') ? 60 : 0;
    const abda = null; // excluded — needs samvatsara year-lord tables
    const masa = null; // excluded — needs month-lord tables
    const dina = id === varaLord ? 60 : 0;
    const hora = id === horaLord ? 60 : 0;
    const ayana = uttarayana
      ? (['Surya', 'Mangal', 'Guru', 'Budh'].includes(id) ? 60 : 0)
      : (['Chandra', 'Shukra', 'Shani', 'Budh'].includes(id) ? 60 : 0);
    const yuddha = null; // excluded — graha-yuddha analysis not implemented
    const kalaTotal = natonnata + paksha + tribhaga + dina + hora + ayana;

    // ── Chesta / Naisargika / Drik ──
    const chesta = chestaOf(g);
    const naisargika = NAISARGIKA_BALA[id];
    let drik = 0;
    for (const q of ALL_NINE) {
      if (q === id) continue;
      if (aspects(q, G[q].rashiIdx, g.rashiIdx)) drik += drikBenefic(q) ? 15 : -15;
    }

    const total = sthanaTotal + dig + kalaTotal + chesta.value + naisargika + drik;
    const rupa = total / 60;
    const minRupa = MIN_RUPA[id];
    const ratio = rupa / minRupa;
    const ishta = (uchcha + chesta.value) / 2;
    const kashta = (120 - uchcha - chesta.value) / 2;
    const strength =
      ratio >= 1.25 ? 'Very Strong' : ratio >= 1 ? 'Strong' :
      ratio >= 0.75 ? 'Moderate' : 'Weak';

    return {
      id, hi: GRAHA_HI[id],
      sthana: {
        uchcha: +uchcha.toFixed(2), saptavargaja: +saptavargaja.toFixed(2),
        ojhayugma, kendra, drekkana, total: +sthanaTotal.toFixed(2),
      },
      dig,
      kala: {
        natonnata, paksha, tribhaga, abda, masa, dina, hora, ayana, yuddha,
        total: kalaTotal,
      },
      chesta: { state: chesta.state, value: chesta.value },
      naisargika,
      drik,
      total: +total.toFixed(2),
      rupa: +rupa.toFixed(3),
      minRupa,
      ratio: +ratio.toFixed(3),
      ishta: +ishta.toFixed(2),
      kashta: +kashta.toFixed(2),
      strength,
      included: ['uchcha', 'saptavargaja', 'ojhayugma', 'kendra', 'drekkana',
        'dig', 'natonnata', 'paksha', 'tribhaga', 'dina', 'hora', 'ayana',
        'chesta', 'naisargika', 'drik'],
      note: 'Includes: uchcha, saptavargaja (D1/D2/D3/D7/D9/D10/D30), ojhayugma, ' +
        'kendra, drekkana, dig, natonnata, paksha, tribhaga, dina (vara lord), ' +
        'hora (seasonal horas from mean sunrise), ayana, chesta (8-state), ' +
        'naisargika, drik (graha-drishti ±15). Excluded: abda (year lord), masa ' +
        '(month lord), yuddha (graha-yuddha) — not implemented; no invented values.',
    };
  });
}
