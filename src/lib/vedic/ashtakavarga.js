/**
 * Ashtakavarga — Bhinnashtakavarga (BAV) + Sarvashtakavarga (SAV).
 *
 * Uses the VERIFIED BPHS benefic-house tables from SPEC.md.
 * For planet P and rashi T (0-11, Mesh..Meen):
 *   bindu = count of contributors C (7 grahas + Lagna) such that
 *   houseNumber(T counted from C's rashi) is in P's benefic list for C.
 *
 * Per-planet totals must be 48/49/39/54/56/52/39 and the grand total 337;
 * these are ASSERTED in code — a miscoded table throws.
 */

// Benefic houses counted from the CONTRIBUTOR's rashi. Verified totals:
// SUN 48, MOON 49, MARS 39, MERCURY 54, JUPITER 56, VENUS 52, SATURN 39.
const TABLES = {
  Surya: {
    Surya: [1, 2, 4, 7, 8, 9, 10, 11], Chandra: [3, 6, 10, 11],
    Mangal: [1, 2, 4, 7, 8, 9, 10, 11], Budh: [3, 5, 6, 9, 10, 11, 12],
    Guru: [5, 6, 9, 11], Shukra: [6, 7, 12],
    Shani: [1, 2, 4, 7, 8, 9, 10, 11], Lagna: [3, 4, 6, 10, 11, 12],
  },
  Chandra: {
    Surya: [3, 6, 7, 8, 10, 11], Chandra: [1, 3, 6, 7, 10, 11],
    Mangal: [2, 3, 5, 6, 9, 10, 11], Budh: [1, 3, 4, 5, 7, 8, 10, 11],
    Guru: [1, 4, 7, 8, 10, 11, 12], Shukra: [3, 4, 5, 7, 9, 10, 11],
    Shani: [3, 5, 6, 11], Lagna: [3, 6, 10, 11],
  },
  Mangal: {
    Surya: [3, 5, 6, 10, 11], Chandra: [3, 6, 11],
    Mangal: [1, 2, 4, 7, 8, 10, 11], Budh: [3, 5, 6, 11],
    Guru: [6, 10, 11, 12], Shukra: [6, 8, 11, 12],
    Shani: [1, 4, 7, 8, 9, 10, 11], Lagna: [1, 3, 6, 10, 11],
  },
  Budh: {
    Surya: [5, 6, 9, 11, 12], Chandra: [2, 4, 6, 8, 10, 11],
    Mangal: [1, 2, 4, 7, 8, 9, 10, 11], Budh: [1, 3, 5, 6, 9, 10, 11, 12],
    Guru: [6, 8, 11, 12], Shukra: [1, 2, 3, 4, 5, 8, 9, 11],
    Shani: [1, 2, 4, 7, 8, 9, 10, 11], Lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  Guru: {
    Surya: [1, 2, 3, 4, 7, 8, 9, 10, 11], Chandra: [2, 5, 7, 9, 11],
    Mangal: [1, 2, 4, 7, 8, 10, 11], Budh: [1, 2, 4, 5, 6, 9, 10, 11],
    Guru: [1, 2, 3, 4, 7, 8, 10, 11], Shukra: [2, 5, 6, 9, 10, 11],
    Shani: [3, 5, 6, 12], Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Shukra: {
    Surya: [8, 11, 12], Chandra: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mangal: [3, 5, 6, 9, 11, 12], Budh: [3, 5, 6, 9, 11],
    Guru: [5, 8, 9, 10, 11], Shukra: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Shani: [3, 4, 5, 8, 9, 10, 11], Lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Shani: {
    Surya: [1, 2, 4, 7, 8, 10, 11], Chandra: [3, 6, 11],
    Mangal: [3, 5, 6, 10, 11, 12], Budh: [6, 8, 9, 10, 11, 12],
    Guru: [5, 6, 11, 12], Shukra: [6, 11, 12],
    Shani: [3, 5, 6, 11], Lagna: [1, 3, 4, 6, 10, 11],
  },
};

const PLANETS = Object.keys(TABLES); // Surya..Shani
const CONTRIBUTORS = [...PLANETS, 'Lagna'];
const EXPECTED_TOTALS = { Surya: 48, Chandra: 49, Mangal: 39, Budh: 54, Guru: 56, Shukra: 52, Shani: 39 };
const EXPECTED_GRAND = 337;

/**
 * @param {Object} kundli — full kundli object (uses grahas[].rashiIdx, lagna.rashiIdx)
 * @returns {{ bav, sav, totals, savTotal, strongest, weakest }}
 */
export function ashtakavargaOf(kundli) {
  const rashiOf = {};
  for (const g of kundli.grahas) rashiOf[g.id] = g.rashiIdx;
  rashiOf.Lagna = kundli.lagna.rashiIdx;

  const bav = {};
  for (const P of PLANETS) {
    bav[P] = [];
    for (let t = 0; t < 12; t++) {
      let bindus = 0;
      for (const C of CONTRIBUTORS) {
        const houseFromC = ((t - rashiOf[C] + 12) % 12) + 1;
        if (TABLES[P][C].includes(houseFromC)) bindus++;
      }
      bav[P].push(bindus);
    }
  }

  const sav = Array.from({ length: 12 }, (_, t) =>
    PLANETS.reduce((s, P) => s + bav[P][t], 0));

  // ASSERT the verified totals — a miscoded table throws instead of silently wrong.
  const totals = {};
  for (const P of PLANETS) {
    totals[P] = bav[P].reduce((a, b) => a + b, 0);
    if (totals[P] !== EXPECTED_TOTALS[P]) {
      throw new Error(
        `[ashtakavarga] BPHS table miscoded for ${P}: total ${totals[P]}, expected ${EXPECTED_TOTALS[P]}`);
    }
  }
  const savTotal = sav.reduce((a, b) => a + b, 0);
  if (savTotal !== EXPECTED_GRAND) {
    throw new Error(
      `[ashtakavarga] grand total miscoded: ${savTotal}, expected ${EXPECTED_GRAND}`);
  }

  const strongest = [], weakest = [];
  sav.forEach((v, t) => {
    if (v >= 30) strongest.push(t);
    if (v < 25) weakest.push(t);
  });

  return { bav, sav, totals, savTotal, strongest, weakest };
}
