import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section, { KV, Pill } from './Section.jsx';
import { gemstonesOf } from '../lib/vedic/gemstones.js';
import { remediesOf } from '../lib/vedic/remedies.js';
import { GRAHAS } from '../lib/vedic/constants.js';

function Disclaimer({ text }) {
  return (
    <div className="rounded-xl border-2 border-gold/50 bg-gold/10 px-4 py-3 flex gap-3 items-start">
      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 mt-0.5 text-gold-light" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 L21 20 H3 Z" strokeLinejoin="round" />
        <path d="M12 10 v4" strokeLinecap="round" />
        <circle cx="12" cy="16.8" r="0.9" fill="currentColor" />
      </svg>
      <p className="hindi text-[13px] leading-relaxed text-cream/85">{text}</p>
    </div>
  );
}

/* ------------------------------ RATNA tab ------------------------------ */

function GemCard({ gem, tone, hi }) {
  const tones = {
    green: 'border-emerald-400/40',
    red: 'border-red-400/40',
    gray: 'border-cream/20',
  };
  const badge = {
    green: <Pill tone="green">{hi ? 'अनुशंसित' : 'Recommended'}</Pill>,
    red: <Pill tone="red">{hi ? 'टालें' : 'Avoid'}</Pill>,
    gray: <Pill>{hi ? 'तटस्थ' : 'Neutral'}</Pill>,
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      className={`rounded-2xl border ${tones[tone]} bg-black/30 px-4 py-3.5`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="hindi text-lg font-bold text-gold-light">{gem.stoneHi} <span className="text-cream/50 text-sm font-normal">· {gem.stone}</span></div>
          <div className="hindi text-xs text-cream/50">{gem.hi} ({gem.planet}) · {gem.placement}</div>
        </div>
        {badge[tone]}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4">
        <KV k={hi ? 'अंगुली' : 'Finger'} v={gem.finger} />
        <KV k={hi ? 'धातु' : 'Metal'} v={gem.metal} />
        <KV k={hi ? 'वार' : 'Day'} v={gem.day} />
        <KV k={hi ? 'वजन' : 'Weight'} v={gem.weight} />
      </div>
      <p className="hindi text-[11px] text-cream/45 mt-1.5">{gem.benefits}</p>
      <div className="mt-2 rounded-lg bg-black/40 border border-gold/15 px-3 py-2">
        <div className="hindi text-[11px] text-gold-light/90 mb-0.5">{gem.mantra}</div>
      </div>
      <p className="text-[12px] leading-relaxed text-cream/65 mt-2">{gem.reason}</p>
      {gem.caution && (
        <p className="text-[12px] leading-relaxed text-amber-200/80 mt-1.5 border-t border-gold/10 pt-1.5">{gem.caution}</p>
      )}
    </motion.div>
  );
}

function RatnaTab({ kundli, hi }) {
  const gems = gemstonesOf(kundli);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Pill>{hi ? `लग्न — ${gems.lagna}` : `Lagna — ${gems.lagna}`}</Pill>
        <Pill tone="green">{gems.recommend.length} {hi ? 'अनुशंसित' : 'recommended'}</Pill>
        <Pill tone="red">{gems.avoid.length} {hi ? 'टालें' : 'avoid'}</Pill>
        <Pill>{gems.neutral.length} {hi ? 'तटस्थ' : 'neutral'}</Pill>
      </div>

      {gems.recommend.length > 0 && (
        <div className="space-y-3">
          <h3 className="hindi text-sm font-semibold text-emerald-300">{hi ? 'धारण योग्य रत्न' : 'Stones to wear'}</h3>
          {gems.recommend.map((g) => <GemCard key={g.planet} gem={g} tone="green" hi={hi} />)}
        </div>
      )}
      {gems.avoid.length > 0 && (
        <div className="space-y-3">
          <h3 className="hindi text-sm font-semibold text-red-300">{hi ? 'जिन्हें न पहनें' : 'Stones to avoid'}</h3>
          {gems.avoid.map((g) => <GemCard key={g.planet} gem={g} tone="red" hi={hi} />)}
        </div>
      )}
      {gems.neutral.length > 0 && (
        <div className="space-y-3">
          <h3 className="hindi text-sm font-semibold text-cream/50">{hi ? 'तटस्थ — आवश्यकता नहीं' : 'Neutral — not needed'}</h3>
          {gems.neutral.map((g) => <GemCard key={g.planet} gem={g} tone="gray" hi={hi} />)}
        </div>
      )}
      <Disclaimer text={gems.disclaimer} />
    </div>
  );
}

/* --------------------------- GRAHA UPAY tab ---------------------------- */

function PlanetAccordion({ id, r, hi, open, onToggle }) {
  return (
    <div className="rounded-xl border border-gold/15 bg-black/30 overflow-hidden">
      <button onClick={onToggle} className="w-full text-left px-3 py-2.5 flex items-center justify-between min-h-[52px]">
        <span className="hindi text-sm font-semibold text-cream">
          {hi ? r.hi : r.planet}
          <span className="text-cream/40 font-normal ml-2 text-xs">{hi ? r.day : ''}</span>
        </span>
        <span className="text-cream/40">{open ? '▾' : '▸'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-gold/10">
            <div className="px-3 py-3 space-y-2.5">
              <div className="rounded-lg bg-gold/5 border border-gold/20 px-3 py-2">
                <div className="hindi text-gold-light text-sm">{r.mantraHi}</div>
                <div className="text-[11px] text-cream/50 mt-0.5">{r.mantra}</div>
              </div>
              <KV k={hi ? 'वार' : 'Day'} v={r.day} />
              <div>
                <div className="hindi text-xs text-gold-light mb-1">{hi ? 'दान' : 'Daan (charity)'}</div>
                <ul className="text-[12px] text-cream/70 space-y-0.5 list-disc list-inside">
                  {r.daan.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
              <div>
                <div className="hindi text-xs text-gold-light mb-0.5">{hi ? 'पूजा' : 'Puja'}</div>
                <p className="text-[12px] text-cream/70 leading-relaxed">{r.puja}</p>
              </div>
              <div>
                <div className="hindi text-xs text-gold-light mb-0.5">{hi ? 'व्रत' : 'Vrat'}</div>
                <p className="text-[12px] text-cream/70">{r.varat}</p>
              </div>
              <div>
                <div className="hindi text-xs text-red-300/90 mb-1">{hi ? 'परहेज़' : 'Avoid'}</div>
                <ul className="text-[12px] text-cream/60 space-y-0.5 list-disc list-inside">
                  {r.avoid.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoshaRemedies({ d, hi }) {
  if (!d) return null;
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-500/5 px-4 py-3.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="hindi text-base font-bold text-red-200">{hi ? d.doshaHi : d.dosha}</h3>
        {d.present === false && <Pill tone="green">{hi ? 'सक्रिय नहीं' : 'Not present'}</Pill>}
        {d.fullyCancelled && <Pill tone="gold">{hi ? 'पूर्ण भंग' : 'Fully cancelled'}</Pill>}
      </div>
      {d.refs && d.refs.length > 0 && (
        <p className="text-[11px] text-cream/50 mt-1">{d.refs.join(' · ')}</p>
      )}
      {d.type && <p className="text-[11px] text-cream/50 mt-1">{d.type}</p>}
      <ul className="mt-2 space-y-1.5">
        {d.remedies.map((r, i) => (
          <li key={i} className="text-[13px] text-cream/75 leading-relaxed flex gap-2">
            <span className="text-gold-light shrink-0">✓</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpayTab({ kundli, hi }) {
  const rem = remediesOf(kundli);
  const [openId, setOpenId] = useState(null);
  return (
    <div className="space-y-3">
      {(rem.doshas.manglik || rem.doshas.kaalSarp) && (
        <div className="space-y-3">
          <h3 className="hindi text-sm font-semibold text-red-200/90">{hi ? 'दोष-विशिष्ट उपाय' : 'Dosha-specific remedies'}</h3>
          <DoshaRemedies d={rem.doshas.manglik} hi={hi} />
          <DoshaRemedies d={rem.doshas.kaalSarp} hi={hi} />
        </div>
      )}
      <h3 className="hindi text-sm font-semibold text-gold-light">{hi ? 'ग्रहानुसार उपाय' : 'Remedies by planet'}</h3>
      <div className="space-y-2">
        {GRAHAS.map((id) => (
          <PlanetAccordion key={id} id={id} r={rem.planets[id]} hi={hi}
            open={openId === id} onToggle={() => setOpenId(openId === id ? null : id)} />
        ))}
      </div>
      <div>
        <h3 className="hindi text-sm font-semibold text-gold-light mb-2">{hi ? 'साढ़ेसाती / ढैया (सक्रिय होने पर)' : 'Sade Sati / Dhaiya (when active)'}</h3>
        <DoshaRemedies d={rem.doshas.sadeSati} hi={hi} />
      </div>
      <Disclaimer text={rem.note} />
    </div>
  );
}

/* -------------------------------- panel -------------------------------- */

export default function UpayPanel({ kundli, lang }) {
  const hi = lang === 'hi';
  const [tab, setTab] = useState('ratna');
  return (
    <div className="pt-6 space-y-4">
      <Section title={hi ? 'रत्न व उपाय' : 'Gemstones & Remedies'}
        subtitle={hi ? 'पारंपरिक मान्यता पर आधारित — चिकित्सा/वित्तीय सलाह नहीं' : 'Based on traditional belief — never medical or financial advice'}>
        <div className="no-print grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl border border-gold/20 bg-black/40">
          {[
            { key: 'ratna', hi: 'रत्न', en: 'Gemstones' },
            { key: 'upay', hi: 'ग्रह उपाय', en: 'Remedies' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-lg px-4 py-2.5 hindi text-sm font-semibold min-h-[44px] transition-colors ${
                tab === t.key ? 'bg-gradient-to-r from-gold-light/30 to-gold/20 text-gold-light border border-gold/40' : 'text-cream/55 border border-transparent'
              }`}>
              {hi ? t.hi : t.en}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {tab === 'ratna' ? <RatnaTab kundli={kundli} hi={hi} /> : <UpayTab kundli={kundli} hi={hi} />}
          </motion.div>
        </AnimatePresence>
      </Section>
    </div>
  );
}
