import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Section, { Pill } from './Section.jsx';
import { gocharOf } from '../lib/vedic/gochar.js';

const EFFECT = {
  good: { tone: 'green', hi: 'शुभ', en: 'Good' },
  mixed: { tone: 'gold', hi: 'मिश्रित', en: 'Mixed' },
  bad: { tone: 'red', hi: 'अशुभ', en: 'Cautious' },
};

function fmtY(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}
function fmtFull(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** 30-year Sade Sati / Dhaiya timeline — the headline visual. */
function SadeSatiTimeline({ timeline, hi }) {
  if (!timeline || timeline.length === 0) {
    return <div className="text-sm text-cream/50 hindi">{hi ? 'इस अवधि में कोई साढ़ेसाती/ढैया नहीं।' : 'No Sade Sati or Dhaiya in this span.'}</div>;
  }
  const min = Math.min(...timeline.map((t) => new Date(t.start).getTime()));
  const max = Math.max(...timeline.map((t) => new Date(t.end).getTime()));
  const span = max - min || 1;
  const pct = (iso) => ((new Date(iso).getTime() - min) / span) * 100;
  const nowPct = Math.min(100, Math.max(0, ((Date.now() - min) / span) * 100));
  const minY = new Date(min).getFullYear();
  const maxY = new Date(max).getFullYear();

  return (
    <div>
      <div className="relative h-20 rounded-xl border border-gold/20 bg-black/40 overflow-hidden">
        {/* today marker */}
        <motion.div className="absolute top-0 bottom-0 w-[2px] bg-gold-light shadow-[0_0_8px_rgba(243,212,124,0.9)] z-10"
          style={{ left: `${nowPct}%` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <span className="absolute -top-0.5 -translate-x-1/2 text-[9px] text-gold-light hindi whitespace-nowrap" style={{ top: 2 }}>
            {hi ? 'आज' : 'Today'}
          </span>
        </motion.div>
        {timeline.map((t, i) => {
          const isSade = t.kind === 'sade-sati';
          const left = pct(t.start);
          const width = Math.max(1.5, pct(t.end) - pct(t.start));
          return (
            <motion.div key={i}
              className={`absolute top-6 h-8 rounded-md border ${isSade
                ? 'border-red-400/50 bg-gradient-to-r from-red-900/80 via-red-700/60 to-red-900/80'
                : 'border-amber-400/40 bg-gradient-to-r from-amber-900/70 via-amber-700/50 to-amber-900/70'}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
              title={`${t.kind === 'sade-sati' ? (hi ? 'साढ़ेसाती' : 'Sade Sati') : (hi ? 'ढैया' : 'Dhaiya')}${t.phase ? ` · ${t.phase}` : ''}\n${fmtFull(t.start)} → ${fmtFull(t.end)}`}
            >
              <span className="hindi absolute inset-0 flex items-center justify-center text-[9px] text-cream/90 whitespace-nowrap overflow-hidden px-1">
                {isSade ? (t.phase ? `${hi ? 'सा.' : 'SS'} · ${t.phase}` : (hi ? 'साढ़ेसाती' : 'Sade Sati'))
                        : (hi ? 'ढैया' : 'Dhaiya')}
              </span>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-cream/40 tabular-nums mt-1 px-0.5">
        <span>{minY}</span><span>{maxY}</span>
      </div>
      <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-cream/55">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-800 border border-red-400/50 inline-block" />{hi ? 'साढ़ेसाती' : 'Sade Sati'}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-800 border border-amber-400/50 inline-block" />{hi ? 'ढैया' : 'Dhaiya'}</span>
        <span className="flex items-center gap-1.5"><span className="w-[2px] h-3 bg-gold-light inline-block" />{hi ? 'आज' : 'Today'}</span>
      </div>
      <div className="mt-3 space-y-1">
        {timeline.map((t, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-[11px] px-2 py-1 rounded-lg bg-black/20 border border-gold/10">
            <span className="hindi text-cream/75">
              {t.kind === 'sade-sati' ? (hi ? 'साढ़ेसाती' : 'Sade Sati') : (hi ? 'ढैया' : 'Dhaiya')}
              {t.phase && <span className="text-cream/45"> · {hi ? ['उदय','मध्य','अस्त'][t.phase - 1] : ['Rising','Peak','Setting'][t.phase - 1]}</span>}
            </span>
            <span className="text-cream/45 tabular-nums shrink-0">{fmtFull(t.start)} → {fmtFull(t.end)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GocharPanel({ kundli, lang }) {
  const hi = lang === 'hi';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const g = await gocharOf(kundli, new Date());
        if (live) setData(g);
      } catch { /* keep loading → error state */ }
      if (live) setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  if (loading) {
    return (
      <div className="pt-6 space-y-4">
        <div className="shimmer rounded-2xl h-40" />
        <div className="shimmer rounded-2xl h-64" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="pt-6">
        <Section title={hi ? 'गोचर' : 'Gochar'}>
          <div className="text-sm text-cream/50">{hi ? 'गोचर गणना लोड नहीं हो सकी।' : 'Transit calculation failed to load.'}</div>
        </Section>
      </div>
    );
  }

  const g = data;
  const ss = g.sadeSati, dh = g.dhaiya, gb = g.guruBala;

  return (
    <div className="pt-6 space-y-4">
      <Section title={hi ? 'वर्तमान गोचर' : 'Current Gochar'}
        subtitle={`${hi ? 'दिनांक' : 'Date'}: ${new Date(g.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Sade Sati banner */}
          <div className={`rounded-xl border px-3 py-3 ${ss.active ? 'border-red-400/40 bg-red-500/5' : 'border-emerald-400/30 bg-emerald-500/5'}`}>
            <div className="hindi text-sm font-semibold text-gold-light">{hi ? 'साढ़ेसाती' : 'Sade Sati'}</div>
            <div className="mt-1.5">
              {ss.active ? <Pill tone="red">{hi ? 'सक्रिय' : 'Active'}{ss.phaseHi ? ` · ${ss.phaseHi}` : ''}</Pill>
                            : <Pill tone="green">{hi ? 'सक्रिय नहीं' : 'Not active'}</Pill>}
            </div>
            {ss.active && ss.houseFromMoon && (
              <div className="text-[11px] text-cream/55 mt-1.5 hindi tabular-nums">
                {hi ? `चंद्र से ${ss.houseFromMoon}वां भाव · शनि ${ss.saturnRashi} में` : `Saturn ${ss.houseFromMoon}${ss.houseFromMoon === 1 ? 'st' : ss.houseFromMoon === 2 ? 'nd' : ss.houseFromMoon === 3 ? 'rd' : 'th'} from Moon · in ${ss.saturnRashi}`}
              </div>
            )}
          </div>
          {/* Dhaiya banner */}
          <div className={`rounded-xl border px-3 py-3 ${dh.active ? 'border-amber-400/40 bg-amber-500/5' : 'border-emerald-400/30 bg-emerald-500/5'}`}>
            <div className="hindi text-sm font-semibold text-gold-light">{hi ? 'ढैया' : 'Dhaiya'}</div>
            <div className="mt-1.5">
              {dh.active ? <Pill tone="gold">{hi ? 'सक्रिय' : 'Active'}{dh.name ? ` · ${dh.name}` : ''}</Pill>
                         : <Pill tone="green">{hi ? 'सक्रिय नहीं' : 'Not active'}</Pill>}
            </div>
            {dh.active && dh.house && (
              <div className="text-[11px] text-cream/55 mt-1.5 hindi tabular-nums">
                {hi ? `चंद्र से ${dh.house}वें भाव में शनि` : `Saturn in ${dh.house}${dh.house === 1 ? 'st' : dh.house === 2 ? 'nd' : dh.house === 3 ? 'rd' : 'th'} from Moon`}
              </div>
            )}
          </div>
          {/* Guru bala */}
          <div className="rounded-xl border border-gold/25 bg-gold/5 px-3 py-3">
            <div className="hindi text-sm font-semibold text-gold-light">{hi ? 'गुरु बल' : 'Guru Bala'}</div>
            <div className="mt-1.5">
              <Pill tone={gb.bala === 'Strong' ? 'green' : gb.bala === 'Weak' ? 'red' : 'gold'}>
                <span className="hindi">{gb.balaHi}</span>
              </Pill>
            </div>
            <div className="text-[11px] text-cream/55 mt-1.5 hindi tabular-nums">
              {hi ? `चंद्र से ${gb.houseFromMoon}वां भाव` : `${gb.houseFromMoon}${gb.houseFromMoon === 1 ? 'st' : gb.houseFromMoon === 2 ? 'nd' : gb.houseFromMoon === 3 ? 'rd' : 'th'} from Moon`}
            </div>
          </div>
        </div>
        {ss.active && <p className="hindi text-xs text-cream/55 mt-3 leading-relaxed">{ss.description}</p>}
        {dh.active && <p className="hindi text-xs text-cream/55 mt-2 leading-relaxed">{dh.description}</p>}
        {!ss.active && <p className="hindi text-xs text-cream/45 mt-3 leading-relaxed">{ss.description}</p>}
      </Section>

      <Section title={hi ? 'साढ़ेसाती · ढैया समयरेखा' : 'Sade Sati · Dhaiya Timeline'}
        subtitle={hi ? '±15 वर्ष · शनि के वास्तविक गोचर से गणना' : '±15 years · computed from real Saturn transits'}>
        <SadeSatiTimeline timeline={g.timeline} hi={hi} />
      </Section>

      <Section title={hi ? 'ग्रह गोचर' : 'Planetary Transits'}
        subtitle={hi ? 'चंद्र से भावानुसार पारंपरिक गोचर फल' : 'Traditional gochar phala by house from the Moon'}>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-cream/45">
                <th className="py-2 pr-3 hindi font-normal">{hi ? 'ग्रह' : 'Planet'}</th>
                <th className="py-2 pr-3 hindi font-normal">{hi ? 'राशि' : 'Rashi'}</th>
                <th className="py-2 pr-3 hindi font-normal">{hi ? 'चंद्र से' : 'From Moon'}</th>
                <th className="py-2 pr-3 hindi font-normal">{hi ? 'प्रभाव' : 'Effect'}</th>
                <th className="py-2 hindi font-normal">{hi ? 'फल (पारंपरिक)' : 'Phala (traditional)'}</th>
              </tr>
            </thead>
            <tbody>
              {g.transits.map((t) => (
                <tr key={t.id} className="border-t border-gold/10 align-top">
                  <td className="py-2.5 pr-3 hindi font-semibold text-gold-light whitespace-nowrap">{hi ? t.hi : t.id}</td>
                  <td className="py-2.5 pr-3 hindi text-cream/85 whitespace-nowrap">{hi ? t.rashiHi : t.rashi}</td>
                  <td className="py-2.5 pr-3 tabular-nums text-cream/70 whitespace-nowrap">
                    {t.houseFromMoon}<span className="text-cream/40 text-xs">{hi ? ' वां' : t.houseFromMoon === 1 ? 'st' : t.houseFromMoon === 2 ? 'nd' : t.houseFromMoon === 3 ? 'rd' : 'th'}</span>
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    <Pill tone={EFFECT[t.effect].tone}><span className="hindi">{hi ? EFFECT[t.effect].hi : EFFECT[t.effect].en}</span></Pill>
                  </td>
                  <td className="py-2.5">
                    <div className="hindi text-[13px] text-cream/80 leading-snug">{t.description}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {t.areas.map((a, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border border-gold/20 text-cream/45">{a}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-xl border border-gold/20 bg-black/30 px-3 py-2.5">
          <p className="hindi text-[11px] leading-relaxed text-cream/55">
            {hi ? 'परंपरागत मान्यता — ये प्रभाव शास्त्रीय गोचर नियमों से गणना किए गए हैं, व्यक्तिगत भविष्यवाणी नहीं।' : 'Traditional belief — these effects are computed from classical gochar rules, not personal predictions.'}
          </p>
          <p className="text-[11px] leading-relaxed text-cream/45 mt-1">{g.note}</p>
        </div>
      </Section>
    </div>
  );
}
