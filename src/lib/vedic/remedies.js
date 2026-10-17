/**
 * Remedies (Upay) — traditional per-planet remedy lists plus dosha-specific
 * remedies for the doshas actually present in the chart (manglik, kaal-sarp
 * from kundli.doshas; sade-sati is time-based — see gochar.js — so its
 * remedies are included as a general section).
 *
 * All traditional belief. Every section carries the standard note:
 * 'Paramparik manyata — traditional belief, not medical/financial advice'.
 */
import { GRAHA_HI } from './constants.js';

const NOTE = 'Paramparik manyata — traditional belief, not medical/financial advice. / पारंपरिक मान्यता — चिकित्सा/वित्तीय सलाह नहीं।';

const PLANET_REMEDIES = {
  Surya: {
    mantra: 'Om Suryaya Namah / Om Hram Hreem Hroum Sah Suryaya Namah',
    mantraHi: 'ॐ सूर्याय नमः',
    daan: ['Wheat (गेहूं)', 'Jaggery (गुड़)', 'Copper vessel (तांबा)', 'Red cloth (लाल वस्त्र)'],
    day: 'Sunday (रविवार)',
    puja: 'Offer water (arghya) to the rising Sun from a copper vessel. / तांबे के लोटे से सूर्य को अर्घ्य दें।',
    varat: 'Sunday fast — salt-free meal after sunset. / रविवार व्रत।',
    avoid: ['Disrespecting father or elders', 'Tamasik food on Sunday', 'Wasting water'],
  },
  Chandra: {
    mantra: 'Om Som Somaya Namah / Om Shram Shreem Shraum Sah Chandraya Namah',
    mantraHi: 'ॐ सोम सोमाय नमः',
    daan: ['Rice (चावल)', 'Milk (दूध)', 'White cloth (श्वेत वस्त्र)', 'Silver (चाँदी)'],
    day: 'Monday (सोमवार)',
    puja: 'Shiv abhishek with milk and water on Monday. / सोमवार को शिव अभिषेक।',
    varat: 'Monday fast (Somvar vrat). / सोमवार व्रत।',
    avoid: ['Disrespecting mother', 'Wasting water/milk', 'Late-night negativity'],
  },
  Mangal: {
    mantra: 'Om Mangalaya Namah / Om Kram Kreem Kroum Sah Bhaumaya Namah',
    mantraHi: 'ॐ मंगलाय नमः',
    daan: ['Red lentils — masoor dal (मसूर दाल)', 'Jaggery (गुड़)', 'Red cloth (लाल वस्त्र)', 'Copper (तांबा)'],
    day: 'Tuesday (मंगलवार)',
    puja: 'Hanuman Chalisa on Tuesday; offer red flowers at Hanuman temple. / मंगलवार को हनुमान चालीसा।',
    varat: 'Tuesday fast. / मंगलवार व्रत।',
    avoid: ['Anger and violence', 'Non-veg on Tuesday', 'Harming brothers'],
  },
  Budh: {
    mantra: 'Om Budhaya Namah / Om Bram Breem Broum Sah Budhaya Namah',
    mantraHi: 'ॐ बुधाय नमः',
    daan: ['Green moong (हरी मूंग)', 'Green cloth (हरा वस्त्र)', 'Books/stationery (पुस्तकें)', 'Brass (पीतल)'],
    day: 'Wednesday (बुधवार)',
    puja: 'Vishnu/Ganesh worship on Wednesday; feed green fodder to cows. / बुधवार को विष्णु/गणेश पूजा।',
    varat: 'Wednesday fast. / बुधवार व्रत।',
    avoid: ['Lying and broken promises', 'Disrespecting eunuchs/students', 'Cutting green trees'],
  },
  Guru: {
    mantra: 'Om Gurave Namah / Om Gram Greem Groum Sah Gurave Namah',
    mantraHi: 'ॐ गुरवे नमः',
    daan: ['Chana dal (चना दाल)', 'Turmeric (हल्दी)', 'Yellow cloth (पीला वस्त्र)', 'Gold (सोना)'],
    day: 'Thursday (गुरुवार)',
    puja: 'Vishnu/Brihaspati worship; apply turmeric tilak. / गुरुवार को विष्णु पूजा।',
    varat: 'Thursday fast (no salt). / गुरुवार व्रत।',
    avoid: ['Disrespecting teachers/elders', 'Cutting peepal', 'Non-veg on Thursday'],
  },
  Shukra: {
    mantra: 'Om Shukraya Namah / Om Dram Dreem Droum Sah Shukraya Namah',
    mantraHi: 'ॐ शुक्राय नमः',
    daan: ['Rice (चावल)', 'Sugar (चीनी)', 'White cloth (श्वेत वस्त्र)', 'Perfume/curd (इत्र/दही)'],
    day: 'Friday (शुक्रवार)',
    puja: 'Lakshmi worship on Friday; keep home clean and fragrant. / शुक्रवार को लक्ष्मी पूजा।',
    varat: 'Friday fast. / शुक्रवार व्रत।',
    avoid: ['Disrespecting women', 'Uncleanliness', 'Intoxicants on Friday'],
  },
  Shani: {
    mantra: 'Om Sham Shanaishcharaya Namah / Om Pram Preem Proum Sah Shanaischaraya Namah',
    mantraHi: 'ॐ शं शनैश्चराय नमः',
    daan: ['Black sesame — kala til (काले तिल)', 'Mustard oil (सरसों तेल)', 'Black cloth/blanket (काला कंबल)', 'Iron (लोहा)'],
    day: 'Saturday (शनिवार)',
    puja: 'Shani temple visit Saturday evening; offer mustard oil (tel abhishek). / शनिवार संध्या शनि मंदिर।',
    varat: 'Saturday fast. / शनिवार व्रत।',
    avoid: ['Alcohol and meat', 'Harming servants/the poor', 'Iron theft/disputes'],
  },
  Rahu: {
    mantra: 'Om Rahave Namah / Om Bhram Bhreem Bhroum Sah Rahave Namah',
    mantraHi: 'ॐ राहवे नमः',
    daan: ['Black blanket (काला कंबल)', 'Mustard (सरसों)', 'Coconut (नारियल)', 'Lead-free iron items'],
    day: 'Saturday (शनिवार)',
    puja: 'Bhairav/Durga worship; feed black dogs. / भैरव/दुर्गा पूजा।',
    varat: 'Saturday fast. / शनिवार व्रत।',
    avoid: ['Deceit and manipulation', 'Non-veg', 'Disrespecting in-laws'],
  },
  Ketu: {
    mantra: 'Om Ketave Namah / Om Sram Sreem Sroum Sah Ketave Namah',
    mantraHi: 'ॐ केतवे नमः',
    daan: ['Sesame (तिल)', 'Brown/multi-colour cloth', 'Feed dogs (कुत्तों को रोटी)'],
    day: 'Tuesday (मंगलवार)',
    puja: 'Ganesh worship; donate to spiritual/charitable causes. / गणेश पूजा।',
    varat: 'Tuesday fast. / मंगलवार व्रत।',
    avoid: ['Cruelty to animals', 'Arrogance', 'Breaking religious vows'],
  },
};

function manglikRemedies(manglik) {
  if (!manglik?.rawPresent) return null;
  const refs = [manglik.fromLagna, manglik.fromMoon, manglik.fromShukra]
    .filter((x) => x.present)
    .map((x) => `${x.ref} (Mangal in house ${x.house}${x.cancelled ? ', bhanga present' : ''})`);
  return {
    dosha: 'Manglik Dosha', doshaHi: 'मांगलिक दोष',
    present: manglik.present, fullyCancelled: manglik.fullyCancelled,
    refs,
    remedies: [
      'Hanuman Chalisa every Tuesday and Saturday. / प्रत्येक मंगलवार व शनिवार हनुमान चालीसा।',
      'Mangal Shanti puja / Mangalvar vrat. / मंगल शांति पूजा व मंगलवार व्रत।',
      'Donate red lentils, jaggery and red cloth on Tuesday. / मंगलवार को मसूर दाल, गुड़, लाल वस्त्र दान।',
      'Kumbh Vivah (symbolic pre-marriage rite) is the classical remedy when dosha is uncancelled — consult a pandit. / दोष भंग न हो तो कुंभ विवाह परंपरागत उपाय — पंडित से परामर्श।',
    ],
    note: NOTE,
  };
}

function kaalSarpRemedies(kaalSarp) {
  if (!kaalSarp?.present) return null;
  return {
    dosha: 'Kaal Sarp Yoga', doshaHi: 'काल सर्प योग',
    type: kaalSarp.type ? `${kaalSarp.type.name} (${kaalSarp.type.nameHi}), Rahu in house ${kaalSarp.type.house}` : null,
    remedies: [
      'Nag Panchami vrat and Nag devta puja. / नाग पंचमी व्रत व नाग पूजा।',
      'Mahamrityunjaya jaap (daily or 108× on Monday). / महामृत्युंजय जप।',
      'Rudrabhishek at a Shiv temple, especially on Monday/Shravan. / शिव मंदिर में रुद्राभिषेक।',
      'Feed birds/animals; plant a peepal tree. / पक्षियों को दाना, पीपल वृक्षारोपण।',
    ],
    note: NOTE,
  };
}

// Sade Sati is time-based (computed in gochar.js); remedies listed as general.
function sadeSatiRemedies() {
  return {
    dosha: 'Sade Sati / Dhaiya (when active — see Gochar)', doshaHi: 'साढ़ेसाती / ढैया',
    remedies: [
      'Shani temple visit every Saturday evening; mustard-oil offering (tel abhishek). / प्रत्येक शनिवार संध्या शनि मंदिर।',
      'Hanuman Chalisa daily (morning and evening). / प्रतिदिन हनुमान चालीसा।',
      'Donate black sesame, black blanket, iron items to the poor on Saturday. / शनिवार को काले तिल, कंबल, लोहा दान।',
      'Feed black crows and black dogs on Saturday. / शनिवार को कौओं व काले कुत्तों को भोजन।',
      'Chant "Om Sham Shanaishcharaya Namah" 108 times in the evening. / संध्या को 108 बार जप।',
      'Serve elderly and disabled people. / वृद्धों व दिव्यांगों की सेवा।',
    ],
    note: NOTE,
  };
}

/**
 * @param {Object} kundli — per SPEC shape (needs doshas.manglik, doshas.kaalSarp)
 */
export function remediesOf(kundli) {
  const planets = {};
  for (const [id, r] of Object.entries(PLANET_REMEDIES)) {
    planets[id] = { planet: id, hi: GRAHA_HI[id], ...r, note: NOTE };
  }
  const doshas = {
    manglik: manglikRemedies(kundli?.doshas?.manglik),
    kaalSarp: kaalSarpRemedies(kundli?.doshas?.kaalSarp),
    sadeSati: sadeSatiRemedies(),
  };
  return { planets, doshas, note: NOTE };
}
