import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Section, { Pill } from './Section.jsx';
import { fmtDate, fmtDateLong } from '../lib/vedic/dasha.js';
import { GRAHA_HI } from '../lib/vedic/constants.js';

function DashaCard({ d, hi, level, active }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${active ? 'border-gold/60 bg-gold/10' : 'border-gold/15 bg-black/30'}`}>
      <div className="text-[10px] uppercase tracking-wider text-cream/45 hindi">{level}</div>
      <div className="hindi font-bold text-gold-light text-lg leading-tight">{hi ? d.lordHi : d.lord}</div>
      <div className="text-[11px] text-cream/55 tabular-nums">{fmtDate(d.start)} → {fmtDate(d.end)}</div>
    </div>
  );
}

export default function DashaPanel({ kundli, lang }) {
  const hi = lang === 'hi';
  const dasha = kundli.dasha;
  const now = new Date();
  const cur = dasha.current(now);
  const [mdI, setMdI] = useState(cur.md.index);
  const [adJ, setAdJ] = useState(cur.ad.index);
  const [pdK, setPdK] = useState(cur.pd.index);

  // reset drill-down when a new kundli is computed
  useEffect(() => {
    const c = dasha.current(new Date());
    setMdI(c.md.index); setAdJ(c.ad.index); setPdK(c.pd.index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kundli]);

  const ads = dasha.antardashasOf(mdI);
  const pds = dasha.pratyantarsOf(mdI, adJ);
  const sks = dasha.sookshmasOf(mdI, adJ, pdK);
  const maxYears = Math.max(...dasha.mahadashas.map((m) => m.years));

  const lvl = (n) => [hi ? 'महादशा' : 'Mahadasha', hi ? 'अंतर्दशा' : 'Antardasha', hi ? 'प्रत्यंतर' : 'Pratyantar', hi ? 'सूक्ष्म' : 'Sookshm'][n];

  return (
    <div className="pt-6 space-y-4">
      <Section title={hi ? 'वर्तमान दशा' : 'Current Dasha'} subtitle={`${hi ? 'आज' : 'Today'}: ${fmtDateLong(now)}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <DashaCard d={cur.md} hi={hi} level={lvl(0)} active />
          <DashaCard d={cur.ad} hi={hi} level={lvl(1)} active />
          <DashaCard d={cur.pd} hi={hi} level={lvl(2)} active />
          <DashaCard d={cur.sookshm} hi={hi} level={lvl(3)} active />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <Pill tone="green">{hi ? 'विंशोत्तरी · 120 वर्ष चक्र' : 'Vimshottari · 120-year cycle'}</Pill>
          <span className="hindi text-xs text-cream/50">
            {hi ? `जन्म के समय ${GRAHA_HI[dasha.startLord]} की शेष दशा ${dasha.balanceYears.toFixed(2)} वर्ष` : `Balance at birth: ${dasha.balanceYears.toFixed(2)} yrs of ${dasha.startLord}`}
          </span>
        </div>
      </Section>

      <Section title={hi ? 'महादशा समयरेखा' : 'Mahadasha Timeline'} subtitle={hi ? 'टैप करके अंतर्दशा देखें' : 'Tap a segment to drill into antardashas'}>
        <div className="no-print flex h-14 rounded-xl overflow-hidden border border-gold/20">
          {dasha.mahadashas.map((m, i) => (
            <motion.button
              key={m.lord} onClick={() => { setMdI(i); setAdJ(0); setPdK(0); }}
              className={`relative h-full border-r border-black/40 last:border-0 ${i === cur.md.index ? 'bg-gradient-to-b from-gold-light/50 to-gold/30' : 'bg-maroon/60 hover:bg-maroon'}`}
              style={{ width: `${(m.years / 120) * 100}%` }}
              whileTap={{ scale: 0.97 }}
              title={`${m.lord}: ${fmtDate(m.start)} → ${fmtDate(m.end)}`}
            >
              <span className="hindi absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs text-cream/90 font-semibold truncate px-1">
                {hi ? m.lordHi : m.lord.slice(0, 4)}
              </span>
            </motion.button>
          ))}
        </div>
        <div className="mt-3 space-y-1 max-h-64 overflow-y-auto pr-1">
          {ads.map((a, j) => (
            <button key={j} onClick={() => { setAdJ(j); setPdK(0); }}
              className={`w-full text-left px-3 py-1.5 rounded-lg border text-sm flex justify-between ${j === adJ ? 'border-gold/50 bg-gold/10' : 'border-gold/10 bg-black/20'}`}>
              <span className="hindi text-cream">{hi ? a.lordHi : a.lord} <span className="text-cream/40 text-xs">{lvl(1)}</span></span>
              <span className="text-cream/55 text-xs tabular-nums">{fmtDate(a.start)} → {fmtDate(a.end)}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={hi ? 'प्रत्यंतर · सूक्ष्म' : 'Pratyantar · Sookshm'}>
        <div className="text-xs hindi text-cream/50 mb-2">{hi ? `${ads[adJ] ? (hi ? ads[adJ].lordHi : ads[adJ].lord) : ''} ${lvl(1)} के ${lvl(2)}` : `Pratyantars of ${ads[adJ]?.lord} antardasha`}</div>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 mb-4">
          {pds.map((p, k) => (
            <button key={k} onClick={() => setPdK(k)}
              className={`w-full text-left px-3 py-1.5 rounded-lg border text-sm flex justify-between ${k === pdK ? 'border-gold/50 bg-gold/10' : 'border-gold/10 bg-black/20'}`}>
              <span className="hindi text-cream">{hi ? p.lordHi : p.lord}</span>
              <span className="text-cream/55 text-xs tabular-nums">{fmtDate(p.start)} → {fmtDate(p.end)}</span>
            </button>
          ))}
        </div>
        <div className="text-xs hindi text-cream/50 mb-2">{hi ? 'सूक्ष्म दशा' : 'Sookshm dashas'}</div>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {sks.map((s, l) => (
            <div key={l} className="px-3 py-1.5 rounded-lg border border-gold/10 bg-black/20 text-sm flex justify-between">
              <span className="hindi text-cream/85">{hi ? s.lordHi : s.lord}</span>
              <span className="text-cream/55 text-xs tabular-nums">{fmtDate(s.start)} → {fmtDate(s.end)}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
