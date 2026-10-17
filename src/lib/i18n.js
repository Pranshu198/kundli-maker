/** Bilingual helper — Hindi default for kundli terms. */
export function T(hi, en, lang) {
  return lang === 'hi' ? hi : en;
}

export const STRINGS = {
  appName: ['कुंडली', 'Kundli'],
  appSub: ['वैदिक जन्मपत्री स्टूडियो', 'Vedic Janampatri Studio'],
  makeKundli: ['कुंडली बनाएं', 'Make Kundli'],
  tabs: {
    kundli: ['कुंडली', 'Chart'],
    panchang: ['पंचांग', 'Panchang'],
    graha: ['ग्रह', 'Planets'],
    dasha: ['दशा', 'Dasha'],
    yogdosh: ['योग · दोष', 'Yogas · Doshas'],
    gochar: ['गोचर', 'Transits'],
    bala: ['बल', 'Strength'],
    milan: ['मिलान', 'Matching'],
    muhurat: ['मुहूर्त', 'Muhurat'],
    upay: ['उपाय', 'Remedies'],
  },
};
