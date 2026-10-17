import { useState } from 'react';
import { motion } from 'framer-motion';
import Section, { Pill } from './Section.jsx';
import { computeKundli } from '../lib/vedic/kundli.js';
import { milanOf } from '../lib/vedic/milan.js';

const inputCls =
  'w-full rounded-xl border border-gold/25 bg-black/40 px-3 py-2.5 text-cream text-sm outline-none focus:border-gold/70 placeholder:text-cream/30';
const labelCls = 'hindi block text-xs text-cream/60 mb-1.5';

/** SVG score ring — total/36 + percentage. */
function ScoreRing({ total, percentage, hi }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const frac = Math.min(1, total / 36);
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="10" />
        <motion.circle
          cx="64" cy="64" r={R} fill="none"
          stroke="url(#scoreGold)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - frac) }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3d47c" />
            <stop offset="100%" stopColor="#9a7b1e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold tabular-nums">
          <span className="gold-text">{total}</span>
          <span className="text-cream/40 text-lg">/36</span>
        </div>
        <div className="text-xs text-cream/55 tabular-nums">{percentage}%</div>
        <div className="hindi text-[10px] text-cream/40 mt-0.5">{hi ? 'गुण मिलान' : 'Ashtakoota score'}</div>
      </div>
    </div>
  );
}

function verdictTone(total) {
  if (total >= 32) return { tone: 'green', key: 'excellent' };
  if (total >= 24) return { tone: 'green', key: 'good' };
  if (total >= 18) return { tone: 'gold', key: 'average' };
  return { tone: 'red', key: 'below' };
}

function ManglikCell({ m, name, hi }) {
  return (
    <div className="rounded-xl border border-gold/15 bg-black/30 px-3 py-2.5">
      <div className="hindi text-sm text-cream/60">{name}</div>
      <div className="mt-1">
        {m.present ? (
          <Pill tone="red">{hi ? 'मांगलिक दोष' : 'Manglik Dosha'}</Pill>
        ) : (
          <Pill tone="green">{hi ? 'मांगलिक दोष नहीं' : 'No Manglik Dosha'}</Pill>
        )}
      </div>
      {m.fullyCancelled && <div className="text-[11px] text-cream/50 mt-1 hindi">{hi ? 'पूर्ण भंग — दोष निष्प्रभाव' : 'Fully cancelled (bhanga)'}</div>}
      {!m.present && m.rawPresent && (
        <div className="text-[11px] text-cream/50 mt-1 hindi">{hi ? 'कच्चा दोष उपस्थित था किंतु भंग हो गया' : 'Raw dosha present but cancelled'}</div>
      )}
    </div>
  );
}

export default function MilanPanel({ kundli, lang }) {
  const hi = lang === 'hi';
  const [form, setForm] = useState({
    name: '', gender: 'female',
    date: '', time: '',
    lat: String(kundli.meta.lat ?? ''), lon: String(kundli.meta.lon ?? ''),
    offset: String(kundli.meta.utcOffsetHours ?? 5.5),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { res, bName, bGender }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.date || !form.time || form.lat === '' || form.lon === '') {
      setError(hi ? 'कृपया जन्म तिथि, समय, अक्षांश व देशांतर भरें।' : 'Please fill birth date, time, latitude and longitude.');
      return;
    }
    setLoading(true);
    try {
      const kundliB = await computeKundli({
        name: form.name || (hi ? 'द्वितीय व्यक्ति' : 'Second person'),
        gender: form.gender,
        dateStr: form.date,
        timeStr: form.time,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        place: hi ? 'द्वितीय स्थान' : 'Second place',
        utcOffsetHours: parseFloat(form.offset),
        ayanamsaMode: kundli.meta.ayanamsaMode || 'lahiri',
        nodeType: kundli.meta.nodeType || 'mean',
      });
      const res = milanOf(kundli, kundliB);
      setResult({ res, bName: form.name || (hi ? 'द्वितीय व्यक्ति' : 'Second person') });
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const aName = kundli.meta.name || (hi ? 'प्रथम व्यक्ति' : 'First person');

  return (
    <div className="pt-6 space-y-4">
      <Section title={hi ? 'कुंडली मिलान' : 'Kundli Milan'} titleEn="Ashtakoota"
        subtitle={hi ? 'दो कुंडलियों का पारंपरिक 36-गुण मिलान (परंपरागत मान्यता)' : 'Traditional 36-point compatibility between two charts (traditional belief)'}>
        <form onSubmit={onSubmit} className="no-print grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className={labelCls}>{hi ? 'नाम (द्वितीय व्यक्ति)' : 'Name (second person)'}</label>
            <input className={inputCls} value={form.name} onChange={set('name')}
              placeholder={hi ? 'जैसे — रिया' : 'e.g. Riya'} />
          </div>
          <div>
            <label className={labelCls}>{hi ? 'लिंग' : 'Gender'}</label>
            <select className={inputCls} value={form.gender} onChange={set('gender')}>
              <option value="female">{hi ? 'स्त्री' : 'Female'}</option>
              <option value="male">{hi ? 'पुरुष' : 'Male'}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{hi ? 'जन्म तिथि' : 'Birth date'}</label>
            <input type="date" className={inputCls} value={form.date} onChange={set('date')} />
          </div>
          <div>
            <label className={labelCls}>{hi ? 'जन्म समय' : 'Birth time'}</label>
            <input type="time" className={inputCls} value={form.time} onChange={set('time')} />
          </div>
          <div>
            <label className={labelCls}>{hi ? 'अक्षांश (lat)' : 'Latitude'}</label>
            <input type="number" step="any" className={inputCls} value={form.lat} onChange={set('lat')} />
          </div>
          <div>
            <label className={labelCls}>{hi ? 'देशांतर (lon)' : 'Longitude'}</label>
            <input type="number" step="any" className={inputCls} value={form.lon} onChange={set('lon')} />
          </div>
          <div className="col-span-2 sm:col-span-3">
            <button type="submit" disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold hindi text-ink bg-gradient-to-r from-gold-light via-gold to-gold-deep disabled:opacity-50 min-h-[48px]">
              {loading ? (hi ? 'गणना हो रही है…' : 'Computing…') : (hi ? 'मिलान देखें' : 'Match Kundlis')}
            </button>
          </div>
        </form>
        {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
        {loading && (
          <div className="mt-4 space-y-2">
            <div className="shimmer rounded-xl h-32" />
            <div className="shimmer rounded-xl h-10" />
          </div>
        )}
      </Section>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Section title={hi ? 'मिलान परिणाम' : 'Match Result'}
            subtitle={`${aName} × ${result.bName}`}>
            <ScoreRing total={result.res.total} percentage={result.res.percentage} hi={hi} />
            <div className="mt-4 text-center">
              <Pill tone={verdictTone(result.res.total).tone}>
                <span className="hindi font-semibold">{hi ? result.res.verdictHi : result.res.verdict}</span>
              </Pill>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Pill>{hi ? 'अष्टकूट · 36 गुण' : 'Ashtakoota · 36 points'}</Pill>
              <Pill>{hi ? 'परंपरागत मान्यता' : 'Traditional method'}</Pill>
            </div>
          </Section>

          <Section title={hi ? 'गुणवार अंक' : 'Koota-wise Score'}>
            <div className="space-y-2.5">
              {result.res.kootas.map((k, i) => {
                const frac = k.points / k.maxPoints;
                const barTone = frac >= 0.75 ? 'from-emerald-400 to-emerald-600'
                  : frac >= 0.4 ? 'from-gold-light to-gold-deep' : 'from-red-400 to-red-600';
                return (
                  <div key={i} className="rounded-xl border border-gold/15 bg-black/30 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="hindi text-sm text-cream font-medium">
                        {hi ? k.nameHi : k.name}
                        <span className="text-cream/40 text-xs ml-2">{hi ? k.name : k.nameHi}</span>
                      </div>
                      <div className="text-sm tabular-nums shrink-0">
                        <span className="gold-text font-bold">{k.points}</span>
                        <span className="text-cream/40">/{k.maxPoints}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-black/60 overflow-hidden">
                      <motion.div className={`h-full rounded-full bg-gradient-to-r ${barTone}`}
                        initial={{ width: 0 }} animate={{ width: `${frac * 100}%` }}
                        transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }} />
                    </div>
                    <div className="mt-1.5 text-[11px] text-cream/50 leading-snug">
                      <span className="text-gold-light/80">{k.aValue}</span>
                      <span className="mx-1.5 text-cream/30">×</span>
                      <span className="text-gold-light/80">{k.bValue}</span>
                    </div>
                    <div className="text-[11px] text-cream/45 leading-snug mt-0.5">{k.description}</div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title={hi ? 'मांगलिक तुलना' : 'Manglik Comparison'}>
            <div className="grid grid-cols-2 gap-2">
              <ManglikCell m={result.res.manglik.a} name={aName} hi={hi} />
              <ManglikCell m={result.res.manglik.b} name={result.bName} hi={hi} />
            </div>
            <p className="hindi text-[11px] text-cream/40 mt-3">
              {hi ? 'दोनों पक्ष मांगलिक होने पर दोष भंग माना जाता है — यह परंपरागत नियम है, निर्णय नहीं।' : 'When both are Manglik, the dosha is traditionally considered cancelled — this is a traditional rule, not a verdict.'}
            </p>
          </Section>

          {result.res.recommendations.length > 0 && (
            <Section title={hi ? 'परामर्श' : 'Recommendations'}>
              <div className="space-y-2">
                {result.res.recommendations.map((r, i) => (
                  <div key={i} className={`rounded-xl border px-3 py-2.5 text-sm leading-snug ${
                    r.type === 'warning' ? 'border-red-400/30 bg-red-500/5 text-cream/80'
                    : r.type === 'remedy' ? 'border-gold/30 bg-gold/5 text-cream/80'
                    : 'border-sky-400/30 bg-sky-500/5 text-cream/80'}`}>
                    {r.text}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </motion.div>
      )}
    </div>
  );
}
