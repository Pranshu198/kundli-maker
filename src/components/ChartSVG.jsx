/**
 * Vedic chart renderer — North Indian (diamond, default), South Indian, East Indian.
 * Animated gold SVG via framer-motion. Phone-first responsive.
 */
import { motion } from 'framer-motion';
import { GRAHA_ABBR, GRAHA_ABBR_HI, RASHIS, RASHI_HI } from '../lib/vedic/constants.js';

/** Build whole-sign houses for a varga key from grahas + varga lagna. */
export function vargaHouses(grahas, lagnaVarga, vargaKey) {
  const lagnaRashi = lagnaVarga[vargaKey].rashiIdx;
  const houses = [];
  for (let i = 0; i < 12; i++) {
    const rashiIdx = (lagnaRashi + i) % 12;
    houses.push({
      num: i + 1,
      rashiIdx,
      grahaIds: grahas
        .filter((g) => g.vargas[vargaKey].rashiIdx === rashiIdx)
        .map((g) => g.id),
    });
  }
  return { houses, lagnaRashi };
}

const GOLD = '#d4af37';
const GOLD_DIM = 'rgba(212,175,55,0.35)';

function PlanetTag({ id, lang, x, y, size = 11 }) {
  const abbr = lang === 'hi' ? GRAHA_ABBR_HI[id] : GRAHA_ABBR[id];
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={size} fill="#f5ead2" className={lang === 'hi' ? 'hindi' : ''}>
      {abbr}
    </text>
  );
}

// ---------------------------------------------------------------- NORTH ---
// Geometry on 400x400. Center C, side midpoints T/R/B/L, corners TL/TR/BR/BL.
const C = [200, 200], T = [200, 14], R = [386, 200], B = [200, 386], L = [14, 200];
const TL = [14, 14], TR = [386, 14], BR = [386, 386], BL = [14, 386];
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const M_TR = mid(T, R), M_RB = mid(R, B), M_BL = mid(B, L), M_LT = mid(L, T);

// North Indian house order = counterclockwise from top diamond.
const NORTH_REGIONS = [
  { pts: [T, M_TR, C, M_LT], num: [200, 52], dir: [0, 1] },          // 1 top diamond
  { pts: [TL, T, M_LT], num: [84, 52], dir: [0.5, 0.8] },            // 2
  { pts: [TL, M_LT, L], num: [52, 84], dir: [0.8, 0.5] },            // 3
  { pts: [L, M_LT, C, M_BL], num: [52, 200], dir: [1, 0] },          // 4 left diamond
  { pts: [BL, L, M_BL], num: [52, 316], dir: [0.8, -0.5] },          // 5
  { pts: [BL, M_BL, B], num: [84, 348], dir: [0.5, -0.8] },          // 6
  { pts: [B, M_BL, C, M_RB], num: [200, 348], dir: [0, -1] },        // 7 bottom diamond
  { pts: [BR, B, M_RB], num: [316, 348], dir: [-0.5, -0.8] },        // 8
  { pts: [BR, M_RB, R], num: [348, 316], dir: [-0.8, -0.5] },        // 9
  { pts: [R, M_RB, C, M_TR], num: [348, 200], dir: [-1, 0] },        // 10 right diamond
  { pts: [TR, R, M_TR], num: [348, 84], dir: [-0.8, 0.5] },          // 11
  { pts: [TR, M_TR, T], num: [316, 52], dir: [-0.5, 0.8] },          // 12
];

// East Indian (Bengali/Oriya): same geometry, houses run clockwise from top.
const EAST_ORDER = [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // region idx per house 1..12

function DiamondChart({ houses, grahas, lagnaRashi, lang, east }) {
  const order = east ? EAST_ORDER : NORTH_REGIONS.map((_, i) => i);
  const gmap = {};
  grahas.forEach((g) => (gmap[g.id] = g));

  const lines = [
    [TL, TR], [TR, BR], [BR, BL], [BL, TL],       // outer square
    [TL, BR], [TR, BL],                            // diagonals
    [T, R], [R, B], [B, L], [L, T],                // inner diamond
  ];

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto select-none">
      <defs>
        <radialGradient id="chartGlow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.10)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="400" fill="url(#chartGlow)" />
      {lines.map(([[x1, y1], [x2, y2]], i) => (
        <motion.line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={GOLD} strokeWidth={i < 4 ? 2 : 1.1} opacity={0.85}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 0.9, delay: 0.08 * i, ease: 'easeOut' }}
        />
      ))}
      {order.map((regionIdx, hi) => {
        const reg = NORTH_REGIONS[regionIdx];
        const house = houses[hi];
        const [nx, ny] = reg.num;
        const [dx, dy] = reg.dir;
        const planets = house.grahaIds;
        return (
          <g key={hi}>
            <motion.text
              x={nx} y={ny} textAnchor="middle" fontSize="13" fill={GOLD_DIM} fontWeight="600"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + hi * 0.04 }}
            >
              {house.rashiIdx + 1}
            </motion.text>
            {planets.map((pid, pi) => (
              <motion.g key={pid} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + hi * 0.04 + pi * 0.06 }}>
                <text
                  x={nx + dx * (16 + pi * 15)} y={ny + dy * (16 + pi * 15)}
                  textAnchor="middle" fontSize="12.5" fontWeight="700"
                  fill={pid === 'Rahu' || pid === 'Ketu' ? '#e8821e' : '#f5ead2'}
                  className={lang === 'hi' ? 'hindi' : ''}
                >
                  {(lang === 'hi' ? GRAHA_ABBR_HI[pid] : GRAHA_ABBR[pid])}
                  {gmap[pid]?.retro && pid !== 'Rahu' && pid !== 'Ketu' ? <tspan fontSize="8" dy="-4">(व)</tspan> : null}
                </text>
              </motion.g>
            ))}
            {house.rashiIdx === lagnaRashi && (
              <motion.text x={nx - dx * 22} y={ny - dy * 22 + 4} textAnchor="middle" fontSize="10" fill={GOLD} fontWeight="700"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                {lang === 'hi' ? 'लग्न' : 'Asc'}
              </motion.text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------- SOUTH ---
const SOUTH_CELLS = {
  11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3],
  10: [1, 0], 3: [1, 3],
  9: [2, 0], 4: [2, 3],
  8: [3, 0], 7: [3, 1], 6: [3, 2], 5: [3, 3],
};

function SouthChart({ houses, grahas, lagnaRashi, lang, vargaKey }) {
  const gmap = {};
  grahas.forEach((g) => (gmap[g.id] = g));
  const byRashi = {};
  houses.forEach((h) => (byRashi[h.rashiIdx] = h));
  const cell = 100;
  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto select-none">
      {Object.entries(SOUTH_CELLS).map(([rashiIdx, [r, c]], i) => {
        const h = byRashi[Number(rashiIdx)];
        const x = c * cell, y = r * cell;
        return (
          <g key={rashiIdx}>
            <motion.rect
              x={x + 2} y={y + 2} width={cell - 4} height={cell - 4} rx="6"
              fill="rgba(212,175,55,0.04)" stroke={GOLD} strokeWidth="1.1"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            />
            <text x={x + 10} y={y + 20} fontSize="11" fill={GOLD_DIM} fontWeight="600">
              {lang === 'hi' ? RASHI_HI[Number(rashiIdx)] : RASHIS[Number(rashiIdx)]}
            </text>
            {Number(rashiIdx) === lagnaRashi && (
              <text x={x + cell - 12} y={y + 20} fontSize="10" fill={GOLD} fontWeight="700" textAnchor="end">
                {lang === 'hi' ? 'लग्न' : 'Asc'}
              </text>
            )}
            {h.grahaIds.map((pid, pi) => (
              <motion.text
                key={pid} x={x + 14 + (pi % 3) * 30} y={y + 44 + Math.floor(pi / 3) * 20}
                fontSize="12" fontWeight="700" fill={pid === 'Rahu' || pid === 'Ketu' ? '#e8821e' : '#f5ead2'}
                className={lang === 'hi' ? 'hindi' : ''}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.04 + pi * 0.05 }}
              >
                {(lang === 'hi' ? GRAHA_ABBR_HI[pid] : GRAHA_ABBR[pid])}
                {gmap[pid]?.retro && pid !== 'Rahu' && pid !== 'Ketu' ? ' (व)' : ''}
              </motion.text>
            ))}
          </g>
        );
      })}
      {/* center */}
      <rect x={cell} y={cell} width={cell * 2} height={cell * 2} rx="8" fill="rgba(61,15,15,0.5)" stroke={GOLD} strokeWidth="1.2" />
      <text x={200} y={188} textAnchor="middle" fontSize="15" fill={GOLD} className="hindi" fontWeight="700">
        {vargaKey === 'D1' ? (lang === 'hi' ? 'राशि कुंडली' : 'Rashi Chart') : vargaKey}
      </text>
      <text x={200} y={212} textAnchor="middle" fontSize="11" fill="#f5ead2" opacity="0.7">
        {lang === 'hi' ? RASHI_HI[lagnaRashi] : RASHIS[lagnaRashi]} {lang === 'hi' ? 'लग्न' : 'Lagna'}
      </text>
    </svg>
  );
}

// ------------------------------------------------------------------ MAIN ---
export default function ChartSVG({ grahas, lagna, vargaKey = 'D1', style = 'north', lang = 'hi', title }) {
  const { houses, lagnaRashi } = vargaHouses(grahas, lagna.vargas, vargaKey);
  return (
    <div>
      {title && <div className="hindi text-center text-gold-light/90 text-sm mb-2">{title}</div>}
      {style === 'south' ? (
        <SouthChart houses={houses} grahas={grahas} lagnaRashi={lagnaRashi} lang={lang} vargaKey={vargaKey} />
      ) : (
        <DiamondChart houses={houses} grahas={grahas} lagnaRashi={lagnaRashi} lang={lang} east={style === 'east'} />
      )}
    </div>
  );
}
