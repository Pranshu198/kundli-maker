import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section, { Pill } from './Section.jsx';
import { GRAHA_HI, RASHI_HI, RASHIS } from '../lib/vedic/constants.js';

const BALA_HI = {
  sthana: 'स्थान बल', dig: 'दिग् बल', kala: 'काल बल',
  chesta: 'चेष्टा बल', naisargika: 'नैसर्गिक बल', drik: 'दृक् बल',
};
const BALA_EN = {
  sthana: 'Sthana Bala', dig: 'Dig Bala', kala: 'Kala Bala',
  chesta: 'Chesta Bala', naisargika: 'Naisargika Bala', drik: 'Drik Bala',
};
const SUB_HI = {
  uchcha: 'उच्च', saptavargaja: 'सप्तवर्गज', ojhayugma: 'ओज-युग्म', kendra: 'केंद्र', drekkana: 'द्रेक्काण',
  natonnata: 'नतोन्नत', paksha: 'पक्ष', tribhaga: 'त्रिभाग', abda: 'अब्द', masa: 'मास',
  dina: 'दिन', hora: 'होरा', ayana: 'अयन', yuddha: 'युद्ध',
};
const KALA_ORDER = ['natonnata', 'paksha', 'tribhaga', 'abda', 'masa', 'dina', 'hora', 'ayana', 'yuddha'];
const STHANA_ORDER = ['uchcha', 'saptavargaja', 'ojhayugma', 'kendra', 'drekkana'];

function fmt(v) {
  if (v == null) return '—';
  return typeof v === 'number' ? v.toFixed(2) : String(v);
}

function Row({ k, v, emph }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 border-b border-gold/10 last:border-0">
      <span className={`text-[13px] hindi ${emph ? 'text-gold-light font-semibold' : 'text-cream/55'}`}>{k}</span>
      <span className={`text-[13px] tabular-nums ${emph ? 'text-gold-light font-bold' : 'text-cream/85'}`}>{v}</span>
    </div>
  );
}

/* ── Ashtakavarga heatmap ─────────────────────────────────── */
function Heatmap({ av, hi }) {
  const rows = Object.keys(av.bav); // Surya..Shani
  return (
    <div className="overflow-x-auto -mx-1 px-1 no-print-skip">
      <div className="min-w-[560px]">
        <div className="grid" style={{ gridTemplateColumns: '64px repeat(12, 1fr)' }}>
          <div />
          {RASHI_HI.map((r, i) => (
            <div key={i} className="text-center text-[10px] hindi text-cream/50 pb-1 leading-tight">
              {r}
              <div className="text-cream/25 text-[9px]">{i + 1}</div>
            </div>
          ))}
          {rows.map((p) => (
            <div key={p} className="contents">
              <div className="hindi text-[11px] text-gold-light/90 flex items-center pr-1">{hi ? GRAHA_HI[p] : p.slice(0, 5)}</div>
              {av.bav[p].map((b, i) => {
                const alpha = 0.05 + (b / 8) * 0.85;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.015 }}
                    className="m-[1.5px] rounded aspect-square flex items-center justify-center text-[11px] tabular-nums font-semibold"
                    style={{
                      background: `rgba(212,175,55,${alpha})`,
                      color: b >= 5 ? '#f7e08b' : 'rgba(245,234,210,0.75)',
                      border: '1px solid rgba(212,175,55,0.15)',
                    }}
                    title={`${GRAHA_HI[p]} · ${RASHI_HI[i]}: ${b} ${hi ? 'बिन्दु' : 'bindus'}`}
                  >
                    {b}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Sarvashtakavarga bar chart ───────────────────────────── */
function SavBars({ av, lagnaRashi, hi }) {
  const max = Math.max(...av.sav);
  const houseOf = (r) => ((r - lagnaRashi + 12) % 12) + 1;
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="min-w-[520px]">
        <div className="flex items-end gap-1 h-44 pt-2">
          {av.sav.map((v, i) => {
            const strong = v >= 30, weak = v < 25;
            return (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                <span className="text-[10px] tabular-nums text-cream/70 mb-1">{v}</span>
                <motion.div
                  className={`w-full rounded-t-md border-t border-x ${strong ? 'bg-gradient-to-t from-gold-deep/80 to-gold-light border-gold-light/60' : weak ? 'bg-maroon/40 border-cream/10 opacity-50' : 'bg-maroon/70 border-gold/25'}`}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(v / max) * 78}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.03, ease: 'easeOut' }}
                  title={`${RASHI_HI[i]} (${RASHIS[i]}) · ${hi ? `भाव ${houseOf(i)}` : `house ${houseOf(i)}`}: ${v}`}
                />
                <span className="text-[10px] hindi text-gold-light/80 mt-1">{houseOf(i)}</span>
                <span className="text-[9px] hindi text-cream/40 leading-none">{RASHI_HI[i]}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-2 text-[11px] hindi text-cream/50">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2.5 rounded-sm bg-gradient-to-t from-gold-deep to-gold-light" /> {hi ? 'प्रबल (≥30)' : 'Strong (≥30)'}</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2.5 rounded-sm bg-maroon/40 opacity-50 border border-cream/10" /> {hi ? 'दुर्बल (<25)' : 'Weak (<25)'}</span>
        </div>
      </div>
    </div>
  );
}

/* ── One shadbala planet card ─────────────────────────────── */
function BalaCard({ b, hi, open, onToggle, index }) {
  const tone = b.strength === 'Very Strong' || b.strength === 'Strong' ? 'green'
    : b.strength === 'Moderate' ? 'gold' : 'red';
  const ratioPct = Math.min(100, (b.ratio / 2) * 100);
  const L = (h, e) => (hi ? h : e);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
      className="glass-deep rounded-xl overflow-hidden"
    >
      <button onClick={onToggle} className="w-full text-left p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="hindi text-base sm:text-lg font-semibold text-cream">{hi ? b.hi : b.id}</span>
            <Pill tone={tone}>{hi ? { 'Very Strong': 'अति प्रबल', Strong: 'प्रबल', Moderate: 'मध्यम', Weak: 'दुर्बल' }[b.strength] : b.strength}</Pill>
          </div>
          <span className="text-xs hindi text-cream/60 tabular-nums">
            {hi ? 'रूपा' : 'Rupa'} <span className="text-gold-light font-bold">{b.rupa.toFixed(2)}</span>
            <span className="text-cream/35"> / {hi ? 'न्यूनतम' : 'min'} {b.minRupa} · </span>
            <span className="text-gold-light font-bold">{b.ratio.toFixed(2)}×</span>
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-black/40 border border-gold/15 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-light"
            initial={{ width: 0 }}
            whileInView={{ width: `${ratioPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-4 pt-1 grid sm:grid-cols-2 gap-3">
              {/* Sthana */}
              <div className="rounded-lg bg-black/30 border border-gold/15 p-2.5">
                <div className="hindi text-xs font-semibold text-gold-light mb-1">{L(BALA_HI.sthana, BALA_EN.sthana)}</div>
                {STHANA_ORDER.map((k) => <Row key={k} k={L(SUB_HI[k], k)} v={fmt(b.sthana[k])} />)}
                <Row k={hi ? 'कुल' : 'Total'} v={fmt(b.sthana.total)} emph />
              </div>
              {/* Kala */}
              <div className="rounded-lg bg-black/30 border border-gold/15 p-2.5">
                <div className="hindi text-xs font-semibold text-gold-light mb-1">{L(BALA_HI.kala, BALA_EN.kala)}</div>
                {KALA_ORDER.map((k) => <Row key={k} k={L(SUB_HI[k], k)} v={fmt(b.kala[k])} />)}
                <Row k={hi ? 'कुल' : 'Total'} v={fmt(b.kala.total)} emph />
              </div>
              {/* single-value balas */}
              <div className="rounded-lg bg-black/30 border border-gold/15 p-2.5">
                <div className="hindi text-xs font-semibold text-gold-light mb-1">{L(BALA_HI.dig, BALA_EN.dig)}</div>
                <Row k={hi ? 'विरूप' : 'Virupas'} v={fmt(b.dig)} />
                <div className="hindi text-xs font-semibold text-gold-light mt-2 mb-1">{L(BALA_HI.chesta, BALA_EN.chesta)}</div>
                <Row k={hi ? 'अवस्था' : 'State'} v={b.chesta.state} />
                <Row k={hi ? 'विरूप' : 'Virupas'} v={fmt(b.chesta.value)} />
              </div>
              <div className="rounded-lg bg-black/30 border border-gold/15 p-2.5">
                <div className="hindi text-xs font-semibold text-gold-light mb-1">{L(BALA_HI.naisargika, BALA_EN.naisargika)}</div>
                <Row k={hi ? 'विरूप' : 'Virupas'} v={fmt(b.naisargika)} />
                <div className="hindi text-xs font-semibold text-gold-light mt-2 mb-1">{L(BALA_HI.drik, BALA_EN.drik)}</div>
                <Row k={hi ? 'विरूप' : 'Virupas'} v={fmt(b.drik)} />
                <div className="hindi text-xs font-semibold text-gold-light mt-2 mb-1">{hi ? 'फल' : 'Phala'}</div>
                <Row k={hi ? 'इष्ट' : 'Ishta'} v={fmt(b.ishta)} />
                <Row k={hi ? 'कष्ट' : 'Kashta'} v={fmt(b.kashta)} />
              </div>
            </div>
            <div className="mx-3 sm:mx-4 mb-4 rounded-lg bg-gold/5 border border-gold/20 px-3 py-2 flex items-baseline justify-between">
              <span className="hindi text-sm text-cream/70">{hi ? 'कुल षड्बल' : 'Total shadbala'}</span>
              <span className="text-sm tabular-nums text-gold-light font-bold">{fmt(b.total)} {hi ? 'विरूप' : 'virupas'} = {b.rupa.toFixed(2)} {hi ? 'रूपा' : 'rupas'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function BalaPanel({ kundli, lang }) {
  const hi = lang === 'hi';
  const av = kundli.ashtakavarga;
  const bala = (kundli.shadbala || []).slice().sort((a, b) => b.ratio - a.ratio);
  const [openId, setOpenId] = useState(bala.length ? bala[0].id : null);
  const lagnaRashi = kundli.lagna.rashiIdx;

  return (
    <div className="pt-6 space-y-4">
      {/* ─────────── ASHTAKAVARGA ─────────── */}
      <Section
        title={hi ? 'अष्टकवर्ग' : 'Ashtakavarga'}
        titleEn={`SAV ${av?.savTotal ?? ''}`}
        subtitle={hi ? 'बिन्दु = उस राशि से ग्रह कितना बल देता है — गोचर-बल की परंपरागत माप' : 'Bindus = strength a planet lends through that rashi — traditional gochar-strength measure'}
      >
        {!av ? (
          <p className="hindi text-cream/50">{hi ? 'गणना उपलब्ध नहीं।' : 'Not computed.'}</p>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="hindi text-sm font-semibold text-gold-light mb-2">{hi ? 'भिन्नाष्टकवर्ग — बिन्दु ऊष्म-चित्र' : 'Bhinnashtakavarga — bindu heatmap'}</h3>
              <Heatmap av={av} hi={hi} />
              <p className="text-[11px] hindi text-cream/40 mt-1">{hi ? 'स्तंभ: मेष→मीन राशियाँ · तीव्र सुनहरा = अधिक बिन्दु (0–8)' : 'Columns: Mesh→Meen rashis · brighter gold = more bindus (0–8)'}</p>
            </div>
            <div>
              <h3 className="hindi text-sm font-semibold text-gold-light mb-2">{hi ? 'सर्वाष्टकवर्ग — राशि-बल' : 'Sarvashtakavarga — rashi strength'}</h3>
              <SavBars av={av} lagnaRashi={lagnaRashi} hi={hi} />
              <p className="text-[11px] hindi text-cream/40 mt-1">{hi ? 'संख्या = भाव संख्या (लग्न से) · कुल योग 337' : 'Numbers = house numbers (from Lagna) · grand total 337'}</p>
            </div>
            <div>
              <h3 className="hindi text-sm font-semibold text-gold-light mb-2">{hi ? 'ग्रह-कुल योग' : 'Per-planet totals'}</h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(av.totals).map((p) => (
                  <div key={p} className="rounded-lg bg-black/30 border border-gold/20 px-3 py-1.5 text-center">
                    <div className="hindi text-xs text-gold-light/90">{hi ? GRAHA_HI[p] : p}</div>
                    <div className="text-sm font-bold tabular-nums text-cream">{av.totals[p]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ─────────── SHADBALA ─────────── */}
      <Section
        title={hi ? 'षड्बल' : 'Shadbala'}
        subtitle={hi ? 'छह बलों का माप — अनुपात 1.0 से ऊपर = आवश्यकता से अधिक बल' : 'Six-fold strength — ratio above 1.0 means more than required'}
      >
        {bala.length === 0 ? (
          <p className="hindi text-cream/50">{hi ? 'गणना उपलब्ध नहीं।' : 'Not computed.'}</p>
        ) : (
          <div className="space-y-3">
            {bala.map((b, i) => (
              <BalaCard key={b.id} b={b} hi={hi} index={i}
                open={openId === b.id}
                onToggle={() => setOpenId(openId === b.id ? null : b.id)} />
            ))}
            {bala[0]?.note && (
              <p className="hindi text-[11px] leading-relaxed text-cream/40 border-t border-gold/10 pt-3">
                {hi ? 'नोट: ' : 'Note: '}{bala[0].note}
              </p>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
