/**
 * Gochar (transit) — real transit positions via the engine for `atDate`.
 *
 * For each graha: sidereal rashi, house from Moon, house from Lagna, and the
 * classical gochar phala for that house-from-Moon (BPHS / Phaladeepika /
 * Uttara Kalamrita tradition), labelled as classical gochar phala.
 * Effect mapping: good = classical shubha houses per planet; bad = 4/8/12
 * mostly; mixed = the rest. Sade Sati / Dhaiya via doshas.js with a real
 * ±15-year Saturn timeline.
 *
 * NO invented predictions: descriptions are the traditional gochar phala,
 * not personal forecasts.
 */
import {
  initEngine, getPositions, jdFromDate,
} from '../engine/sweph.js';
import { GRAHAS, GRAHA_HI, RASHIS, RASHI_HI } from './constants.js';
import { sadeSatiStatus, sadeSatiTimeline } from './doshas.js';

// Classical shubha (good) houses from Moon per planet
const GOOD_HOUSES = {
  Surya: [3, 6, 10, 11], Chandra: [1, 3, 6, 7, 10, 11], Mangal: [3, 6, 11],
  Budh: [2, 4, 6, 8, 10, 11], Guru: [2, 5, 7, 9, 11],
  Shukra: [1, 2, 3, 4, 5, 8, 9, 11, 12], Shani: [3, 6, 11],
  Rahu: [3, 6, 11], Ketu: [3, 6, 11],
};
const BAD_HOUSES = {
  Surya: [4, 7, 8, 12], Chandra: [6, 8], Mangal: [1, 4, 7, 8, 12],
  Budh: [3, 5, 7, 9, 12], Guru: [1, 3, 4, 6, 8, 10, 12],
  Shukra: [6, 7, 10], Shani: [1, 2, 4, 5, 7, 8, 9, 10, 12],
  Rahu: [1, 2, 4, 5, 7, 8, 9, 10, 12], Ketu: [1, 2, 4, 5, 7, 8, 9, 10, 12],
};

// Traditional gochar phala per planet per house-from-Moon.
// [effect, hindi description, areas[]]
const PHALA = {
  Surya: {
    1: ['mixed', 'स्वास्थ्य में उतार-चढ़ाव, पिता से मतभेद, सरकारी कार्यों में बाधा', ['Health', 'Father', 'Government']],
    2: ['mixed', 'धन व्यय, नेत्र कष्ट, वाणी में कठोरता', ['Wealth', 'Eyes', 'Speech']],
    3: ['good', 'शत्रुओं पर विजय, साहस वृद्धि, यात्रा लाभ', ['Courage', 'Victory', 'Travel']],
    4: ['bad', 'गृह क्लेश, वाहन कष्ट, माता के स्वास्थ्य की चिंता', ['Home', 'Mother', 'Vehicles']],
    5: ['mixed', 'संतान की चिंता, बुद्धि भ्रम, अटकलबाज़ी में हानि', ['Children', 'Intellect', 'Speculation']],
    6: ['good', 'शत्रु नाश, रोग मुक्ति, ऋण से छुटकारा', ['Enemies', 'Health', 'Debts']],
    7: ['bad', 'वैवाहिक मतभेद, साझेदारी में तनाव, यात्रा कष्ट', ['Marriage', 'Partnership', 'Travel']],
    8: ['bad', 'अचानक कष्ट, दुर्घटना भय, अपमान की आशंका', ['Health', 'Accidents', 'Sudden events']],
    9: ['mixed', 'भाग्य में बाधा, पिता से दूरी, धर्म-कर्म में विघ्न', ['Fortune', 'Father', 'Dharma']],
    10: ['good', 'पद-प्रतिष्ठा, राजकीय सम्मान, कार्य सिद्धि', ['Career', 'Fame', 'Authority']],
    11: ['good', 'आय वृद्धि, इच्छा पूर्ति, बड़े भाई/मित्रों का सहयोग', ['Income', 'Gains', 'Friends']],
    12: ['bad', 'अनावश्यक व्यय, नेत्र रोग, शत्रुओं से पीड़ा', ['Expenses', 'Health', 'Enemies']],
  },
  Chandra: {
    1: ['good', 'मानसिक शांति, कांति वृद्धि, जन समर्थन', ['Mind', 'Health', 'Public image']],
    2: ['mixed', 'धन लाभ किंतु परिवार में छोटी चिंताएँ', ['Wealth', 'Family']],
    3: ['good', 'साहस, भाई-बहनों से सुख, अल्प यात्रा', ['Courage', 'Siblings', 'Travel']],
    4: ['mixed', 'मन चंचल, गृह सुख में कमी, माता की चिंता', ['Mind', 'Home', 'Mother']],
    5: ['mixed', 'संतान की चिंता, बुद्धि अस्थिर, प्रेम में उतार-चढ़ाव', ['Children', 'Intellect', 'Romance']],
    6: ['good', 'शत्रु पर विजय, स्वास्थ्य सुधरता है', ['Enemies', 'Health']],
    7: ['good', 'वैवाहिक सुख, साझेदारी में लाभ, यात्रा आनंद', ['Marriage', 'Partnership', 'Travel']],
    8: ['bad', 'मानसिक अशांति, भय, माता के स्वास्थ्य की चिंता', ['Anxiety', 'Mother', 'Health']],
    9: ['mixed', 'भाग्य में उतार-चढ़ाव, गुरुजनों से मतभेद संभव', ['Fortune', 'Mentors']],
    10: ['good', 'कार्य सफलता, यश, लोक प्रतिष्ठा', ['Career', 'Fame']],
    11: ['good', 'सर्व लाभ, इच्छा पूर्ति, मित्र सुख', ['Gains', 'Desires', 'Friends']],
    12: ['mixed', 'व्यय, निद्रा भंग, मानसिक थकान', ['Expenses', 'Sleep', 'Mind']],
  },
  Mangal: {
    1: ['bad', 'क्रोध वृद्धि, रक्त विकार, दुर्घटना भय', ['Health', 'Anger', 'Accidents']],
    2: ['mixed', 'धन हानि, कटु वाणी, कुटुंब कलह', ['Wealth', 'Speech', 'Family']],
    3: ['good', 'पराक्रम, शत्रु विजय, भाई-बहनों का सुख', ['Courage', 'Victory', 'Siblings']],
    4: ['bad', 'गृह अशांति, वाहन दुर्घटना भय, माता कष्ट', ['Home', 'Mother', 'Vehicles']],
    5: ['mixed', 'संतान चिंता, बुद्धि चंचल, पेट विकार', ['Children', 'Mind', 'Health']],
    6: ['good', 'शत्रु नाश, साहस, रोगों से मुक्ति', ['Enemies', 'Courage', 'Health']],
    7: ['bad', 'दांपत्य कलह, साझेदारी में हानि', ['Marriage', 'Partnership']],
    8: ['bad', 'अचानक चोट, शस्त्र भय, रक्तस्राव की आशंका', ['Accidents', 'Health', 'Surgery']],
    9: ['mixed', 'पिता से मतभेद, भाग्य में रुकावट', ['Father', 'Fortune']],
    10: ['mixed', 'कार्य में संघर्ष, अधिकारियों से तनाव', ['Career', 'Authority']],
    11: ['good', 'लाभ, भूमि-भवन से सुख, इच्छा पूर्ति', ['Gains', 'Property', 'Desires']],
    12: ['bad', 'व्यय वृद्धि, गुप्त शत्रु, नेत्र कष्ट', ['Expenses', 'Enemies', 'Health']],
  },
  Budh: {
    1: ['mixed', 'मानसिक चिंता किंतु बुद्धि तीक्ष्ण', ['Mind', 'Intellect']],
    2: ['good', 'धन लाभ, मधुर वाणी, कुटुंब सुख', ['Wealth', 'Speech', 'Family']],
    3: ['mixed', 'परिश्रम अधिक, यात्रा, भाई-बंधुओं से मतभेद', ['Effort', 'Travel', 'Siblings']],
    4: ['good', 'विद्या लाभ, गृह सुख, वाहन सुख', ['Education', 'Home', 'Vehicles']],
    5: ['mixed', 'संतान की चिंता, बुद्धि भ्रम', ['Children', 'Intellect']],
    6: ['good', 'शत्रु पराजय, वाद-विवाद में विजय, स्वास्थ्य लाभ', ['Enemies', 'Debate', 'Health']],
    7: ['mixed', 'साझेदारी में वार्ता, दांपत्य में छोटी खींचतान', ['Partnership', 'Marriage']],
    8: ['good', 'अचानक लाभ, गुप्त विद्या/शोध में सफलता', ['Sudden gains', 'Research']],
    9: ['mixed', 'भाग्य में अस्थिरता, गुरुजनों से मतभेद', ['Fortune', 'Mentors']],
    10: ['good', 'व्यापार-कार्य में उन्नति, यश', ['Business', 'Career', 'Fame']],
    11: ['good', 'आय वृद्धि, मित्र लाभ, इच्छा पूर्ति', ['Income', 'Friends', 'Gains']],
    12: ['mixed', 'व्यय, मानसिक थकान, निद्रा भंग', ['Expenses', 'Mind', 'Sleep']],
  },
  Guru: {
    1: ['mixed', 'स्वास्थ्य की ओर ध्यान आवश्यक, आध्यात्मिक रुचि', ['Health', 'Spirituality']],
    2: ['good', 'धन वृद्धि, कुटुंब सुख, वाणी में माधुर्य', ['Wealth', 'Family', 'Speech']],
    3: ['mixed', 'पराक्रम में कमी, भाई-बंधुओं से दूरी', ['Courage', 'Siblings']],
    4: ['mixed', 'गृह चिंता, माता के स्वास्थ्य का ध्यान', ['Home', 'Mother']],
    5: ['good', 'संतान सुख, विद्या लाभ, बुद्धि प्रखर', ['Children', 'Education', 'Wisdom']],
    6: ['mixed', 'शत्रु वृद्धि, स्वास्थ्य कष्ट, ऋण चिंता', ['Enemies', 'Health', 'Debts']],
    7: ['good', 'वैवाहिक सुख, साझेदारी में वृद्धि', ['Marriage', 'Partnership']],
    8: ['mixed', 'अचानक परिवर्तन, आयु/स्वास्थ्य की चिंता', ['Sudden events', 'Health']],
    9: ['good', 'भाग्योदय, गुरु कृपा, तीर्थ/धर्म कार्य', ['Fortune', 'Dharma', 'Mentors']],
    10: ['mixed', 'कार्यभार वृद्धि, पद में उतार-चढ़ाव', ['Career', 'Workload']],
    11: ['good', 'सर्व लाभ, आय वृद्धि, इच्छा पूर्ति', ['Gains', 'Income', 'Desires']],
    12: ['mixed', 'व्यय, विदेश संबंधी कार्य, एकांतप्रियता', ['Expenses', 'Foreign', 'Solitude']],
  },
  Shukra: {
    1: ['good', 'कांति, आकर्षण, सुख-सुविधा वृद्धि', ['Health', 'Charm', 'Comforts']],
    2: ['good', 'धन लाभ, कुटुंब सुख, उत्तम भोजन', ['Wealth', 'Family', 'Food']],
    3: ['good', 'साहस, भाई-बहनों से सुख, आभूषण लाभ', ['Courage', 'Siblings', 'Ornaments']],
    4: ['good', 'गृह सुख, वाहन सुख, माता का आशीर्वाद', ['Home', 'Vehicles', 'Mother']],
    5: ['good', 'संतान सुख, विद्या/कला में सफलता, प्रेम सुख', ['Children', 'Arts', 'Romance']],
    6: ['mixed', 'रोग भय, शत्रुओं से कष्ट, ऋण चिंता', ['Health', 'Enemies', 'Debts']],
    7: ['mixed', 'कामेच्छा वृद्धि, दांपत्य में उतार-चढ़ाव', ['Desires', 'Marriage']],
    8: ['good', 'अचानक धन लाभ, आयु वृद्धि', ['Sudden gains', 'Longevity']],
    9: ['good', 'भाग्य वृद्धि, स्त्री/पति से सुख, धर्म रुचि', ['Fortune', 'Spouse', 'Dharma']],
    10: ['mixed', 'कार्य में विलासिता की ओर झुकाव, यश में कमी संभव', ['Career', 'Fame']],
    11: ['good', 'लाभ, मित्र सुख, इच्छा पूर्ति', ['Gains', 'Friends', 'Desires']],
    12: ['good', 'शय्या सुख, विदेश यात्रा, भोग-विलास', ['Comforts', 'Foreign travel', 'Pleasures']],
  },
  Shani: {
    1: ['bad', 'स्वास्थ्य कष्ट, विलंब, मानसिक दबाव', ['Health', 'Delays', 'Mind']],
    2: ['bad', 'धन हानि, कुटुंब कलह, नेत्र/दंत कष्ट', ['Wealth', 'Family', 'Health']],
    3: ['good', 'साहस, शत्रु विजय, भाई-बहनों का सहयोग', ['Courage', 'Victory', 'Siblings']],
    4: ['bad', 'गृह अशांति, माता कष्ट, वाहन हानि', ['Home', 'Mother', 'Vehicles']],
    5: ['bad', 'संतान चिंता, विद्या में बाधा, बुद्धि भ्रम', ['Children', 'Education', 'Mind']],
    6: ['good', 'शत्रु नाश, रोग मुक्ति, ऋण से मुक्ति', ['Enemies', 'Health', 'Debts']],
    7: ['bad', 'दांपत्य क्लेश, साझेदारी में हानि, यात्रा कष्ट', ['Marriage', 'Partnership', 'Travel']],
    8: ['bad', 'दीर्घ रोग भय, अचानक कष्ट, आयु चिंता', ['Health', 'Sudden events', 'Longevity']],
    9: ['bad', 'भाग्य में बाधा, पिता से मतभेद, गुरुजनों से दूरी', ['Fortune', 'Father', 'Mentors']],
    10: ['mixed', 'कार्य परिवर्तन, कठोर परिश्रम, विलंबित सफलता', ['Career', 'Hard work']],
    11: ['good', 'परिश्रम से लाभ, ज्येष्ठ भ्राता का सहयोग', ['Gains', 'Elder siblings']],
    12: ['bad', 'व्यय, अस्पताल/एकांत, विदेश में कष्ट', ['Expenses', 'Health', 'Foreign']],
  },
  Rahu: {
    1: ['bad', 'मानसिक भ्रम, स्वास्थ्य कष्ट, अपयश भय', ['Mind', 'Health', 'Reputation']],
    2: ['mixed', 'धन में उतार-चढ़ाव, वाणी दोष', ['Wealth', 'Speech']],
    3: ['good', 'साहस, शत्रु विजय, अप्रत्याशित लाभ', ['Courage', 'Victory', 'Gains']],
    4: ['bad', 'गृह अशांति, माता कष्ट, वाहन भय', ['Home', 'Mother', 'Vehicles']],
    5: ['mixed', 'संतान चिंता, बुद्धि भ्रम, अटकलों से हानि', ['Children', 'Mind', 'Speculation']],
    6: ['good', 'शत्रु नाश, रोग शमन, प्रतिस्पर्धा में विजय', ['Enemies', 'Health', 'Competition']],
    7: ['bad', 'दांपत्य/साझेदारी में धोखे की आशंका', ['Marriage', 'Partnership']],
    8: ['bad', 'अचानक घटनाएँ, गुप्त शत्रु, स्वास्थ्य भय', ['Sudden events', 'Enemies', 'Health']],
    9: ['mixed', 'धर्म में संदेह, पिता से दूरी, भाग्य अस्थिर', ['Dharma', 'Father', 'Fortune']],
    10: ['mixed', 'कार्य में अचानक परिवर्तन, पद अस्थिर', ['Career', 'Changes']],
    11: ['good', 'आकस्मिक लाभ, मित्रों से सहयोग', ['Sudden gains', 'Friends']],
    12: ['bad', 'व्यय, विदेश में कष्ट, निद्रा भंग', ['Expenses', 'Foreign', 'Sleep']],
  },
  Ketu: {
    1: ['bad', 'मानसिक अशांति, स्वास्थ्य कष्ट, आत्मविश्वास में कमी', ['Mind', 'Health', 'Confidence']],
    2: ['mixed', 'धन अस्थिर, कुटुंब में मतभेद', ['Wealth', 'Family']],
    3: ['good', 'साहस, आध्यात्मिक बल, शत्रु पराजय', ['Courage', 'Spirituality', 'Enemies']],
    4: ['bad', 'गृह सुख में कमी, माता की चिंता', ['Home', 'Mother']],
    5: ['mixed', 'संतान चिंता, बुद्धि में भटकाव', ['Children', 'Mind']],
    6: ['good', 'शत्रु नाश, रोगों से मुक्ति', ['Enemies', 'Health']],
    7: ['bad', 'दांपत्य में वैराग्य भाव, साझेदारी में तनाव', ['Marriage', 'Partnership']],
    8: ['bad', 'अचानक कष्ट, गुप्त रोग भय', ['Sudden events', 'Health']],
    9: ['mixed', 'भाग्य में उतार-चढ़ाव, तीव्र वैराग्य', ['Fortune', 'Detachment']],
    10: ['mixed', 'कार्य में अरुचि, पद परिवर्तन की इच्छा', ['Career', 'Detachment']],
    11: ['good', 'अप्रत्याशित लाभ, आध्यात्मिक मित्र', ['Gains', 'Spiritual friends']],
    12: ['bad', 'व्यय, एकांतवास की प्रवृत्ति, निद्रा कष्ट', ['Expenses', 'Solitude', 'Sleep']],
  },
};

function effectOf(planet, house) {
  const [effect, description, areas] = PHALA[planet][house];
  return { effect, description, areas };
}

/**
 * @param {Object} kundli — per SPEC shape
 * @param {Date} atDate — transit moment (default now)
 */
export async function gocharOf(kundli, atDate = new Date()) {
  await initEngine();
  const nodeType = kundli?.meta?.nodeType || 'mean';
  const jdUT = jdFromDate(atDate);
  const pos = getPositions(jdUT, nodeType);

  const moonRashi = kundli.chandra.rashiIdx;
  const lagnaRashi = kundli.lagna.rashiIdx;

  const transits = GRAHAS.map((id) => {
    const rashiIdx = Math.floor(pos[id].lon / 30) % 12;
    const houseFromMoon = ((rashiIdx - moonRashi + 12) % 12) + 1;
    const houseFromLagna = ((rashiIdx - lagnaRashi + 12) % 12) + 1;
    const { effect, description, areas } = effectOf(id, houseFromMoon);
    return {
      id, hi: GRAHA_HI[id],
      lon: +pos[id].lon.toFixed(3),
      rashiIdx, rashi: RASHIS[rashiIdx], rashiHi: RASHI_HI[rashiIdx],
      houseFromMoon, houseFromLagna,
      effect, description, areas,
      rule: `${id} in ${houseFromMoon}${ordinal(houseFromMoon)} from Chandra — ${effect} per classical gochar (shubha houses: ${GOOD_HOUSES[id].join(', ')})`,
    };
  });

  const saturnRashi = Math.floor(pos.Shani.lon / 30) % 12;
  const { sadeSati, dhaiya, saturnHouseFromMoon } = sadeSatiStatus(saturnRashi, moonRashi);

  const jupiterRashi = Math.floor(pos.Guru.lon / 30) % 12;
  const jupiterHouseFromMoon = ((jupiterRashi - moonRashi + 12) % 12) + 1;
  const guruBala = [2, 5, 7, 9, 11].includes(jupiterHouseFromMoon)
    ? { bala: 'Strong', balaHi: 'प्रबल', houseFromMoon: jupiterHouseFromMoon, description: `Guru in ${jupiterHouseFromMoon}${ordinal(jupiterHouseFromMoon)} from Moon — Guru bala strong; supportive for wisdom, fortune and growth. / चंद्र से ${jupiterHouseFromMoon}वें भाव में गुरु — गुरु बल प्रबल।` }
    : [6, 8, 12].includes(jupiterHouseFromMoon)
      ? { bala: 'Weak', balaHi: 'क्षीण', houseFromMoon: jupiterHouseFromMoon, description: `Guru in ${jupiterHouseFromMoon}${ordinal(jupiterHouseFromMoon)} from Moon — Guru bala weak; patience and guru-seva traditionally advised. / गुरु बल क्षीण — धैर्य व गुरु सेवा परंपरागत उपाय।` }
      : { bala: 'Medium', balaHi: 'मध्यम', houseFromMoon: jupiterHouseFromMoon, description: `Guru in ${jupiterHouseFromMoon}${ordinal(jupiterHouseFromMoon)} from Moon — Guru bala medium. / गुरु बल मध्यम।` };

  const from = new Date(atDate.getTime()); from.setFullYear(from.getFullYear() - 15);
  const to = new Date(atDate.getTime()); to.setFullYear(to.getFullYear() + 15);
  const saturnLonFn = (date) => getPositions(jdFromDate(date), nodeType).Shani.lon;
  const timeline = sadeSatiTimeline(saturnLonFn, moonRashi, from, to);

  return {
    date: atDate.toISOString(),
    transits,
    sadeSati: sadeSati ? {
      active: true, phase: sadeSati.phase, phaseName: sadeSati.phaseName, phaseHi: sadeSati.phaseHi,
      houseFromMoon: saturnHouseFromMoon, saturnRashi: RASHIS[saturnRashi],
      description: `Sade Sati active — phase ${sadeSati.phase} (${sadeSati.phaseName}). Shani in ${saturnHouseFromMoon}${ordinal(saturnHouseFromMoon)} from Moon. / साढ़ेसाती सक्रिय — ${sadeSati.phaseHi} चरण।`,
    } : { active: false, description: 'Sade Sati is not active at this date. / इस तिथि पर साढ़ेसाती सक्रिय नहीं।' },
    dhaiya: dhaiya ? {
      active: true, house: dhaiya.house, name: dhaiya.name,
      description: `Dhaiya active — Shani in ${dhaiya.house}${ordinal(dhaiya.house)} (${dhaiya.name}) from Moon. / ढैया सक्रिय।`,
    } : { active: false, description: 'Dhaiya is not active at this date. / इस तिथि पर ढैया सक्रिय नहीं।' },
    guruBala,
    timeline: timeline.map((t) => ({ ...t, start: t.start.toISOString(), end: t.end.toISOString() })),
    note: 'Effects are classical gochar phala (traditional belief), not personal predictions. / प्रभाव पारंपरिक गोचर फल हैं, व्यक्तिगत भविष्यवाणी नहीं।',
  };
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
