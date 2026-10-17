# Kundli Maker — Module Contract (SPEC)

Engine: Swiss Ephemeris WASM (`src/lib/engine/sweph.js`), fallback astronomy-engine.
All longitudes sidereal degrees 0–360 unless noted. Lahiri default; Raman/KP/Fagan/Custom supported.

## `computeKundli(input)` → kundli object (`src/lib/vedic/kundli.js`)

input: `{ name, gender, dateStr:'YYYY-MM-DD', timeStr:'HH:MM'|'HH:MM:SS', lat, lon, place, utcOffsetHours, ayanamsaMode:'lahiri'|'raman'|'kp'|'fagan'|'custom', customAyanamsa, nodeType:'mean'|'true' }`

### kundli shape (exact — UI components depend on this)

```js
{
  meta: {
    name, gender, dateStr, timeStr, place, lat, lon, utcOffsetHours,
    ayanamsaMode, nodeType, engineType: 'swisseph-wasm'|'astronomy-fallback',
    ayanamsa: 23.9577,            // degrees
    jdUT: 2454175.7757,
    birthDate: Date,              // local civil birth moment as Date (UTC instant)
    isDayBirth: true,             // Sun in houses 7..12 from lagna (whole-sign approx)
    computedAt: ISOString,
  },
  lagna:   { lon, rashiIdx, rashi:'Mithun', rashiHi:'मिथुन', degree, dms },
  chandra: { lon, rashiIdx, rashi, rashiHi, degree, dms,
             nakshatra: { idx, name:'Shravana', nameHi:'श्रवण', pada:4, lord:'Chandra',
                          gana:['Deva','देव'], yoni:['Vanar','वानर','F'],
                          nadi:['Antya','अंत्य'], devata:['Vishnu','विष्णु'],
                          degInNakshatra, fraction } },
  panchang: {
    tithi:  { idx, name, nameHi, paksha:['Shukla','शुक्ल'], elongation },
    karana: { idx, name, nameHi },
    yoga:   { idx, name, nameHi, longitude },
    vara:   { idx, name, nameHi },
    // + derived:
    varna: ['Vaishya','वैश्य'], vashya: ['Jalchar','जलचर'],
    tatva: ['Prithvi','पृथ्वी'],
  },
  grahas: [ // 9 entries, order Surya..Ketu
    { id:'Surya', hi:'सूर्य', en:'Sun', abbr:'Su', abbrHi:'सू',
      lon, tropLon, lat, speed,        // speed deg/day; retro = speed<0 (nodes always retro)
      retro: bool, combust: bool,
      rashiIdx, rashi, rashiHi, degInRashi, dms:'1° 20\' 3.4"',
      nakshatra: { idx, name, nameHi, pada },
      dignity: { type:'exalted'|'debilitated'|'moolatrikona'|'own'|'friend'|'enemy'|'neutral',
                 label:'Exalted (Uchch)', score:30 },
      avastha: { name:'Yuva', hi:'युवा', strength:'strongest' },
      house: 3,                        // whole-sign house number from lagna
      vargas: { D1:{rashiIdx,rashi,rashiHi,degree}, ..., D9:{..., vargottama:bool}, D10, D7, D12, D30, ... } }
  ],
  houses: [ { num:1..12, rashiIdx, rashi, rashiHi, grahaIds:['Surya',...] } ],  // whole-sign
  dasha: <vimshottariDasha API> ,   // { mahadashas, antardashasOf(i), pratyantarsOf(i,j), sookshmasOf(i,j,k), current(at) }
  doshas: {
    manglik: { present, rawPresent, fullyCancelled, fromLagna:{ref,house,present,cancelled,cancellations[],intensity}, fromMoon, fromShukra, rule },
    kaalSarp: { present, type:{house,name:'Anant',nameHi:'अनंत'}|null, outside:[], rule },
    pitra: { present, details[], rule },
    // sadeSati computed separately (needs transit) — see gochar.js
  },
  yogas: [...],          // yogas.js — see below
  ashtakavarga: {...},   // ashtakavarga.js — see below
  shadbala: [...],       // shadbala.js — see below
}
```

### yogas.js — `detectYogas(kundli)` → array
Each yoga ONLY if its rule truly matches (no unconditional filler — the old core
had fake always-on Dhana/Raj yogas; never do that):
```js
{ name:'Gajakesari Yoga', nameHi:'गजकेसरी योग', category:'Chandra Yoga'|'Mahapurusha'|'Dhana'|'Raja'|'Nabhasa'|...,
  strength:'Strong'|'Very Strong'|'Moderate',
  rule:'Guru in kendra (1,4,7,10) from Chandra',   // exact classical rule cited
  effect:'...',                                     // short traditional phala
  planets:['Chandra','Guru'], houses:[4] }
```
Port & audit `reference-omnitools/core/yogas-enhanced.js` (150+ detector). Keep every
rule that is genuinely conditional; drop anything pushed unconditionally.

### ashtakavarga.js — `ashtakavargaOf(grahas, lagnaRashiIdx)` →
Use the VERIFIED BPHS tables below (sums: planet totals 48/49/39/54/56/52/39, grand 337).
```js
{ bav: { Surya:[12 numbers], Chandra:[...], ... },   // per-planet bindus per rashi (Mesh..Meen)
  sav: [12 numbers],                                  // sarvashtakavarga per rashi
  totals: { Surya:48, Chandra:49, Mangal:39, Budh:54, Guru:56, Shukra:52, Shani:39 },
  savTotal: 337,
  strongest:[rashiIdx...], weakest:[...] }             // sav >= 30 / < 25
```
Tables (benefic houses counted from the CONTRIBUTOR's rashi):
- SUN(48): Sun:1,2,4,7,8,9,10,11; Moon:3,6,10,11; Mars:1,2,4,7,8,9,10,11; Mercury:3,5,6,9,10,11,12; Jupiter:5,6,9,11; Venus:6,7,12; Saturn:1,2,4,7,8,9,10,11; Lagna:3,4,6,10,11,12
- MOON(49): Sun:3,6,7,8,10,11; Moon:1,3,6,7,10,11; Mars:2,3,5,6,9,10,11; Mercury:1,3,4,5,7,8,10,11; Jupiter:1,4,7,8,10,11,12; Venus:3,4,5,7,9,10,11; Saturn:3,5,6,11; Lagna:3,6,10,11
- MARS(39): Sun:3,5,6,10,11; Moon:3,6,11; Mars:1,2,4,7,8,10,11; Mercury:3,5,6,11; Jupiter:6,10,11,12; Venus:6,8,11,12; Saturn:1,4,7,8,9,10,11; Lagna:1,3,6,10,11
- MERCURY(54): Sun:5,6,9,11,12; Moon:2,4,6,8,10,11; Mars:1,2,4,7,8,9,10,11; Mercury:1,3,5,6,9,10,11,12; Jupiter:6,8,11,12; Venus:1,2,3,4,5,8,9,11; Saturn:1,2,4,7,8,9,10,11; Lagna:1,2,4,6,8,10,11
- JUPITER(56): Sun:1,2,3,4,7,8,9,10,11; Moon:2,5,7,9,11; Mars:1,2,4,7,8,10,11; Mercury:1,2,4,5,6,9,10,11; Jupiter:1,2,3,4,7,8,10,11; Venus:2,5,6,9,10,11; Saturn:3,5,6,12; Lagna:1,2,4,5,6,7,9,10,11
- VENUS(52): Sun:8,11,12; Moon:1,2,3,4,5,8,9,11,12; Mars:3,5,6,9,11,12; Mercury:3,5,6,9,11; Jupiter:5,8,9,10,11; Venus:1,2,3,4,5,8,9,10,11; Saturn:3,4,5,8,9,10,11; Lagna:1,2,3,4,5,8,9,11
- SATURN(39): Sun:1,2,4,7,8,10,11; Moon:3,6,11; Mars:3,5,6,10,11,12; Mercury:6,8,9,10,11,12; Jupiter:5,6,11,12; Venus:6,11,12; Saturn:3,5,6,11; Lagna:1,3,4,6,10,11
Assert totals in code; throw/warn if a table is miscoded.

### shadbala.js — `shadbalaOf(kundli)` → array per planet (Surya..Shani)
Honest components only; each sub-bala labelled. Output:
```js
{ id:'Surya', hi:'सूर्य',
  sthana:{ uchcha, saptavargaja, ojhayugma, kendra, drekkana, total },
  dig, kala:{ natonnata, paksha, tribhaga, abda, masa, dina, hora, ayana, yuddha, total },
  chesta:{ state:'Vakra', value }, naisargika, drik,
  total, rupa, minRupa, ratio, ishta, kashta,
  strength:'Strong'|..., included:['uchcha','saptavargaja',...], note }
```
- Uchcha bala: 60 at exaltation deepest point → 0 at debilitation point (linear by distance).
- Saptavargaja: dignity in D1,D2,D3,D7,D9,D10,D30 with varga-vishesh scores (use standard: exalted 20? — use the common 7-varga scheme; document the exact scale in code).
- Ojhayugma: 15 if (odd rashi & odd navamsha-pada?) — standard: 15 virupas for male planets in odd rashi+odd navamsha etc. Document.
- Kendra: 60/30/15. Drekkana: 15 for (Mangal 1st, Shani 2nd, Guru 3rd drekkana).
- Dig bala: Surya/Mangal 10th=60; Chandra/Shukra 4th=60; Budh/Guru 1st=60; Shani 7th=60; 0 at opposite; linear between (use simple 60/30/0 by kendra/panaphara/apoklima? — document exact rule used).
- Kala: implement natonnata (60 day-planets by day birth etc.), paksha (Chandra/Guru/Shani benefic...), tribhaga, abda/masa/dina/hora (vara lord & hora lord from birth time), ayana (Sun's declination direction — use tropical Sun longitude: 0-180 = Uttarayana?), yuddha (skip if complex — mark excluded).
- Chesta: 8 states from speed vs mean speed — document thresholds.
- Drik: benefic/malefic graha-drishti on the planet (use aspects() from doshas.js).
- minRupa: {Surya:6.5, Chandra:6, Mangal:5, Budh:7, Guru:6.5, Shukra:5.5, Shani:5}.

### milan.js — `milanOf(kA, kB)` (two kundli objects)
Standard Ashtakoota 36 points: varna(1), vashya(2), tara(3), yoni(4), grahaMaitri(5), gana(6), bhakoot(7), nadi(8).
Each: `{ name, nameHi, points, maxPoints, aValue, bValue, description }`. Plus `manglik:{a,b}` comparison + `total`, `maxTotal:36`, `percentage`, `verdict`, `verdictHi`, `recommendations[]`.
Bhakoot uses classical 1-indexed rashi counts (fixed from a 0-indexed draft).
FIX vs old: Karka vashya = Jalchar (old said Vanchar — wrong).

### muhurat.js — `findMuhurat({event, from:Date, to:Date, place:{lat,lon,utcOffset}})` 
Port tables (rahu kaal, yamaghanda, gulika, choghadiya, auspicious days/nakshatras/tithis per event).
MUST compute REAL panchang per scanned day via engine (not placeholders — old had fake strings).
Returns `{ event, days:[{ date, dayHi, score, isAuspicious, panchang:{tithi,yoga,nakshatra,karana,vara}, rahuKaal, yamaghanda, choghadiya:[...], factors[] }] }` sorted by score.
Also `todaysMuhurat(place)` convenience.

### gochar.js — `gocharOf(kundli, atDate)` 
Real transit positions via engine for atDate. Returns:
```js
{ date, transits:[{ id, hi, rashiIdx, rashi, houseFromMoon, houseFromLagna, effect:'good'|'mixed'|'bad', description, areas[] }],
  sadeSati: {...}|null, dhaiya: {...}|null, guruBala:{...},
  timeline: [...] }  // sadeSatiTimeline ±15y
```
Transit effect tables per planet per house-from-Moon (classical gochar). No invented effects:
use the standard Vedha-inclusive simplifications and label the source rule.

### gemstones.js — `gemstonesOf(kundli)` 
Rule-based: benefic & weak (by shadbala ratio < 1 or debilitated) → recommend; malefic & strong → avoid.
Include metal, finger, day, mantra. Every recommendation cites the placement.
Label: traditional belief.

### remedies.js — `remediesOf(kundli)` → `{ planetId: { mantra, daan:[], puja, varat, general[] } }`
Traditional lists per planet + dosha-specific (manglik/kaal-sarp/sade-sati). Clearly labelled traditional belief, never medical/financial advice.

## UI components (`src/components/`)
Design tokens: `.glass`, `.glass-deep`, `.gold-text`, `.gold-border`, `.hindi` (see src/index.css).
Colors: ink #0a0605, maroon #3d0f0f, gold #d4af37, cream #f5ead2. framer-motion everywhere.
Language: `lang` prop 'hi'|'en' (default 'hi' for kundli terms). Use GRAHA_HI/RASHI_HI etc.

Charts: `ChartSVG({ grahas, lagna, vargaKey:'D1', style:'north'|'south'|'east', lang })`
- North Indian: classic diamond, fixed houses, rashi numbers, planet abbreviations (+R retro mark, °).
- South Indian: 4×4 grid fixed rashi positions. East Indian: diamond variant (lagna top-center).
- Animated: framer-motion draw-in of gold lines.

App sections (tabs): Kundli (charts D1/D9/D10 + D7/D12/D30 row) · Panchang · Graha · Dasha (visual timeline MD→AD→PD→Sookshm) · Yogas · Doshas (+Sade Sati timeline) · Gochar · Ashtakavarga · Shadbala · Milan · Muhurat · Ratna/Upay · Share/Print.
