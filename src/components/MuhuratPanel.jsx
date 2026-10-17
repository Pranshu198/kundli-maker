import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section, { Pill } from './Section.jsx';
import { findMuhurat, todaysMuhurat } from '../lib/vedic/muhurat.js';

const EVENTS = [
  'marriage', 'griha_pravesh', 'vehicle', 'business', 'travel',
  'mundan', 'engagement', 'property', 'gold', 'naming', 'general',
];
const EVENT_EN = {
  marriage: 'Marriage', griha_pravesh: 'Griha Pravesh', vehicle: 'Vehicle purchase',
  business: 'Business start', travel: 'Travel', mundan: 'Mundan',
  engagement: 'Engagement', property: 'Property purchase', gold: 'Gold purchase',
  naming: 'Naming ceremony', general: 'General',
};
const EVENT_HI = {
  marriage: 'विवाह', griha_pravesh: 'गृह प्रवेश', vehicle: 'वाहन खरीदी',
  business: 'व्यापार आरंभ', travel: 'यात्रा', mundan: 'मुंडन',
  engagement: 'सगाई', property: 'संपत्ति खरीदी', gold: 'स्वर्ण खरीदी',
  naming: 'नामकरण', general: 'सामान्य',
};
const MAX_SCORE = 80; // 15+20+15+10+5+10+5 per muhurat.js

const inputCls =
  'w-full rounded-xl border border-gold/25 bg-black/40 px-3 py-2.5 text-cream text-sm outline-none focus:border-gold/70';
const labelCls = 'hindi block text-xs text-cream/60 mb-1.5';

function fmtDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function DayCard({ day, rank, hi, expanded, onToggle, top }) {
  const frac = Math.min(1, day.score / MAX_SCORE);
  return (
    <div className={`rounded-xl border ${top ? 'border-gold/60 bg-gold/10' : 'border-gold/15 bg-black/30'} overflow-hidden`}>
      <button onClick={onToggle} className="w-full text-left px-3 py-2.5 min-h-[56px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {top && (
              <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-ink text-sm font-bold flex items-center justify-center tabular-nums">
                {rank}
              </span>
            )}
            <div className="min-w-0">
              <div className="hindi text-sm text-cream font-semibold truncate">
                {fmtDay(day.date)} <span className="text-gold-light/80 font-normal">· {day.dayHi}</span>
              </div>
              <div className="text-[11px] text-cream/50 tabular-nums">{day.score}/{MAX_SCORE}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {day.isAuspicious ? <Pill tone="green">{hi ? 'शुभ' : 'Auspicious'}</Pill> : <Pill>{hi ? 'सामान्य' : 'Ordinary'}</Pill>}
            <span className="text-cream/40 text-sm">{expanded ? '▾' : '▸'}</span>
          </div>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-black/60 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold-deep"
            initial={{ width: 0 }} animate={{ width: `${frac * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-gold/10">
            <div className="px-3 py-3 space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div><span className="text-cream/45">{hi ? 'तिथि' : 'Tithi'}:</span> <span className="hindi text-cream">{day.panchang.tithi.nameHi}</span> <span className="text-cream/40">({day.panchang.tithi.paksha[1]})</span></div>
                <div><span className="text-cream/45">{hi ? 'नक्षत्र' : 'Nakshatra'}:</span> <span className="hindi text-cream">{day.panchang.nakshatra.nameHi}</span> <span className="text-cream/40">{hi ? 'पद' : 'pada'} {day.panchang.nakshatra.pada}</span></div>
                <div><span className="text-cream/45">{hi ? 'योग' : 'Yoga'}:</span> <span className="hindi text-cream">{day.panchang.yoga.nameHi}</span></div>
                <div><span className="text-cream/45">{hi ? 'करण' : 'Karana'}:</span> <span className="hindi text-cream">{day.panchang.karana.nameHi}</span></div>
              </div>
              <div>
                <div className="hindi text-xs text-gold-light mb-1.5">{hi ? 'शुभ चौघड़िया' : 'Auspicious Choghadiya'}</div>
                <div className="flex flex-wrap gap-1.5">
                  {day.choghadiya.map((c, i) => (
                    <Pill key={i} tone="green"><span className="hindi">{c.nameHi}</span> <span className="tabular-nums">{c.time}</span></Pill>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-red-500/10 border border-red-400/20 px-2 py-1.5">
                  <span className="text-red-300 hindi">{hi ? 'राहु काल' : 'Rahu Kaal'}:</span>
                  <span className="text-cream/70 tabular-nums ml-1">{day.rahuKaal}</span>
                </div>
                <div className="rounded-lg bg-red-500/10 border border-red-400/20 px-2 py-1.5">
                  <span className="text-red-300 hindi">{hi ? 'यमगण्ड' : 'Yamaghanda'}:</span>
                  <span className="text-cream/70 tabular-nums ml-1">{day.yamaghanda}</span>
                </div>
              </div>
              <div>
                <div className="hindi text-xs text-gold-light mb-1.5">{hi ? 'गणना कारक' : 'Scoring factors'}</div>
                <div className="space-y-1">
                  {day.factors.map((f, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="text-cream/60">{f.name}</span>
                      <span className="text-cream/45 text-right flex-1 leading-snug">{f.note}</span>
                      <span className={`tabular-nums font-semibold ${f.points > 0 ? 'text-emerald-300' : 'text-cream/30'}`}>+{f.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MuhuratPanel({ kundli, lang }) {
  const hi = lang === 'hi';
  const [today, setToday] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [event, setEvent] = useState('marriage');
  const [range, setRange] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(-1);

  const place = () => ({
    lat: kundli.meta.lat, lon: kundli.meta.lon,
    utcOffsetHours: kundli.meta.utcOffsetHours ?? 5.5,
  });

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const t = await todaysMuhurat(place());
        if (live) setToday(t);
      } catch { /* engine fallback */ }
      if (live) setTodayLoading(false);
    })();
    return () => { live = false; };
  }, []);

  async function onFind() {
    setError('');
    setLoading(true);
    setExpandedIdx(-1);
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + parseInt(range, 10) - 1);
      const res = await findMuhurat({ event, from, to, ...place() });
      setResult(res);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const top3 = result ? result.days.slice(0, 3) : [];
  const rest = result ? result.days.slice(3) : [];

  return (
    <div className="pt-6 space-y-4">
      <Section title={hi ? 'आज का मुहूर्त' : "Today's Muhurat"}>
        {todayLoading ? (
          <div className="shimmer rounded-xl h-24" />
        ) : today ? (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="hindi text-lg text-cream font-semibold">{fmtDay(today.date)} <span className="text-gold-light">· {today.dayHi}</span></div>
              {today.isAuspicious ? <Pill tone="green">{hi ? 'शुभ दिन' : 'Auspicious day'}</Pill> : <Pill>{hi ? 'सामान्य दिन' : 'Ordinary day'}</Pill>}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-cream/45">{hi ? 'तिथि' : 'Tithi'}:</span> <span className="hindi text-cream">{today.panchang.tithi.nameHi}</span></div>
              <div><span className="text-cream/45">{hi ? 'नक्षत्र' : 'Nakshatra'}:</span> <span className="hindi text-cream">{today.panchang.nakshatra.nameHi}</span></div>
              <div><span className="text-cream/45">{hi ? 'राहु काल' : 'Rahu Kaal'}:</span> <span className="text-cream/70 tabular-nums">{today.rahuKaal}</span></div>
              <div><span className="text-cream/45">{hi ? 'अभिजीत' : 'Abhijit'}:</span> <span className="text-cream/70 tabular-nums">{today.abhijit}</span></div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {today.choghadiya.map((c, i) => (
                <Pill key={i} tone="green"><span className="hindi">{c.nameHi}</span> <span className="tabular-nums">{c.time}</span></Pill>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-cream/50">{hi ? 'लोड नहीं हो सका।' : 'Could not load.'}</div>
        )}
      </Section>

      <Section title={hi ? 'मुहूर्त खोजें' : 'Find Muhurat'}
        subtitle={hi ? 'प्रत्येक दिन का वास्तविक पंचांग इंजन से गणना किया जाता है' : 'Real panchang computed per day via the engine'}>
        <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>{hi ? 'कार्य / संस्कार' : 'Event'}</label>
            <select className={inputCls} value={event} onChange={(e) => setEvent(e.target.value)}>
              {EVENTS.map((k) => (
                <option key={k} value={k}>{hi ? EVENT_HI[k] : `${EVENT_EN[k]} · ${EVENT_HI[k]}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{hi ? 'अवधि' : 'Range'}</label>
            <select className={inputCls} value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="15">{hi ? 'अगले 15 दिन' : 'Next 15 days'}</option>
              <option value="30">{hi ? 'अगले 30 दिन' : 'Next 30 days'}</option>
              <option value="60">{hi ? 'अगले 60 दिन' : 'Next 60 days'}</option>
            </select>
          </div>
        </div>
        <div className="no-print mt-3">
          <button onClick={onFind} disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold hindi text-ink bg-gradient-to-r from-gold-light via-gold to-gold-deep disabled:opacity-50 min-h-[48px]">
            {loading ? (hi ? 'खोज जारी…' : 'Scanning…') : (hi ? 'शुभ दिन खोजें' : 'Find Auspicious Days')}
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
        {loading && (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((i) => <div key={i} className="shimmer rounded-xl h-16" />)}
          </div>
        )}
      </Section>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Section title={`${result.eventHi} · ${hi ? 'सर्वश्रेष्ठ 3' : 'Top 3'} ${hi ? 'दिन' : 'Days'}`}
            subtitle={hi ? `${result.days.length} दिन स्कैन किए गए · स्कोर के अनुसार क्रमित` : `${result.days.length} days scanned · sorted by score`}>
            <div className="space-y-2.5">
              {top3.map((day, i) => (
                <DayCard key={day.date} day={day} rank={i + 1} hi={hi} top
                  expanded={expandedIdx === i} onToggle={() => setExpandedIdx(expandedIdx === i ? -1 : i)} />
              ))}
            </div>
          </Section>

          {rest.length > 0 && (
            <Section title={hi ? 'पूर्ण सूची (स्कोर क्रम)' : 'Full List (by score)'}
              subtitle={hi ? 'टैप करके विवरण खोलें' : 'Tap to expand details'}>
              <div className="space-y-2.5">
                {rest.map((day, i) => (
                  <DayCard key={day.date} day={day} rank={i + 4} hi={hi}
                    expanded={expandedIdx === i + 3} onToggle={() => setExpandedIdx(expandedIdx === i + 3 ? -1 : i + 3)} />
                ))}
              </div>
            </Section>
          )}

          <Section title={hi ? 'ईमानदार नोट' : 'Honest Note'}>
            <p className="text-xs leading-relaxed text-cream/60">{result.approxNote}</p>
          </Section>
        </motion.div>
      )}
    </div>
  );
}
