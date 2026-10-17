import swe from '@swisseph/node';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const A = require('astronomy-engine');

swe.setSiderealMode(swe.SiderealMode.Lahiri);
const jd = swe.julianDay(2007, 3, 16, 6 + 37 / 60);
const at = A.MakeTime(new Date((jd - 2440587.5) * 86400000));

const oldSun = A.SunPosition(at).elon;
const newSun = swe.calculatePosition(jd, swe.Planet.Sun, swe.CalculationFlag.Speed).longitude;
console.log('Surya diff = ' + (Math.abs(oldSun - newSun) * 3600).toFixed(1) + '"');

const rows = [['Moon','Chandra',A.Body.Moon],['Mercury','Budh',A.Body.Mercury],['Venus','Shukra',A.Body.Venus],['Mars','Mangal',A.Body.Mars],['Jupiter','Guru',A.Body.Jupiter],['Saturn','Shani',A.Body.Saturn]];
for (const [en, hi, body] of rows) {
  const oldLon = en === 'Moon' ? A.EclipticGeoMoon(at).lon : A.Ecliptic(A.GeoVector(body, at, true)).elon;
  const pLon = swe.calculatePosition(jd, swe.Planet[en], swe.CalculationFlag.Speed).longitude;
  let diff = Math.abs(oldLon - pLon) * 3600;
  if (diff > 648000) diff = 1296000 - diff;
  console.log('  ' + hi.padEnd(8), 'diff = ' + diff.toFixed(1) + '"');
}
const T = (jd - 2451545.0) / 36525;
let meanNode = (125.04452 - 1934.136261 * T) % 360;
if (meanNode < 0) meanNode += 360;
const sweNode = swe.calculatePosition(jd, 10, swe.CalculationFlag.Speed).longitude;
console.log('  Rahu(mean) formula=' + meanNode.toFixed(4) + ' sweph=' + sweNode.toFixed(4) + ' diff=' + (Math.abs(meanNode - sweNode) * 3600).toFixed(1) + '"');
