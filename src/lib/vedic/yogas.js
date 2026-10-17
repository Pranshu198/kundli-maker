/**
 * Yoga detection — 38 classical yoga checks, every one genuinely conditional.
 *
 * Ported & audited from reference-omnitools/core/yogas-enhanced.js.
 * Audit notes (flaws found and removed):
 *  - No unconditional yogas: the old core pushed generic Dhana/Raj yogas with
 *    planets:[] regardless of the chart. That is forbidden here — every entry
 *    below fires only when its classical condition truly matches.
 *  - Kesari Yoga removed: it tested the exact same condition as Gajakesari
 *    (Guru in kendra from Chandra) and would double-count one yoga.
 *  - Parivartana now uses SIGN lords (old code used the lord of the house the
 *    planet sat in — wrong).
 *  - Neecha-bhanga exaltation map fixed: the old code mapped Chandra as the
 *    exalted planet of Vrishchika (wrong — Chandra is debilitated there; it
 *    exalts in Vrishabha). The map is now derived from DIGNITY in constants.js.
 *  - Nabhasa yogas count only the 7 visible grahas (Surya..Shani), never nodes.
 *  - Amala/Adhi/Vasumati/Vajra/Yava/Kartari treat Chandra as benefic only when
 *    waxing (Shukla paksha, from the computed tithi) — per the classical rule.
 *
 * Each yoga: { name, nameHi, category, categoryHi, strength, rule, effect,
 *               effectHi, planets[], houses[] }
 * houses[] are whole-sign house numbers counted from Lagna.
 */
import { RASHI_LORDS, DIGNITY } from './constants.js';
import { houseOf, aspects } from './doshas.js';

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];
const UPACHAYA = [3, 6, 10, 11];
const SEVEN = ['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani'];

const STRENGTH_RANK = { 'Very Strong': 4, 'Strong': 3, 'Moderate': 2, 'Mild': 1 };

const CATEGORY_HI = {
  'Mahapurusha': 'महापुरुष योग',
  'Chandra Yoga': 'चंद्र योग',
  'Surya Yoga': 'सूर्य योग',
  'Raja': 'राज योग',
  'Dhana': 'धन योग',
  'Nabhasa': 'नभस योग',
  'Vidya': 'विद्या योग',
  'Arishta': 'अरिष्ट योग',
  'Kartari': 'कर्तरी योग',
  'Special': 'विशेष योग',
};

// Planet exalted in each rashi (for Neecha Bhanga) — derived from DIGNITY.
const EXALTED_IN = {};
for (const id of SEVEN) {
  const d = DIGNITY[id];
  if (d && d.ex) EXALTED_IN[d.ex[0]] = id;
}

/**
 * Detect all yogas present in the chart.
 * @param {Object} kundli — full kundli object (grahas, lagna, panchang, meta)
 */
export function detectYogas(kundli) {
  const yogas = [];
  const G = {};
  for (const g of kundli.grahas) G[g.id] = g;
  const lagnaRashi = kundli.lagna.rashiIdx;
  const moonRashi = G.Chandra.rashiIdx;
  const moonHouse = G.Chandra.house;

  const houseLord = (n) => RASHI_LORDS[(lagnaRashi + n - 1) % 12];
  const relHouse = (grahaId, refRashi) => houseOf(G[grahaId].rashiIdx, refRashi);
  const inHouses = (id, list) => list.includes(G[id].house);
  const strong = (id) => ['exalted', 'moolatrikona', 'own'].includes(G[id].dignity.type);
  const uniq = (arr) => [...new Set(arr)];
  // Chandra counts as benefic only when waxing (Shukla paksha); Budh is counted
  // benefic per the standard simplification used in yoga texts.
  const waxing = kundli.panchang.tithi.idx < 15;
  const benefic = (id) =>
    id === 'Guru' || id === 'Shukra' || id === 'Budh' || (id === 'Chandra' && waxing);
  const malefic = (id) =>
    id === 'Surya' || id === 'Mangal' || id === 'Shani' ||
    id === 'Rahu' || id === 'Ketu' || (id === 'Chandra' && !waxing);

  function push(y) {
    yogas.push({
      categoryHi: CATEGORY_HI[y.category] || y.category,
      ...y,
    });
  }

  // ═══════════════ PANCH MAHAPURUSHA (planet in kendra, own/exalted) ═══════════════
  const maha = [
    ['Mangal', 'Ruchaka Yoga', 'रुचक योग',
      'Courage, leadership and command; success in competitive fields, land and administration; strong physique.',
      'साहस, नेतृत्व और पराक्रम; प्रतिस्पर्धा, भूमि व प्रशासन में सफलता; बलिष्ठ शरीर।'],
    ['Budh', 'Bhadra Yoga', 'भद्र योग',
      'Sharp intellect, scholarship and eloquence; distinction in trade, accounts and counsel.',
      'तीक्ष्ण बुद्धि, विद्वता और वाक्पटुता; व्यापार, लेखा व परामर्श में विशेषता।'],
    ['Guru', 'Hamsa Yoga', 'हंस योग',
      'Wisdom, dharma and respected counsel; honour, wealth and a virtuous, long life.',
      'ज्ञान, धर्म और सम्मानित परामर्श; प्रतिष्ठा, धन और सदाचारी दीर्घ जीवन।'],
    ['Shukra', 'Malavya Yoga', 'मालव्य योग',
      'Beauty, comforts and artistic refinement; vehicles, luxuries and a happy married life.',
      'सौंदर्य, सुख-सुविधा और कलात्मकता; वाहन, विलासिता और सुखी दांपत्य जीवन।'],
    ['Shani', 'Shasha Yoga', 'शश योग',
      'Authority over people and resources; rise through discipline, service and perseverance.',
      'जनता व संसाधनों पर अधिकार; अनुशासन, सेवा और धैर्य से उन्नति।'],
  ];
  for (const [id, name, nameHi, effect, effectHi] of maha) {
    if (inHouses(id, KENDRA) && strong(id)) {
      const weakened = G[id].combust ? ' (weakened — planet is combust)' : '';
      push({
        name, nameHi, category: 'Mahapurusha',
        strength: G[id].combust ? 'Strong' : 'Very Strong',
        rule: `${id} in kendra (1/4/7/10) from Lagna, in own/exalted/moolatrikona sign${weakened}`,
        effect, effectHi,
        planets: [id], houses: [G[id].house],
      });
    }
  }

  // ═══════════════ CHANDRA YOGAS ═══════════════
  // Gajakesari — Guru in kendra from Chandra
  {
    const h = relHouse('Guru', moonRashi);
    if (KENDRA.includes(h)) {
      push({
        name: 'Gajakesari Yoga', nameHi: 'गजकेसरी योग', category: 'Chandra Yoga',
        strength: strong('Guru') ? 'Very Strong' : 'Strong',
        rule: 'Guru in kendra (1, 4, 7, 10) from Chandra',
        effect: 'Intelligence, lasting fame and wide respect; wealth grows and the native is honoured by the learned.',
        effectHi: 'बुद्धिमत्ता, स्थायी यश और व्यापक सम्मान; धन वृद्धि और विद्वानों में प्रतिष्ठा।',
        planets: ['Chandra', 'Guru'], houses: uniq([moonHouse, G.Guru.house]),
      });
    }
  }

  // Sunapha / Anapha / Durudhara — planets flanking the Moon
  {
    const flankers = SEVEN.filter((id) => id !== 'Surya'); // classical: other than Surya
    const in2 = flankers.filter((id) => relHouse(id, moonRashi) === 2);
    const in12 = flankers.filter((id) => relHouse(id, moonRashi) === 12);
    if (in2.length && in12.length) {
      push({
        name: 'Durudhara Yoga', nameHi: 'दुरुधरा योग', category: 'Chandra Yoga',
        strength: 'Strong',
        rule: 'Planets (other than Surya) in both 2nd and 12th from Chandra',
        effect: 'Wealth, generosity and happiness together; a full and comfortable life.',
        effectHi: 'धन, उदारता और सुख एक साथ; पूर्ण सुखमय जीवन।',
        planets: uniq(['Chandra', ...in2, ...in12]), houses: uniq([moonHouse, ...in2.map((id) => G[id].house), ...in12.map((id) => G[id].house)]),
      });
    } else {
      if (in2.length) push({
        name: 'Sunapha Yoga', nameHi: 'सुनफा योग', category: 'Chandra Yoga',
        strength: 'Moderate',
        rule: 'Planet(s) other than Surya in 2nd from Chandra',
        effect: 'Self-earned wealth and initiative; rise through one\'s own efforts.',
        effectHi: 'स्व-अर्जित धन और पहल; स्वयं के प्रयास से उन्नति।',
        planets: uniq(['Chandra', ...in2]), houses: uniq([moonHouse, ...in2.map((id) => G[id].house)]),
      });
      if (in12.length) push({
        name: 'Anapha Yoga', nameHi: 'अनफा योग', category: 'Chandra Yoga',
        strength: 'Moderate',
        rule: 'Planet(s) other than Surya in 12th from Chandra',
        effect: 'Comforts, generosity and a pleasant life; gains through refined pursuits.',
        effectHi: 'सुख-सुविधा, उदारता और सुखद जीवन; परिष्कृत कार्यों से लाभ।',
        planets: uniq(['Chandra', ...in12]), houses: uniq([moonHouse, ...in12.map((id) => G[id].house)]),
      });
    }
  }

  // Kemadruma — Moon isolated (with classical bhanga check)
  {
    const breakers = ['Mangal', 'Budh', 'Guru', 'Shukra', 'Shani']
      .filter((id) => G[id].house === moonHouse || [2, 12].includes(relHouse(id, moonRashi)));
    if (breakers.length === 0) {
      // Bhanga: Guru sambandha with Chandra, or strong Lagna lord in kendra, or Adhi yoga
      const guruSambandha = aspects('Guru', G.Guru.rashiIdx, moonRashi) || G.Guru.house === moonHouse;
      const lagnaLord = houseLord(1);
      const lagnaBhanga = KENDRA.includes(G[lagnaLord].house) && strong(lagnaLord);
      const bhanga = guruSambandha || lagnaBhanga;
      if (bhanga) {
        push({
          name: 'Kemadruma Bhanga', nameHi: 'केमद्रुम भंग', category: 'Chandra Yoga',
          strength: 'Moderate',
          rule: 'Kemadruma present but cancelled — Guru sambandha with Chandra, or strong Lagna lord in kendra',
          effect: 'The affliction is nullified; early struggles convert into eventual eminence.',
          effectHi: 'दोष भंग हो गया; प्रारंभिक संघर्ष अंततः उच्चता में बदलता है।',
          planets: ['Chandra', 'Guru'], houses: [moonHouse],
        });
      } else {
        push({
          name: 'Kemadruma Yoga', nameHi: 'केमद्रुम योग', category: 'Arishta',
          strength: 'Mild',
          rule: 'No planet (except Surya/Rahu/Ketu) in 2nd/12th from Chandra or conjunct it',
          effect: 'Mental restlessness and early struggles; steadiness of mind is needed. Cancelled by Guru\'s sambandha or a strong Lagna.',
          effectHi: 'मानसिक अस्थिरता व प्रारंभिक संघर्ष; मन की स्थिरता आवश्यक। गुरु-संबंध या बलवान लग्नेश से भंग।',
          planets: ['Chandra'], houses: [moonHouse],
        });
      }
    }
  }

  // Shakata — Guru in 6/8/12 from Chandra
  {
    const h = relHouse('Guru', moonRashi);
    if ([6, 8, 12].includes(h)) {
      push({
        name: 'Shakata Yoga', nameHi: 'शकट योग', category: 'Arishta',
        strength: 'Mild',
        rule: 'Guru in 6th/8th/12th from Chandra',
        effect: 'Fluctuating fortunes — rise and fall alternate like a wheel; patience preserves gains.',
        effectHi: 'घटता-बढ़ता भाग्य — उतार-चढ़ाव; धैर्य से लाभ सुरक्षित रहता है।',
        planets: ['Chandra', 'Guru'], houses: uniq([moonHouse, G.Guru.house]),
      });
    }
  }

  // Chandra-Mangal — Dhana yoga
  if (G.Chandra.house === G.Mangal.house) {
    push({
      name: 'Chandra-Mangal Yoga', nameHi: 'चंद्र-मंगल योग', category: 'Dhana',
      strength: 'Strong',
      rule: 'Chandra and Mangal conjunct (same house)',
      effect: 'Wealth through enterprise, courage and property; sharp business acumen.',
      effectHi: 'उद्यम, साहस और संपत्ति से धन; कुशाग्र व्यावसायिक बुद्धि।',
      planets: ['Chandra', 'Mangal'], houses: [G.Chandra.house],
    });
  }

  // ═══════════════ SURYA YOGAS (Vesi / Vasi / Ubhayachari) ═══════════════
  {
    const others = ['Mangal', 'Budh', 'Guru', 'Shukra', 'Shani']; // classical: other than Chandra
    const sunRashi = G.Surya.rashiIdx;
    const in2 = others.filter((id) => relHouse(id, sunRashi) === 2);
    const in12 = others.filter((id) => relHouse(id, sunRashi) === 12);
    const hs = (ids) => uniq([G.Surya.house, ...ids.map((id) => G[id].house)]);
    if (in2.length && in12.length) {
      push({
        name: 'Ubhayachari Yoga', nameHi: 'उभयचरी योग', category: 'Surya Yoga',
        strength: 'Strong',
        rule: 'Planets (other than Chandra) in both 2nd and 12th from Surya',
        effect: 'A balanced, capable leader; strength on all sides and steady fortune.',
        effectHi: 'संतुलित, सक्षम नेतृत्व; सर्वत्र बल और स्थिर भाग्य।',
        planets: uniq(['Surya', ...in2, ...in12]), houses: hs([...in2, ...in12]),
      });
    } else {
      if (in2.length) push({
        name: 'Vesi Yoga', nameHi: 'वेशि योग', category: 'Surya Yoga',
        strength: 'Moderate',
        rule: 'Planet(s) other than Chandra in 2nd from Surya',
        effect: 'Courage and resourcefulness; support from influential people.',
        effectHi: 'साहस और साधन-संपन्नता; प्रभावशाली लोगों का सहयोग।',
        planets: uniq(['Surya', ...in2]), houses: hs(in2),
      });
      if (in12.length) push({
        name: 'Vasi Yoga', nameHi: 'वाशि योग', category: 'Surya Yoga',
        strength: 'Moderate',
        rule: 'Planet(s) other than Chandra in 12th from Surya',
        effect: 'Skill, good counsel and balanced judgement; steady progress.',
        effectHi: 'कुशलता, सुमंत्रणा और संतुलित निर्णय; स्थिर प्रगति।',
        planets: uniq(['Surya', ...in12]), houses: hs(in12),
      });
    }
  }

  // Budhaditya — Surya + Budh conjunct, Budh not combust
  if (G.Surya.house === G.Budh.house && !G.Budh.combust) {
    push({
      name: 'Budhaditya Yoga', nameHi: 'बुधादित्य योग', category: 'Vidya',
      strength: strong('Budh') ? 'Very Strong' : 'Strong',
      rule: 'Surya and Budh conjunct, Budh not combust',
      effect: 'Brilliant intellect and clarity of thought; distinction in learning and administration.',
      effectHi: 'प्रखर बुद्धि और स्पष्ट चिंतन; विद्या व प्रशासन में विशेषता।',
      planets: ['Surya', 'Budh'], houses: [G.Surya.house],
    });
  }

  // ═══════════════ RAJA YOGAS ═══════════════
  // Kendra lord + Trikona lord sambandha (conjunction)
  {
    const kLords = uniq([1, 4, 7, 10].map(houseLord));
    const tLords = uniq([5, 9].map(houseLord));
    for (const k of kLords) {
      for (const t of tLords) {
        if (k !== t && G[k].house === G[t].house) {
          push({
            name: `Raja Yoga (${k}+${t})`, nameHi: 'राज योग', category: 'Raja',
            strength: 'Strong',
            rule: `Kendra lord ${k} and trikona lord ${t} conjunct (sambandha)`,
            effect: 'Authority, rank and prosperity; the native rises to a position of command.',
            effectHi: 'अधिकार, पद और समृद्धि; नेतृत्व के पद तक उन्नति।',
            planets: [k, t], houses: [G[k].house],
          });
        }
      }
    }
  }

  // Dharmakarmadhipati — 9th & 10th lords conjunct
  {
    const l9 = houseLord(9), l10 = houseLord(10);
    if (G[l9].house === G[l10].house) {
      const h = G[l9].house;
      push({
        name: 'Dharmakarmadhipati Yoga', nameHi: 'धर्मकर्माधिपति योग', category: 'Raja',
        strength: [...KENDRA, ...TRIKONA].includes(h) ? 'Strong' : 'Moderate',
        rule: 'Lords of the 9th and 10th houses conjunct',
        effect: 'Fortune and career rise together; high status through righteous action.',
        effectHi: 'भाग्य और कर्म साथ-साथ उन्नत; धर्मानुकूल कर्म से उच्च पद।',
        planets: uniq([l9, l10]), houses: [h],
      });
    }
  }

  // Neecha Bhanga Raja Yoga
  for (const id of SEVEN) {
    if (G[id].dignity.type !== 'debilitated') continue;
    const debRashi = G[id].rashiIdx;
    const signLord = RASHI_LORDS[debRashi];
    const exalter = EXALTED_IN[debRashi];
    const kendraFrom = (r) => KENDRA.includes(houseOf(r, lagnaRashi)) || KENDRA.includes(houseOf(r, moonRashi));
    const reasons = [];
    if (kendraFrom(G[signLord].rashiIdx)) reasons.push(`${signLord} (lord of debilitation sign) in kendra`);
    if (exalter && kendraFrom(G[exalter].rashiIdx)) reasons.push(`${exalter} (exalted in that sign) in kendra`);
    if (G[signLord].house === G[id].house || (exalter && G[exalter].house === G[id].house))
      reasons.push('conjunct its sign lord / exalting planet');
    if (reasons.length) {
      push({
        name: `Neecha Bhanga Raja Yoga (${id})`, nameHi: 'नीचभंग राज योग', category: 'Raja',
        strength: 'Strong',
        rule: `Debilitated ${id}: neecha cancelled — ${reasons.join('; ')}`,
        effect: 'Early setbacks turn into a great rise; success after struggle, often from the mid-30s.',
        effectHi: 'प्रारंभिक बाधाएँ महान उन्नति में बदलती हैं; संघर्ष के बाद सफलता।',
        planets: uniq([id, signLord, exalter].filter(Boolean)), houses: [G[id].house],
      });
    }
  }

  // Vipareeta Raja Yoga — dusthana lord in dusthana
  for (const h of DUSTHANA) {
    const lord = houseLord(h);
    if (DUSTHANA.includes(G[lord].house)) {
      push({
        name: `Vipareeta Raja Yoga (${lord})`, nameHi: 'विपरीत राज योग', category: 'Raja',
        strength: 'Moderate',
        rule: `Lord of dusthana ${h} placed in dusthana (${G[lord].house})`,
        effect: 'Victory over enemies and adversity; sudden gains after difficulties.',
        effectHi: 'शत्रुओं व विपत्तियों पर विजय; कठिनाइयों के बाद आकस्मिक लाभ।',
        planets: [lord], houses: [G[lord].house],
      });
    }
  }

  // Yogakaraka — owns kendra + trikona, placed in kendra/trikona
  for (const id of SEVEN) {
    const owned = [];
    for (let h = 1; h <= 12; h++) if (houseLord(h) === id) owned.push(h);
    const ownsKendra = owned.some((h) => KENDRA.includes(h));
    const ownsTrikona = owned.some((h) => h === 5 || h === 9); // house 1 not counted as trikona here
    if (ownsKendra && ownsTrikona && [...KENDRA, 5, 9].includes(G[id].house)) {
      push({
        name: `Yogakaraka Raja Yoga (${id})`, nameHi: 'योगकारक राज योग', category: 'Raja',
        strength: 'Strong',
        rule: `${id} owns a kendra and a trikona (houses ${owned.join(', ')}) and sits in kendra/trikona`,
        effect: 'A powerful Raja yoga; rise to authority and lasting success.',
        effectHi: 'प्रबल राज योग; अधिकार पद तक उन्नति और स्थायी सफलता।',
        planets: [id], houses: [G[id].house],
      });
    }
  }

  // Chamara — strong Lagna lord in kendra, aspected/joined by Guru
  {
    const ll = houseLord(1);
    const guruJoin = aspects('Guru', G.Guru.rashiIdx, G[ll].rashiIdx) || G.Guru.house === G[ll].house;
    if (KENDRA.includes(G[ll].house) && strong(ll) && guruJoin) {
      push({
        name: 'Chamara Yoga', nameHi: 'चामर योग', category: 'Raja',
        strength: 'Strong',
        rule: 'Lagna lord exalted/in own sign in kendra, aspected or joined by Guru',
        effect: 'Refined tastes, learning and high honour; a king-like, respected life.',
        effectHi: 'परिष्कृत रुचि, विद्या और उच्च सम्मान; राजसी जीवन।',
        planets: uniq([ll, 'Guru']), houses: [G[ll].house],
      });
    }
  }

  // Pushkala — Chandra with strong Lagna lord in kendra/trikona
  {
    const ll = houseLord(1);
    if (G.Chandra.house === G[ll].house && [...KENDRA, 5, 9].includes(G.Chandra.house) && strong(ll)) {
      push({
        name: 'Pushkala Yoga', nameHi: 'पुष्कल योग', category: 'Raja',
        strength: 'Moderate',
        rule: 'Chandra with a strong (exalted/own/moolatrikona) Lagna lord in kendra/trikona',
        effect: 'Wealth, sweet speech and a respected position; an auspicious life.',
        effectHi: 'धन, मधुर वाणी और सम्मानित पद; शुभ जीवन।',
        planets: ['Chandra', ll], houses: [G.Chandra.house],
      });
    }
  }

  // Adhi — benefics in 6/7/8 from Chandra
  {
    const hs678 = [6, 7, 8].map((k) => ((moonHouse - 1 + k - 1) % 12) + 1);
    const bens = SEVEN.filter((id) => benefic(id) && hs678.includes(G[id].house));
    if (bens.length >= 2) {
      push({
        name: 'Adhi Yoga', nameHi: 'अधि योग', category: 'Raja',
        strength: bens.length >= 3 ? 'Strong' : 'Moderate',
        rule: 'Two or more natural benefics in 6th/7th/8th from Chandra',
        effect: 'A commanding personality; wealth, learning and a large following.',
        effectHi: 'प्रभावशाली व्यक्तित्व; धन, विद्या और बड़ा अनुयायी वर्ग।',
        planets: uniq(['Chandra', ...bens]), houses: uniq(hs678),
      });
    }
  }

  // Lagnadhi — benefics in 6/7/8 from Lagna
  {
    const hs678 = [6, 7, 8];
    const bens = SEVEN.filter((id) => benefic(id) && hs678.includes(G[id].house));
    if (bens.length >= 2) {
      push({
        name: 'Lagnadhi Yoga', nameHi: 'लग्नाधि योग', category: 'Raja',
        strength: bens.length >= 3 ? 'Strong' : 'Moderate',
        rule: 'Two or more natural benefics in 6th/7th/8th from Lagna',
        effect: 'Influence and prosperity; success through one\'s own standing and merit.',
        effectHi: 'प्रभाव और समृद्धि; स्वयं के बल और योग्यता से सफलता।',
        planets: uniq(bens), houses: uniq(hs678),
      });
    }
  }

  // Amala — benefic in 10th from Chandra (else 10th from Lagna)
  {
    const tenthMoon = ((moonHouse - 1 + 9) % 12) + 1;
    let ben = SEVEN.find((id) => benefic(id) && G[id].house === tenthMoon);
    let ref = 'Chandra';
    if (!ben) { ben = SEVEN.find((id) => benefic(id) && G[id].house === 10); ref = 'Lagna'; }
    if (ben) {
      push({
        name: 'Amala Yoga', nameHi: 'अमल योग', category: 'Raja',
        strength: 'Moderate',
        rule: `Natural benefic (${ben}) in 10th from ${ref}`,
        effect: 'A spotless reputation and virtuous conduct; respect in profession and society.',
        effectHi: 'निर्मल यश और सदाचार; व्यवसाय व समाज में सम्मान।',
        planets: [ben], houses: [G[ben].house],
      });
    }
  }

  // ═══════════════ DHANA YOGAS ═══════════════
  // Lakshmi — 9th lord strong in kendra/trikona
  {
    const l9 = houseLord(9);
    if ([...KENDRA, 5, 9].includes(G[l9].house) && strong(l9)) {
      push({
        name: 'Lakshmi Yoga', nameHi: 'लक्ष्मी योग', category: 'Dhana',
        strength: 'Strong',
        rule: 'Lord of the 9th in kendra/trikona, exalted or in own/moolatrikona sign',
        effect: 'Great wealth with virtue; a refined, generous and fortunate life.',
        effectHi: 'सद्गुण सहित महान धन; परिष्कृत, उदार और भाग्यशाली जीवन।',
        planets: [l9], houses: [G[l9].house],
      });
    }
  }

  // Dhana — 2nd & 11th lords conjunct
  {
    const l2 = houseLord(2), l11 = houseLord(11);
    if (G[l2].house === G[l11].house) {
      push({
        name: 'Dhana Yoga', nameHi: 'धन योग', category: 'Dhana',
        strength: [...KENDRA, ...TRIKONA, 2, 11].includes(G[l2].house) ? 'Strong' : 'Moderate',
        rule: 'Lords of the 2nd and 11th houses conjunct',
        effect: 'Accumulation of wealth; gains through multiple sources.',
        effectHi: 'धन संचय; विविध स्रोतों से लाभ।',
        planets: uniq([l2, l11]), houses: [G[l2].house],
      });
    }
  }

  // Vasumati — 3+ benefics in upachaya
  {
    const bens = SEVEN.filter((id) => benefic(id) && UPACHAYA.includes(G[id].house));
    if (bens.length >= 3) {
      push({
        name: 'Vasumati Yoga', nameHi: 'वसुमती योग', category: 'Dhana',
        strength: 'Moderate',
        rule: 'Three or more benefics in upachaya houses (3, 6, 10, 11)',
        effect: 'Wealth that grows with effort and time; self-made prosperity.',
        effectHi: 'परिश्रम और समय से बढ़ता धन; स्व-निर्मित समृद्धि।',
        planets: uniq(bens), houses: uniq(bens.map((id) => G[id].house)),
      });
    }
  }

  // Daridra — 11th lord in dusthana
  {
    const l11 = houseLord(11);
    if (DUSTHANA.includes(G[l11].house)) {
      push({
        name: 'Daridra Yoga', nameHi: 'दरिद्र योग', category: 'Arishta',
        strength: 'Mild',
        rule: 'Lord of the 11th placed in dusthana (6/8/12)',
        effect: 'Obstructed gains and financial strain; wealth comes only through hard labour.',
        effectHi: 'लाभ में बाधा व आर्थिक तंगी; कठोर परिश्रम से ही धन।',
        planets: [l11], houses: [G[l11].house],
      });
    }
  }

  // ═══════════════ VIDYA YOGAS ═══════════════
  // Saraswati — Guru, Shukra, Budh in kendra/trikona/2nd
  {
    const ok = ['Guru', 'Shukra', 'Budh'].every((id) => [...KENDRA, ...TRIKONA, 2].includes(G[id].house));
    if (ok) {
      push({
        name: 'Saraswati Yoga', nameHi: 'सरस्वती योग', category: 'Vidya',
        strength: 'Strong',
        rule: 'Guru, Shukra and Budh all in kendra, trikona or 2nd house',
        effect: 'Mastery of arts and sciences; eloquence, scholarship and lasting renown.',
        effectHi: 'कला-विज्ञान में निपुणता; वाक्पटुता, विद्वता और स्थायी ख्याति।',
        planets: ['Guru', 'Shukra', 'Budh'],
        houses: uniq(['Guru', 'Shukra', 'Budh'].map((id) => G[id].house)),
      });
    }
  }

  // ═══════════════ NABHASA YOGAS (7 grahas only) ═══════════════
  {
    const inKendras = KENDRA.map((h) => SEVEN.some((id) => G[id].house === h));
    if (inKendras.every(Boolean)) {
      push({
        name: 'Chatussagara Yoga', nameHi: 'चतुःसागर योग', category: 'Nabhasa',
        strength: 'Strong',
        rule: 'Planets occupying all four kendras (1, 4, 7, 10) — Nabhasa',
        effect: 'Fame spreading in all directions like the ocean; wealth, status and a significant life.',
        effectHi: 'चारों दिशाओं में सागर-सा यश; धन, पद और महत्वपूर्ण जीवन।',
        planets: uniq(SEVEN.filter((id) => KENDRA.includes(G[id].house))), houses: [...KENDRA],
      });
    }
    // Vajra: benefics in 1/7, malefics in 4/10
    const bens = SEVEN.filter(benefic);
    const mals = SEVEN.filter(malefic);
    if (bens.length && bens.every((id) => [1, 7].includes(G[id].house)) &&
        mals.length && mals.every((id) => [4, 10].includes(G[id].house))) {
      push({
        name: 'Vajra Yoga', nameHi: 'वज्र योग', category: 'Nabhasa',
        strength: 'Moderate',
        rule: 'All benefics in Lagna/7th and all malefics in 4th/10th (Nabhasa; nodes excluded, Chandra benefic iff waxing)',
        effect: 'Radiant fortune in youth and old age; a fortunate, protected life.',
        effectHi: 'युवावस्था व वृद्धावस्था में उज्ज्वल भाग्य; सुरक्षित भाग्यशाली जीवन।',
        planets: [...bens, ...mals], houses: [1, 4, 7, 10],
      });
    }
    // Yava: malefics in 1/7, benefics in 4/10
    if (mals.length && mals.every((id) => [1, 7].includes(G[id].house)) &&
        bens.length && bens.every((id) => [4, 10].includes(G[id].house))) {
      push({
        name: 'Yava Yoga', nameHi: 'यव योग', category: 'Nabhasa',
        strength: 'Moderate',
        rule: 'All malefics in Lagna/7th and all benefics in 4th/10th (Nabhasa; nodes excluded, Chandra benefic iff waxing)',
        effect: 'Prosperity in middle age; strength built through effort and endurance.',
        effectHi: 'मध्य आयु में समृद्धि; परिश्रम और धैर्य से अर्जित बल।',
        planets: [...mals, ...bens], houses: [1, 4, 7, 10],
      });
    }
  }

  // ═══════════════ SPECIAL YOGAS ═══════════════
  // Parivartana — mutual exchange of signs
  for (let i = 0; i < SEVEN.length; i++) {
    for (let j = i + 1; j < SEVEN.length; j++) {
      const a = SEVEN[i], b = SEVEN[j];
      if (G[a].rashiIdx === G[b].rashiIdx) continue;
      if (RASHI_LORDS[G[a].rashiIdx] === b && RASHI_LORDS[G[b].rashiIdx] === a) {
        const ha = G[a].house, hb = G[b].house;
        const kt = [...KENDRA, 5, 9];
        const mahaP = kt.includes(ha) && kt.includes(hb);
        const dust = DUSTHANA.includes(ha) || DUSTHANA.includes(hb);
        push({
          name: mahaP ? `Maha Parivartana Yoga (${a}-${b})` : `Parivartana Yoga (${a}-${b})`,
          nameHi: 'परिवर्तन योग', category: 'Special',
          strength: mahaP ? 'Strong' : dust ? 'Mild' : 'Moderate',
          rule: `${a} and ${b} occupy each other's signs (mutual exchange)`,
          effect: 'Both bhavas prosper through mutual support; strong results for the houses and significations involved.',
          effectHi: 'परस्पर सहयोग से दोनों भाव सुदृढ़; संबंधित भावों के प्रबल फल।',
          planets: [a, b], houses: uniq([ha, hb]),
        });
      }
    }
  }

  // Mahabhagya — gender + day/night + odd/even signs
  {
    const g = (kundli.meta.gender || '').toLowerCase();
    const isMale = g === 'male' || g === 'm';
    const isFemale = g === 'female' || g === 'f';
    const odd = (r) => r % 2 === 0; // Mesh(0) is odd
    if (isMale && kundli.meta.isDayBirth &&
        odd(G.Surya.rashiIdx) && odd(G.Chandra.rashiIdx) && odd(lagnaRashi)) {
      push({
        name: 'Mahabhagya Yoga', nameHi: 'महाभाग्य योग', category: 'Special',
        strength: 'Very Strong',
        rule: 'Male, day birth: Surya, Chandra and Lagna all in odd (masculine) signs',
        effect: 'Extraordinary fortune; a remarkably blessed, famous and successful life.',
        effectHi: 'असाधारण भाग्य; अत्यंत धन्य, प्रसिद्ध और सफल जीवन।',
        planets: ['Surya', 'Chandra'], houses: uniq([G.Surya.house, moonHouse, 1]),
      });
    }
    if (isFemale && !kundli.meta.isDayBirth &&
        !odd(G.Surya.rashiIdx) && !odd(G.Chandra.rashiIdx) && !odd(lagnaRashi)) {
      push({
        name: 'Mahabhagya Yoga', nameHi: 'महाभाग्य योग', category: 'Special',
        strength: 'Very Strong',
        rule: 'Female, night birth: Surya, Chandra and Lagna all in even (feminine) signs',
        effect: 'Extraordinary fortune; a remarkably blessed and successful life.',
        effectHi: 'असाधारण भाग्य; अत्यंत धन्य और सफल जीवन।',
        planets: ['Surya', 'Chandra'], houses: uniq([G.Surya.house, moonHouse, 1]),
      });
    }
  }

  // Kartari — planets hemming the Lagna (2nd & 12th)
  {
    const in2 = kundli.grahas.filter((g) => g.house === 2).map((g) => g.id);
    const in12 = kundli.grahas.filter((g) => g.house === 12).map((g) => g.id);
    if (in2.some(benefic) && in12.some(benefic)) {
      push({
        name: 'Shubha Kartari Yoga', nameHi: 'शुभ कर्तरी योग', category: 'Kartari',
        strength: 'Moderate',
        rule: 'Benefic planets in both 2nd and 12th from Lagna (hemming)',
        effect: 'A protected, supported life; smooth progress with helpful surroundings.',
        effectHi: 'सुरक्षित व समर्थित जीवन; अनुकूल परिवेश में सरल प्रगति।',
        planets: uniq([...in2.filter(benefic), ...in12.filter(benefic)]), houses: [2, 12],
      });
    }
    if (in2.some(malefic) && in12.some(malefic)) {
      push({
        name: 'Papa Kartari Yoga', nameHi: 'पाप कर्तरी योग', category: 'Kartari',
        strength: 'Mild',
        rule: 'Malefic planets in both 2nd and 12th from Lagna (hemming)',
        effect: 'Life feels hemmed in by difficulties; progress demands extra effort and caution.',
        effectHi: 'कठिनाइयों से घेराव का भाव; प्रगति हेतु अतिरिक्त प्रयास और सावधानी आवश्यक।',
        planets: uniq([...in2.filter(malefic), ...in12.filter(malefic)]), houses: [2, 12],
      });
    }
  }

  yogas.sort((a, b) => (STRENGTH_RANK[b.strength] || 0) - (STRENGTH_RANK[a.strength] || 0)
    || a.name.localeCompare(b.name));
  return yogas;
}
