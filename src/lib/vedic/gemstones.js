/**
 * Gemstone recommendations — rule-based from the computed chart.
 *
 * Rule (ported idea from reference gemstone.js):
 *   - RECOMMEND: planet is functionally benefic for this lagna AND weak
 *     (debilitated, or shadbala ratio < 1) → strengthen it.
 *   - AVOID: planet owns 6/8/12 (dusthana) or is a functional malefic AND is
 *     strong (exalted/own/moolatrikona or shadbala ratio >= 1) → do not
 *     strengthen; wearing its stone feeds the malefic.
 *   - NEUTRAL: everything else (strong benefics need no help; weak malefics
 *     are left alone by default).
 *
 * Functional beneficence (classical): lords of trikona (1,5,9) are benefic;
 * kendra (1,4,7,10) lords are benefic unless they also own a dusthana
 * (6,8,12). Yogakaraka (one planet owning a kendra + a trikona) is the most
 * benefic. Dusthana lords (6,8,12) and 3rd/11th lords lean malefic.
 *
 * Everything is traditional belief — see `disclaimer`.
 */
import { GRAHA_HI, RASHIS, RASHI_LORDS } from './constants.js';

const STONES = {
  Surya:   { stone: 'Ruby', stoneHi: 'माणिक', metal: 'Gold (सोना)', finger: 'Ring finger, right hand', day: 'Sunday', mantra: 'Om Hram Hreem Hroum Sah Suryaya Namah', weight: '3–5 ratti', benefits: 'Vitality, confidence, father, authority' },
  Chandra: { stone: 'Pearl', stoneHi: 'मोती', metal: 'Silver (चाँदी)', finger: 'Little finger, right hand', day: 'Monday', mantra: 'Om Shram Shreem Shraum Sah Chandraya Namah', weight: '4–6 ratti', benefits: 'Mental peace, emotions, mother' },
  Mangal:  { stone: 'Red Coral', stoneHi: 'मूंगा', metal: 'Gold or Copper', finger: 'Ring finger, right hand', day: 'Tuesday', mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah', weight: '5–7 ratti', benefits: 'Courage, energy, property, siblings' },
  Budh:    { stone: 'Emerald', stoneHi: 'पन्ना', metal: 'Gold (सोना)', finger: 'Little finger, right hand', day: 'Wednesday', mantra: 'Om Bram Breem Broum Sah Budhaya Namah', weight: '4–6 ratti', benefits: 'Intellect, speech, business, education' },
  Guru:    { stone: 'Yellow Sapphire', stoneHi: 'पुखराज', metal: 'Gold (सोना)', finger: 'Index finger, right hand', day: 'Thursday', mantra: 'Om Gram Greem Groum Sah Gurave Namah', weight: '5–7 ratti', benefits: 'Wisdom, wealth, children, dharma' },
  Shukra:  { stone: 'Diamond', stoneHi: 'हीरा', metal: 'Platinum or White Gold', finger: 'Ring finger or middle finger, right hand', day: 'Friday', mantra: 'Om Dram Dreem Droum Sah Shukraya Namah', weight: '0.5–1.5 carat', benefits: 'Love, marriage, luxury, arts' },
  Shani:   { stone: 'Blue Sapphire', stoneHi: 'नीलम', metal: 'Silver or Iron', finger: 'Middle finger, right hand', day: 'Saturday', mantra: 'Om Pram Preem Proum Sah Shanaischaraya Namah', weight: '4–6 ratti', benefits: 'Discipline, career, longevity', caution: 'Test first (tie on arm 3 days); remove if adverse. / पहले परीक्षण करें।' },
  Rahu:    { stone: 'Hessonite', stoneHi: 'गोमेद', metal: 'Silver (चाँदी)', finger: 'Middle finger, right hand', day: 'Saturday', mantra: 'Om Bhram Bhreem Bhroum Sah Rahave Namah', weight: '5–7 ratti', benefits: 'Material success, foreign, research', caution: 'Wear only on a pandit\'s advice; watch for 1 week. / पंडित की सलाह पर ही।' },
  Ketu:    { stone: "Cat's Eye", stoneHi: 'लहसुनिया', metal: 'Silver or Gold', finger: 'Little finger, right hand', day: 'Tuesday', mantra: 'Om Sram Sreem Sroum Sah Ketave Namah', weight: '4–6 ratti', benefits: 'Spiritual growth, protection', caution: 'Best for the spiritually inclined. / आध्यात्मिक रुचि वालों हेतु।' },
};

const KENDRA = [1, 4, 7, 10], TRIKONA = [1, 5, 9], DUSTHANA = [6, 8, 12];

/** houses (1-12) owned by a planet for this lagna */
function ownedHouses(planet, lagnaRashiIdx) {
  const out = [];
  for (let h = 1; h <= 12; h++) {
    if (RASHI_LORDS[(lagnaRashiIdx + h - 1) % 12] === planet) out.push(h);
  }
  return out;
}

function functionalRole(planet, lagnaRashiIdx) {
  const houses = ownedHouses(planet, lagnaRashiIdx);
  if (!houses.length) return { role: 'shadow', houses }; // Rahu/Ketu own no rashi
  const kendraOwned = houses.filter((h) => KENDRA.includes(h));
  const trikonaOwned = houses.filter((h) => TRIKONA.includes(h));
  const dusthanaOwned = houses.filter((h) => DUSTHANA.includes(h));
  const isYogakaraka = kendraOwned.length > 0 && trikonaOwned.length > 0 && kendraOwned.some((h) => h !== 1 || trikonaOwned.some((t) => t !== 1));
  if (isYogakaraka) return { role: 'yogakaraka', houses };
  if (trikonaOwned.length > 0 && dusthanaOwned.length === 0) return { role: 'benefic', houses };
  if (kendraOwned.length > 0 && dusthanaOwned.length === 0) return { role: 'benefic', houses };
  if (dusthanaOwned.length > 0) return { role: 'malefic', houses };
  return { role: 'neutral', houses }; // 2,3,11 lords
}

function isStrong(planet, graha, shadbalaEntry) {
  const d = graha?.dignity?.type;
  if (d === 'exalted' || d === 'own' || d === 'moolatrikona') return true;
  if (shadbalaEntry && typeof shadbalaEntry.ratio === 'number' && shadbalaEntry.ratio >= 1) return true;
  return false;
}
function isWeak(planet, graha, shadbalaEntry) {
  if (graha?.dignity?.type === 'debilitated') return true;
  if (shadbalaEntry && typeof shadbalaEntry.ratio === 'number' && shadbalaEntry.ratio < 1) return true;
  return false;
}

function houseWord(h) {
  return `${h}${h === 1 ? 'st' : h === 2 ? 'nd' : h === 3 ? 'rd' : 'th'}`;
}

/**
 * @param {Object} kundli — per SPEC shape (needs lagna, grahas, shadbala)
 */
export function gemstonesOf(kundli) {
  const lagnaRashiIdx = kundli.lagna.rashiIdx;
  const shadbala = Array.isArray(kundli.shadbala) ? kundli.shadbala : [];
  const sbById = Object.fromEntries(shadbala.map((s) => [s.id, s]));
  const grahaById = Object.fromEntries((kundli.grahas || []).map((g) => [g.id, g]));

  const recommend = [], avoid = [], neutral = [];

  for (const id of Object.keys(STONES)) {
    const graha = grahaById[id];
    const sb = sbById[id];
    const { role, houses } = functionalRole(id, lagnaRashiIdx);
    const weak = isWeak(id, graha, sb);
    const strong = isStrong(id, graha, sb);
    const houseRef = houses.length ? ` (lord of ${houses.map(houseWord).join(' & ')} house)` : '';
    const dignityNote = graha?.dignity?.type ? `, ${graha.dignity.type}` : '';
    const placement = `${RASHIS[graha?.rashiIdx ?? 0]}${graha?.house ? `, house ${graha.house}` : ''}${dignityNote}`;

    const entry = {
      planet: id, hi: GRAHA_HI[id],
      ...STONES[id],
      role, houses,
      placement,
      reason: '',
    };

    if ((role === 'benefic' || role === 'yogakaraka') && weak) {
      entry.reason = `${id}${houseRef} is ${weak ? 'weak' : ''}${dignityNote} — strengthening a benefic lord is the classical remedy. / ${GRAHA_HI[id]} शुभेश होकर निर्बल है — रत्न धारण परंपरागत उपाय।`;
      recommend.push(entry);
    } else if (role === 'malefic' && strong) {
      entry.reason = `${id}${houseRef} is a dusthana lord and strong${dignityNote} — wearing its stone would feed the malefic; avoid. / ${GRAHA_HI[id]} दुःस्थानेश होकर बलवान है — इसका रत्न न पहनें।`;
      avoid.push(entry);
    } else {
      entry.reason = role === 'benefic' || role === 'yogakaraka'
        ? `${id}${houseRef} is benefic and already strong — no stone needed. / ${GRAHA_HI[id]} शुभेश और बलवान — रत्न आवश्यक नहीं।`
        : role === 'malefic'
          ? `${id}${houseRef} is malefic but weak — left alone; daan (not stone) is the traditional remedy. / ${GRAHA_HI[id]} पापेश किंतु निर्बल — रत्न नहीं, दान परंपरागत।`
          : `${id}${houseRef} — neutral for this lagna. / इस लग्न हेतु तटस्थ।`;
      neutral.push(entry);
    }
  }

  return {
    lagna: RASHIS[lagnaRashiIdx],
    recommend, avoid, neutral,
    disclaimer: 'Paramparik manyata — traditional belief, not a guarantee of results. Wear only after consulting a qualified astrologer and a certified jeweller; verify stone authenticity. Not medical or financial advice. / पारंपरिक मान्यता — परिणाम की गारंटी नहीं; योग्य ज्योतिषी व प्रमाणित जौहरी की सलाह आवश्यक।',
  };
}
