// Fixture verification: Pranshu's janampatri (Future Point software)
// Birth: 16 Mar 2007, 12:07 PM IST, Delhi 28.6139N 77.2090E
// Expected: Mithun lagna, Makar rashi, Shravana pada 4, Shiv yog, Taitil karan,
// Gan Dev, Yoni Vanar, Nadi Antya, Varna Vaishya, Mangal uchch (Makar),
// Shani vakri (Kark), Rahu Kumbh, Ketu Simha.
import swe from '@swisseph/node';

const F = swe.CalculationFlag.Sidereal | swe.CalculationFlag.Speed;
const RASHIS = ['Mesh','Vrishabh','Mithun','Kark','Simha','Kanya','Tula','Vrishchik','Dhanu','Makar','Kumbh','Meen'];
const NAKS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const YOGAS = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
const KARANAS = ['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'];
const GANA = {Shravana:'Dev'};
const YONI = {Shravana:'Vanar'};
const NADI = {Shravana:'Antya'};
const VARNA = {Makar:'Vaishya'};

function karanaName(karanaIdx) {
  if (karanaIdx === 0) return 'Kimstughna';
  if (karanaIdx === 57) return 'Shakuni';
  if (karanaIdx === 58) return 'Chatushpada';
  if (karanaIdx === 59) return 'Naga';
  return KARANAS[(karanaIdx - 1) % 7];
}

function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${label}: got "${actual}", expected "${expected}"`);
  return ok;
}

swe.setSiderealMode(swe.SiderealMode.Lahiri);
const jd = swe.julianDay(2007, 3, 16, 6 + 37/60); // 12:07 IST = 06:37 UT
console.log('JD(UT) =', jd, '| ayanamsa =', swe.getAyanamsa(jd).toFixed(6) + '°');

const sid = {}, trop = {}, speed = {};
const bodies = {Surya:'Sun', Chandra:'Moon', Budh:'Mercury', Shukra:'Venus', Mangal:'Mars', Guru:'Jupiter', Shani:'Saturn'};
for (const [hi, en] of Object.entries(bodies)) {
  const p = swe.calculatePosition(jd, swe.Planet[en], F);
  sid[hi] = p.longitude; speed[hi] = p.longitudeSpeed;
  const t = swe.calculatePosition(jd, swe.Planet[en], swe.CalculationFlag.Speed);
  trop[hi] = t.longitude;
}
const rahu = swe.calculatePosition(jd, 10, F); sid.Rahu = rahu.longitude;
sid.Ketu = (rahu.longitude + 180) % 360;

const houses = swe.calculateHouses(jd, 28.6139, 77.2090, swe.HouseSystem.WholeSign);
const lagna = houses.ascendant;

let pass = 0, total = 0;
const t = (l,a,e) => { total++; if (check(l,a,e)) pass++; };

t('Lagna rashi', RASHIS[Math.floor(lagna/30)], 'Mithun');
const moonRashi = RASHIS[Math.floor(sid.Chandra/30)];
t('Moon rashi', moonRashi, 'Makar');
const nakIdx = Math.floor(sid.Chandra / (360/27));
const pada = Math.floor((sid.Chandra % (360/27)) / (360/108)) + 1;
t('Moon nakshatra', NAKS[nakIdx], 'Shravana');
t('Nakshatra pada', String(pada), '4');

// Yoga from SIDEREAL sun+moon
const yogaIdx = Math.floor(((sid.Surya + sid.Chandra) % 360) / (360/27));
t('Yoga', YOGAS[yogaIdx], 'Shiva');
// Karana from TROPICAL elongation
const elong = (trop.Chandra - trop.Surya + 360) % 360;
const karIdx = Math.floor(elong / 6);
t('Karana', karanaName(karIdx), 'Taitila');
t('Gana (Shravana)', GANA[NAKS[nakIdx]], 'Dev');
t('Yoni (Shravana)', YONI[NAKS[nakIdx]], 'Vanar');
t('Nadi (Shravana)', NADI[NAKS[nakIdx]], 'Antya');
t('Varna (Makar)', VARNA[moonRashi], 'Vaishya');
t('Mangal rashi (uchch)', RASHIS[Math.floor(sid.Mangal/30)], 'Makar');
t('Shani rashi', RASHIS[Math.floor(sid.Shani/30)], 'Kark');
t('Shani vakri', speed.Shani < 0 ? 'retro' : 'direct', 'retro');
t('Rahu rashi', RASHIS[Math.floor(sid.Rahu/30)], 'Kumbh');
t('Ketu rashi', RASHIS[Math.floor(sid.Ketu/30)], 'Simha');

console.log(`\nFixture: ${pass}/${total} checks passed`);
console.log('Moon sidereal:', sid.Chandra.toFixed(4) + '°', '| Lagna:', lagna.toFixed(4) + '°', '| Elongation:', elong.toFixed(3) + '°', '| karanaIdx:', karIdx);

// --- 12:07 AM variant ---
const jdAM = swe.julianDay(2007, 3, 16, 0 + 7/60 - 5.5 + 24) % 1; // not needed; compute directly
const jd2 = swe.julianDay(2007, 3, 15, 18 + 37/60); // 12:07 AM IST = 18:37 UT prev day
const m2 = swe.calculatePosition(jd2, swe.Planet.Moon, F);
const h2 = swe.calculateHouses(jd2, 28.6139, 77.2090, swe.HouseSystem.WholeSign);
const nk2 = Math.floor(m2.longitude / (360/27));
console.log('\n12:07 AM variant -> Lagna:', RASHIS[Math.floor(h2.ascendant/30)], '| Moon:', RASHIS[Math.floor(m2.longitude/30)], NAKS[nk2], 'pada', Math.floor((m2.longitude % (360/27)) / (360/108)) + 1);

// --- 15 Aug 1947 00:00 IST Delhi (widely cited Vrishabha lagna) ---
const jd3 = swe.julianDay(1947, 8, 14, 18.5); // 00:00 IST = 18:30 UT prev day
const h3 = swe.calculateHouses(jd3, 28.6139, 77.2090, swe.HouseSystem.WholeSign);
console.log('15-Aug-1947 00:00 IST -> Lagna:', RASHIS[Math.floor(h3.ascendant/30)], h3.ascendant.toFixed(2) + '°', '(widely cited: Vrishabha)');

// --- Ayanamsa anchor check: 1 Jan 1988 00:00 UT -> 23°41'23.0272" (sweph verified) ---
const jd4 = swe.julianDay(1988, 1, 1, 0);
const ay = swe.getAyanamsa(jd4);
const d = Math.floor(ay), mnt = Math.floor((ay - d) * 60), sec = ((ay - d) * 60 - mnt) * 60;
console.log(`Ayanamsa 1988-01-01: ${d}°${mnt}'${sec.toFixed(2)}" (sweph ref: 23°41'23.03")`);
