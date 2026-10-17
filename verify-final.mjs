/**
 * Final accuracy verification — run with: node verify-final.mjs
 * Fixture: Pranshu's janampatri (Future Point), 16 Mar 2007 12:07 PM IST, Delhi.
 * Extra janampatri data: Shiv yog, Taitil karan; Gan Dev, Yoni Vanar, Nadi Antya,
 * Varna Vaishya; Mangal uchch (Makar), Shani vakri (Kark), Rahu Kumbh, Ketu Simha.
 */
import { computeKundli } from './src/lib/vedic/kundli.js';

const k = await computeKundli({
  name: 'Pranshu', gender: 'male', dateStr: '2007-03-16', timeStr: '12:07',
  lat: 28.6139, lon: 77.2090, place: 'Delhi, India',
  utcOffsetHours: 5.5, ayanamsaMode: 'lahiri', nodeType: 'mean',
});
const g = Object.fromEntries(k.grahas.map((x) => [x.id, x]));
const P = k.panchang;
const cur = k.dasha.current(new Date('2026-10-17T00:00:00+05:30'));

const checks = [
  ['lagna = Mithun', k.lagna.rashi === 'Mithun', k.lagna.rashi + ' ' + k.lagna.dms],
  ['Moon rashi = Makar', k.chandra.rashi === 'Makar', k.chandra.rashi],
  ['Moon nakshatra = Shravana pada 4', P.nakshatra.name === 'Shravana' && P.nakshatra.pada === 4, P.nakshatra.name + ' pada ' + P.nakshatra.pada],
  ['yog = Shiv(a)', /shiv/i.test(P.yoga.name), P.yoga.name],
  ['karan = Taitil(a)', /taitil/i.test(P.karana.name), P.karana.name],
  ['gan = Deva', P.nakshatra.gana[0] === 'Deva', P.nakshatra.gana[0]],
  ['yoni = Vanara', P.nakshatra.yoni[0] === 'Vanara', P.nakshatra.yoni[0]],
  ['nadi = Antya', P.nakshatra.nadi[0] === 'Antya', P.nakshatra.nadi[0]],
  ['varna = Vaishya', P.varna[0] === 'Vaishya', P.varna[0]],
  ['Mangal exalted in Makar', g.Mangal.dignity.type === 'exalted' && g.Mangal.rashi === 'Makar', g.Mangal.dignity.type + ' ' + g.Mangal.rashi],
  ['Shani retro in Kark', g.Shani.retro === true && g.Shani.rashi === 'Kark', (g.Shani.retro ? 'retro' : 'direct') + ' ' + g.Shani.rashi],
  ['Rahu in Kumbh', g.Rahu.rashi === 'Kumbh', g.Rahu.rashi],
  ['Ketu in Simha', g.Ketu.rashi === 'Simha', g.Ketu.rashi],
  ['Vimshottari MD = Rahu (2015-2033)', cur.md.lord === 'Rahu', cur.md.lord],
  ['Ashtakavarga grand total = 337', k.ashtakavarga.savTotal === 337, k.ashtakavarga.savTotal],
  ['Shadbala 7 planets', k.shadbala.length === 7, k.shadbala.length],
  ['Yogas detected (conditional)', k.yogas.length > 0 && k.yogas.every((y) => y.rule), k.yogas.length],
  ['Manglik bhanga (exalted Mars 8th)', k.doshas.manglik.rawPresent && k.doshas.manglik.fullyCancelled, 'raw=' + k.doshas.manglik.rawPresent + ' cancelled=' + k.doshas.manglik.fullyCancelled],
];

let pass = 0;
for (const [name, ok, got] of checks) {
  if (ok) pass++;
  console.log(ok ? 'PASS' : 'FAIL', '|', name, '| got:', got);
}
console.log(`\n${pass}/${checks.length} checks passed — engine: ${k.meta.engineType}, ayanamsa: ${k.meta.ayanamsa.toFixed(4)}°`);
console.log('Yogas:', k.yogas.map((y) => y.nameHi).join(', '));
process.exit(pass === checks.length ? 0 : 1);
