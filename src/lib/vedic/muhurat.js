/**
 * Muhurat finder — auspicious-day scan with REAL computed panchang per day.
 *
 * Ported tables from reference-omnitools/core/muhurat.js (Rahu Kaal,
 * Yamaghanda, Gulika, Choghadiya, auspicious varas/nakshatras/tithis).
 * Unlike the old analyzeDay, panchang here is computed via the engine
 * (sidereal + tropical positions) at ~06:00 local time each day — no
 * placeholder strings.
 *
 * Rahu Kaal / Yamaghanda / Gulika / Choghadiya assume a nominal 06:00–18:00
 * day; they are approximate — exact values need true sunrise/sunset.
 */
import {
  initEngine, getPositions, getTropical, julianDayUT,
} from '../engine/sweph.js';
import { panchangOf, rashiOf } from './panchang.js';
import { VARA_HI } from './constants.js';

const RAHU_KAAL = {
  0: [16.5, 18], 1: [7.5, 9], 2: [15, 16.5], 3: [12, 13.5],
  4: [13.5, 15], 5: [10.5, 12], 6: [9, 10.5],
};
const YAMAGHANDA = {
  0: [12, 13.5], 1: [10.5, 12], 2: [9, 10.5], 3: [7.5, 9],
  4: [6, 7.5], 5: [15, 16.5], 6: [13.5, 15],
};
const GULIKA_KAAL = {
  0: [13.5, 15], 1: [12, 13.5], 2: [10.5, 12], 3: [9, 10.5],
  4: [7.5, 9], 5: [6, 7.5], 6: [15, 16.5],
};
const CHOGHADIYA_DAY = {
  0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
  1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],
  2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
  3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],
  4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
  5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],
  6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'],
};
const CHOGHADIYA_HI = {
  Udveg: 'उद्वेग', Char: 'चर', Labh: 'लाभ', Amrit: 'अमृत',
  Kaal: 'काल', Shubh: 'शुभ', Rog: 'रोग',
};
const AUSPICIOUS_CHOGHADIYA = new Set(['Shubh', 'Labh', 'Amrit', 'Char']);

const AUSPICIOUS_DAYS = {
  marriage: [1, 3, 4, 5], griha_pravesh: [1, 3, 4, 5], vehicle: [1, 3, 4, 5],
  business: [1, 3, 4], travel: [1, 3, 4, 5], mundan: [1, 3, 4, 5],
  engagement: [1, 3, 4, 5], property: [1, 3, 4, 5], gold: [4, 5], naming: [1, 3, 4, 5],
};
const AUSPICIOUS_NAKSHATRAS = {
  marriage: ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
  griha_pravesh: ['Rohini', 'Mrigashira', 'Uttara Phalguni', 'Chitra', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
  vehicle: ['Ashwini', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Dhanishta', 'Revati'],
  business: ['Ashwini', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Dhanishta'],
  travel: ['Ashwini', 'Pushya', 'Hasta', 'Anuradha', 'Shravana', 'Dhanishta', 'Revati'],
  mundan: ['Mrigashira', 'Chitra', 'Jyeshtha', 'Dhanishta', 'Shatabhisha'],
  engagement: ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Revati'],
  property: ['Rohini', 'Mrigashira', 'Uttara Phalguni', 'Chitra', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada'],
  gold: ['Pushya', 'Punarvasu', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
  naming: ['Ashwini', 'Rohini', 'Mrigashira', 'Pushya', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Dhanishta', 'Revati'],
};
const AUSPICIOUS_TITHIS = {
  marriage: [2, 3, 5, 6, 7, 10, 11, 13],
  griha_pravesh: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
  vehicle: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13],
  business: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
  travel: [2, 3, 5, 6, 7, 10, 11, 12, 13],
  mundan: [2, 3, 5, 6, 7, 10, 11, 12, 13],
  engagement: [2, 3, 5, 6, 7, 10, 11, 12, 13],
  property: [2, 3, 5, 6, 7, 10, 11, 12, 13],
  gold: [3, 5, 6, 7, 10, 11, 13],
  naming: [1, 2, 3, 5, 6, 7, 10, 11, 12, 13],
};
const BAD_YOGAS = new Set(['Ganda', 'Vyatipata', 'Vaidhriti', 'Atiganda', 'Vyaghata', 'Vajra', 'Parigha']);

const EVENT_HI = {
  marriage: 'विवाह', griha_pravesh: 'गृह प्रवेश', vehicle: 'वाहन खरीदी', business: 'व्यापार आरंभ',
  travel: 'यात्रा', mundan: 'मुंडन', engagement: 'सगाई', property: 'संपत्ति खरीदी',
  gold: 'स्वर्ण खरीदी', naming: 'नामकरण', general: 'सामान्य',
};

const MAX_SCAN_DAYS = 120;
const APPROX_NOTE = 'Rahu Kaal / Yamaghanda / Gulika / Choghadiya are approximated for a nominal 6:00 AM–6:00 PM day; exact values need true local sunrise/sunset. / राहु काल आदि अनुमानित हैं — सटीक मान हेतु वास्तविक सूर्योदय/सूर्यास्त आवश्यक।';

function fmtTime(h) {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const hh = hour % 12 === 0 ? 12 : hour % 12;
  const ap = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  return `${hh}:${String(min).padStart(2, '0')} ${ap}`;
}
function fmtRange([s, e]) { return `${fmtTime(s)} - ${fmtTime(e)}`; }

function choghadiyaSlots(weekday) {
  const names = CHOGHADIYA_DAY[weekday];
  const slots = [];
  for (let i = 0; i < 8; i++) {
    const start = 6 + i * 1.5;
    slots.push({
      name: names[i],
      nameHi: CHOGHADIYA_HI[names[i]],
      time: fmtRange([start, start + 1.5]),
      auspicious: AUSPICIOUS_CHOGHADIYA.has(names[i]),
    });
  }
  return slots;
}

/**
 * Scan days for an auspicious muhurat.
 * @param {Object} p
 * @param {string} p.event — marriage|griha_pravesh|vehicle|business|travel|mundan|engagement|property|gold|naming|general
 * @param {Date} p.from, p.to — scan range (max 120 days)
 * @param {number} p.lat, p.lon — unused for now (kept for future sunrise/sunset)
 * @param {number} p.utcOffsetHours — e.g. 5.5 for IST
 */
export async function findMuhurat({ event = 'general', from, to, lat, lon, utcOffsetHours = 5.5 }) {
  await initEngine();
  const eventKey = EVENT_HI[event] ? event : 'general';
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  const dayCount = Math.round((end - start) / 86400000) + 1;
  if (dayCount < 1) throw new Error('muhurat: `to` must be on/after `from`');
  if (dayCount > MAX_SCAN_DAYS) throw new Error(`muhurat: scan range too large (${dayCount} > ${MAX_SCAN_DAYS} days)`);

  const days = [];
  const cursor = new Date(start.getTime());
  while (cursor <= end) {
    days.push(await analyzeDay(cursor, eventKey, utcOffsetHours));
    cursor.setDate(cursor.getDate() + 1);
  }
  days.sort((a, b) => b.score - a.score);
  return { event: eventKey, eventHi: EVENT_HI[eventKey], days, approxNote: APPROX_NOTE };
}

async function analyzeDay(date, eventKey, utcOffsetHours) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // REAL panchang: engine positions at ~06:00 local time
  const hourUT = 6 - utcOffsetHours;
  const jdUT = julianDayUT(y, m, d, hourUT);
  const pos = getPositions(jdUT);
  const trop = getTropical(jdUT);
  // panchangOf only reads localDate.getDay() — duck-typed for TZ safety
  const p = panchangOf({
    sunSidereal: pos.Surya.lon, moonSidereal: pos.Chandra.lon,
    sunTropical: trop.Surya, moonTropical: trop.Chandra,
    localDate: { getDay: () => weekday },
  });

  const factors = [];
  let score = 0;

  // Vara +15
  const goodDayList = AUSPICIOUS_DAYS[eventKey];
  if (!goodDayList) {
    factors.push({ name: 'Vara', points: 0, note: `${VARA_HI[weekday]} — event-neutral day` });
  } else if (goodDayList.includes(weekday)) {
    score += 15;
    factors.push({ name: 'Vara', points: 15, note: `${VARA_HI[weekday]} is auspicious for ${EVENT_HI[eventKey]}` });
  } else {
    factors.push({ name: 'Vara', points: 0, note: `${VARA_HI[weekday]} is not ideal for ${EVENT_HI[eventKey]}` });
  }

  // Nakshatra +20
  const nakList = AUSPICIOUS_NAKSHATRAS[eventKey];
  if (!nakList) {
    factors.push({ name: 'Nakshatra', points: 0, note: `${p.nakshatra.nameHi} (${p.nakshatra.name}) pada ${p.nakshatra.pada} — event-neutral` });
  } else if (nakList.includes(p.nakshatra.name)) {
    score += 20;
    factors.push({ name: 'Nakshatra', points: 20, note: `${p.nakshatra.nameHi} is auspicious for ${EVENT_HI[eventKey]}` });
  } else {
    factors.push({ name: 'Nakshatra', points: 0, note: `${p.nakshatra.nameHi} is not in the auspicious list for ${EVENT_HI[eventKey]}` });
  }

  // Tithi +15 (tithi number within paksha: 1–15)
  const tithiNum = (p.tithi.idx % 15) + 1;
  const tithiList = AUSPICIOUS_TITHIS[eventKey];
  if (!tithiList) {
    factors.push({ name: 'Tithi', points: 0, note: `${p.tithi.nameHi} (${p.tithi.paksha[1]} paksha) — event-neutral` });
  } else if (tithiList.includes(tithiNum)) {
    score += 15;
    factors.push({ name: 'Tithi', points: 15, note: `${p.tithi.nameHi} (${p.tithi.paksha[1]}) is auspicious for ${EVENT_HI[eventKey]}` });
  } else {
    factors.push({ name: 'Tithi', points: 0, note: `${p.tithi.nameHi} (${p.tithi.paksha[1]}) is not ideal for ${EVENT_HI[eventKey]}` });
  }

  // Yoga +10
  if (!BAD_YOGAS.has(p.yoga.name)) {
    score += 10;
    factors.push({ name: 'Yoga', points: 10, note: `${p.yoga.nameHi} yoga — not in the inauspicious set` });
  } else {
    factors.push({ name: 'Yoga', points: 0, note: `${p.yoga.nameHi} yoga — inauspicious (avoid important beginnings)` });
  }

  // Karana +5
  if (p.karana.name !== 'Vishti') {
    score += 5;
    factors.push({ name: 'Karana', points: 5, note: `${p.karana.nameHi} — Vishti (Bhadra) not present` });
  } else {
    factors.push({ name: 'Karana', points: 0, note: 'Vishti (Bhadra) karana — inauspicious, avoid' });
  }

  // Choghadiya +10
  const allSlots = choghadiyaSlots(weekday);
  const goodSlots = allSlots.filter((s) => s.auspicious).map(({ name, nameHi, time }) => ({ name, nameHi, time }));
  if (goodSlots.length) {
    score += 10;
    factors.push({ name: 'Choghadiya', points: 10, note: `${goodSlots.length} auspicious day slots (${goodSlots.map((s) => s.name).join(', ')})` });
  }

  // Abhijit +5 (nominal)
  score += 5;
  factors.push({ name: 'Abhijit', points: 5, note: 'Abhijit muhurat ~11:45 AM–12:30 PM (nominal)' });

  return {
    date: dateStr,
    dayHi: VARA_HI[weekday],
    score,
    isAuspicious: score >= 40,
    panchang: {
      tithi: { name: p.tithi.name, nameHi: p.tithi.nameHi, paksha: p.tithi.paksha },
      yoga: { name: p.yoga.name, nameHi: p.yoga.nameHi },
      nakshatra: { name: p.nakshatra.name, nameHi: p.nakshatra.nameHi, pada: p.nakshatra.pada },
      karana: { name: p.karana.name, nameHi: p.karana.nameHi },
      vara: { name: p.vara.name, nameHi: p.vara.nameHi },
    },
    moonRashi: rashiOf(pos.Chandra.lon).idx,
    rahuKaal: fmtRange(RAHU_KAAL[weekday]),
    yamaghanda: fmtRange(YAMAGHANDA[weekday]),
    gulika: fmtRange(GULIKA_KAAL[weekday]),
    abhijit: '11:45 AM - 12:30 PM',
    choghadiya: goodSlots,
    factors,
  };
}

/** Today's muhurat summary for a place (event-neutral). */
export async function todaysMuhurat({ lat, lon, utcOffsetHours = 5.5 } = {}) {
  const now = new Date();
  const res = await findMuhurat({ event: 'general', from: now, to: now, lat, lon, utcOffsetHours });
  return res.days[0];
}
