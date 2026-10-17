/**
 * Vedic constants — names (Hindi/English), lords, dignities, nakshatra attributes.
 * Tables verified against BPHS / standard janampatri conventions.
 * Fixture cross-check: Shravana -> Dev/Vanar/Antya, Makar -> Vaishya. All match.
 */

export const GRAHAS = ['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani', 'Rahu', 'Ketu'];

export const GRAHA_HI = {
  Surya: 'सूर्य', Chandra: 'चंद्र', Mangal: 'मंगल', Budh: 'बुध', Guru: 'गुरु',
  Shukra: 'शुक्र', Shani: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};
export const GRAHA_EN = {
  Surya: 'Sun', Chandra: 'Moon', Mangal: 'Mars', Budh: 'Mercury', Guru: 'Jupiter',
  Shukra: 'Venus', Shani: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu',
};
export const GRAHA_ABBR = { Surya: 'Su', Chandra: 'Mo', Mangal: 'Ma', Budh: 'Me', Guru: 'Ju', Shukra: 'Ve', Shani: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };
export const GRAHA_ABBR_HI = { Surya: 'सू', Chandra: 'चं', Mangal: 'मं', Budh: 'बु', Guru: 'गु', Shukra: 'शु', Shani: 'श', Rahu: 'रा', Ketu: 'के' };

// natural benefic / malefic (for drishti & shadbala)
export const NATURAL_BENEFIC = ['Guru', 'Shukra', 'Budh', 'Chandra'];
export const NATURAL_MALEFIC = ['Surya', 'Mangal', 'Shani', 'Rahu', 'Ketu'];
// (Budh benefic when with benefics/alone; Chandra benefic when waxing — handled in rules)

export const RASHIS = ['Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya', 'Tula', 'Vrishchik', 'Dhanu', 'Makar', 'Kumbh', 'Meen'];
export const RASHI_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
export const RASHI_LORDS = ['Mangal', 'Shukra', 'Budh', 'Chandra', 'Surya', 'Budh', 'Shukra', 'Mangal', 'Guru', 'Shani', 'Shani', 'Guru'];
export const RASHI_TATVA = ['Agni', 'Prithvi', 'Vayu', 'Jal', 'Agni', 'Prithvi', 'Vayu', 'Jal', 'Agni', 'Prithvi', 'Vayu', 'Jal'];
export const RASHI_TATVA_HI = ['अग्नि', 'पृथ्वी', 'वायु', 'जल', 'अग्नि', 'पृथ्वी', 'वायु', 'जल', 'अग्नि', 'पृथ्वी', 'वायु', 'जल'];

// Dignity data: rashi indices 0-11
export const DIGNITY = {
  Surya:   { ex: [0, 10], deb: [6, 10], own: [4], moola: [4, 0, 20] },
  Chandra: { ex: [1, 3],  deb: [7, 3],  own: [3], moola: [1, 3, 30] },
  Mangal:  { ex: [9, 28], deb: [3, 28], own: [0, 7], moola: [0, 0, 12] },
  Budh:    { ex: [5, 15], deb: [11, 15], own: [2, 5], moola: [5, 15, 20] },
  Guru:    { ex: [3, 5],  deb: [9, 5],  own: [8, 11], moola: [8, 0, 10] },
  Shukra:  { ex: [11, 27], deb: [5, 27], own: [1, 6], moola: [6, 0, 15] },
  Shani:   { ex: [6, 20], deb: [0, 20], own: [9, 10], moola: [10, 0, 20] },
  Rahu:    { ex: [1, 0], deb: [7, 0], own: [], moola: null },
  Ketu:    { ex: [7, 0], deb: [1, 0], own: [], moola: null },
};

// Naisargika bala (virupas, BPHS)
export const NAISARGIKA_BALA = { Surya: 60, Chandra: 51.43, Mangal: 17.14, Budh: 25.71, Guru: 34.29, Shukra: 42.86, Shani: 8.57 };

// Combustion orbs (degrees from Sun) — traditional
export const COMBUST_ORBS = { Chandra: 12, Mangal: 17, Budh: 14, Guru: 11, Shukra: 10, Shani: 15 };
// Budh/Shukra tighter when retrograde: 12 / 8 — handled in rules

export const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
export const NAKSHATRA_HI = ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'अश्लेषा', 'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्व भाद्रपद', 'उत्तर भाद्रपद', 'रेवती'];

const _gana = {}, _yoni = {}, _nadi = {}, _devata = {};
const ganaDeva = ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'];
const ganaRakshasa = ['Krittika', 'Ashlesha', 'Magha', 'Chitra', 'Vishakha', 'Jyeshtha', 'Mula', 'Dhanishta', 'Shatabhisha'];
const nadiAdi = ['Ashwini', 'Ardra', 'Punarvasu', 'Uttara Phalguni', 'Hasta', 'Jyeshtha', 'Mula', 'Shatabhisha', 'Purva Bhadrapada'];
const nadiMadhya = ['Bharani', 'Mrigashira', 'Pushya', 'Purva Phalguni', 'Chitra', 'Anuradha', 'Purva Ashadha', 'Dhanishta', 'Uttara Bhadrapada'];
const yoniData = {
  Ashwini: ['Ashwa', 'अश्व', 'M'], Bharani: ['Gaja', 'गज', 'M'], Krittika: ['Aja', 'अज', 'F'],
  Rohini: ['Sarpa', 'सर्प', 'F'], Mrigashira: ['Sarpa', 'सर्प', 'F'], Ardra: ['Shwana', 'श्वान', 'F'],
  Punarvasu: ['Marjara', 'मार्जार', 'F'], Pushya: ['Aja', 'अज', 'M'], Ashlesha: ['Marjara', 'मार्जार', 'M'],
  Magha: ['Mushaka', 'मूषक', 'M'], 'Purva Phalguni': ['Mushaka', 'मूषक', 'F'], 'Uttara Phalguni': ['Gau', 'गौ', 'M'],
  Hasta: ['Mahisha', 'महिष', 'F'], Chitra: ['Vyaghra', 'व्याघ्र', 'F'], Swati: ['Mahisha', 'महिष', 'M'],
  Vishakha: ['Vyaghra', 'व्याघ्र', 'M'], Anuradha: ['Mriga', 'मृग', 'F'], Jyeshtha: ['Mriga', 'मृग', 'M'],
  Mula: ['Shwana', 'श्वान', 'M'], 'Purva Ashadha': ['Vanara', 'वानर', 'M'], 'Uttara Ashadha': ['Nakula', 'नकुल', 'M'],
  Shravana: ['Vanara', 'वानर', 'F'], Dhanishta: ['Simha', 'सिंह', 'F'], Shatabhisha: ['Ashwa', 'अश्व', 'F'],
  'Purva Bhadrapada': ['Simha', 'सिंह', 'M'], 'Uttara Bhadrapada': ['Gau', 'गौ', 'F'], Revati: ['Gaja', 'गज', 'F'],
};
const devataData = {
  Ashwini: ['Ashwini Kumar', 'अश्विनी कुमार'], Bharani: ['Yama', 'यम'], Krittika: ['Agni', 'अग्नि'],
  Rohini: ['Brahma', 'ब्रह्मा'], Mrigashira: ['Soma', 'सोम'], Ardra: ['Rudra', 'रुद्र'],
  Punarvasu: ['Aditi', 'अदिति'], Pushya: ['Brihaspati', 'बृहस्पति'], Ashlesha: ['Sarpa', 'सर्प'],
  Magha: ['Pitra', 'पितृ'], 'Purva Phalguni': ['Bhaga', 'भग'], 'Uttara Phalguni': ['Aryaman', 'अर्यमा'],
  Hasta: ['Savita', 'सविता'], Chitra: ['Vishwakarma', 'विश्वकर्मा'], Swati: ['Vayu', 'वायु'],
  Vishakha: ['Indra-Agni', 'इंद्र-अग्नि'], Anuradha: ['Mitra', 'मित्र'], Jyeshtha: ['Indra', 'इंद्र'],
  Mula: ['Nirriti', 'निर्ऋति'], 'Purva Ashadha': ['Jala', 'जल'], 'Uttara Ashadha': ['Vishvadeva', 'विश्वदेव'],
  Shravana: ['Vishnu', 'विष्णु'], Dhanishta: ['Vasu', 'वसु'], Shatabhisha: ['Varuna', 'वरुण'],
  'Purva Bhadrapada': ['Aja Ekapada', 'अज एकपाद'], 'Uttara Bhadrapada': ['Ahirbudhnya', 'अहिर्बुध्न्य'], Revati: ['Pushan', 'पूषन'],
};
for (const n of NAKSHATRAS) {
  _gana[n] = ganaDeva.includes(n) ? ['Deva', 'देव'] : ganaRakshasa.includes(n) ? ['Rakshasa', 'राक्षस'] : ['Manushya', 'मनुष्य'];
  _yoni[n] = yoniData[n];
  _nadi[n] = nadiAdi.includes(n) ? ['Adi', 'आदि'] : nadiMadhya.includes(n) ? ['Madhya', 'मध्य'] : ['Antya', 'अंत्य'];
  _devata[n] = devataData[n];
}
export const NAK_GANA = _gana;
export const NAK_YONI = _yoni;
export const NAK_NADI = _nadi;
export const NAK_DEVATA = _devata;

// Yoni enemy pairs (for milan)
export const YONI_ENEMIES = {
  Ashwa: 'Mahisha', Gaja: 'Simha', Aja: 'Vanara', Sarpa: 'Nakula', Shwana: 'Mriga',
  Marjara: 'Mushaka', Gau: 'Vyaghra', Mahisha: 'Ashwa', Vyaghra: 'Gau', Mriga: 'Shwana',
  Vanara: 'Aja', Nakula: 'Sarpa', Simha: 'Gaja', Mushaka: 'Marjara',
};

// Varna by Moon rashi (janampatri convention — fixture: Makar -> Vaishya)
export const RASHI_VARNA = {
  Mesh: ['Kshatriya', 'क्षत्रिय'], Vrishabh: ['Vaishya', 'वैश्य'], Mithun: ['Shudra', 'शूद्र'],
  Kark: ['Brahmin', 'ब्राह्मण'], Simha: ['Kshatriya', 'क्षत्रिय'], Kanya: ['Vaishya', 'वैश्य'],
  Tula: ['Shudra', 'शूद्र'], Vrishchik: ['Brahmin', 'ब्राह्मण'], Dhanu: ['Kshatriya', 'क्षत्रिय'],
  Makar: ['Vaishya', 'वैश्य'], Kumbh: ['Shudra', 'शूद्र'], Meen: ['Brahmin', 'ब्राह्मण'],
};

// Vashya by Moon rashi
export const RASHI_VASHYA = {
  Mesh: ['Chatushpad', 'चतुष्पद'], Vrishabh: ['Chatushpad', 'चतुष्पद'], Mithun: ['Manav', 'मानव'],
  Kark: ['Jalchar', 'जलचर'], Simha: ['Vanchar', 'वनचर'], Kanya: ['Manav', 'मानव'],
  Tula: ['Manav', 'मानव'], Vrishchik: ['Keet', 'कीट'], Dhanu: ['Manav', 'मानव'],
  Makar: ['Jalchar', 'जलचर'], Kumbh: ['Manav', 'मानव'], Meen: ['Jalchar', 'जलचर'],
};

export const TITHIS = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'];
export const TITHI_HI = ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावस्या'];

export const VARAS = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];
export const VARA_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

export const YOGAS = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
export const YOGA_HI = ['विष्कंभ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्मा', 'इंद्र', 'वैधृति'];

// Karana cycle names (7 repeating)
export const KARANA_CYCLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];
export const KARANA_CYCLE_HI = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि'];
/** Proper 60-karana sequence: idx 0 Kimstughna, 1..56 cycle, 57 Shakuni, 58 Chatushpada, 59 Naga */
export function karanaName(idx) {
  if (idx === 0) return ['Kimstughna', 'किंस्तुघ्न'];
  if (idx === 57) return ['Shakuni', 'शकुनि'];
  if (idx === 58) return ['Chatushpada', 'चतुष्पाद'];
  if (idx === 59) return ['Naga', 'नाग'];
  const c = (idx - 1) % 7;
  return [KARANA_CYCLE[c], KARANA_CYCLE_HI[c]];
}

// Vimshottari sequence
export const DASHA_SEQ = [
  { lord: 'Ketu', years: 7 }, { lord: 'Shukra', years: 20 }, { lord: 'Surya', years: 6 },
  { lord: 'Chandra', years: 10 }, { lord: 'Mangal', years: 7 }, { lord: 'Rahu', years: 18 },
  { lord: 'Guru', years: 16 }, { lord: 'Shani', years: 19 }, { lord: 'Budh', years: 17 },
];
export const NAK_LORDS = ['Ketu', 'Shukra', 'Surya', 'Chandra', 'Mangal', 'Rahu', 'Guru', 'Shani', 'Budh'];

export const BHAVA_NAMES = [
  'Tanu', 'Dhana', 'Sahaja', 'Sukha', 'Putra', 'Riphu', 'Kalatra', 'Ayu',
  'Dharma', 'Karma', 'Labha', 'Vyaya',
];
export const BHAVA_HI = [
  'तनु', 'धन', 'सहज', 'सुख', 'पुत्र', 'रिपु', 'कलत्र', 'आयु',
  'धर्म', 'कर्म', 'लाभ', 'व्यय',
];

// Kaal Sarp 12 types by Rahu's house from lagna
export const KAAL_SARP_TYPES = {
  1: ['Anant', 'अनंत'], 2: ['Kulik', 'कुलिक'], 3: ['Vasuki', 'वासुकि'], 4: ['Shankhpal', 'शंखपाल'],
  5: ['Padma', 'पद्म'], 6: ['Mahapadma', 'महापद्म'], 7: ['Takshak', 'तक्षक'], 8: ['Karkotak', 'कर्कोटक'],
  9: ['Shankhachood', 'शंखचूड़'], 10: ['Ghatak', 'घातक'], 11: ['Vishdhar', 'विषधर'], 12: ['Sheshnag', 'शेषनाग'],
};
