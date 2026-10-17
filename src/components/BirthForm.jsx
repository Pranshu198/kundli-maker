/**
 * Birth details form: Nominatim place search (no key), auto timezone via
 * BigDataCloud free API (no key) with manual UTC-offset fallback.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from './Section.jsx';

const DEFAULT_FORM = {
  name: '', gender: 'male',
  dateStr: '2007-03-16', timeStr: '12:07',
  place: 'Delhi, India', lat: 28.6139, lon: 77.2090,
  utcOffsetHours: 5.5, tzNote: '',
  ayanamsaMode: 'lahiri', customAyanamsa: '', nodeType: 'mean',
};

export function defaultForm() {
  return { ...DEFAULT_FORM };
}

function offsetLabel(h) {
  const sign = h < 0 ? '-' : '+';
  const a = Math.abs(h);
  const hh = String(Math.floor(a)).padStart(2, '0');
  const mm = String(Math.round((a % 1) * 60)).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}

export default function BirthForm({ lang, initial, onCompute, computing }) {
  const [f, setF] = useState(initial || defaultForm());
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tzLoading, setTzLoading] = useState(false);
  const timer = useRef(null);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const hi = lang === 'hi';

  // Nominatim search (debounced)
  useEffect(() => {
    if (!q || q.length < 3) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&addressdetails=1&q=${encodeURIComponent(q)}`, {
          headers: { 'Accept-Language': 'en' },
        });
        const j = await r.json();
        setResults(Array.isArray(j) ? j : []);
      } catch { setResults([]); }
      setSearching(false);
    }, 450);
    return () => clearTimeout(timer.current);
  }, [q]);

  const pickPlace = async (r) => {
    const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
    setF((p) => ({ ...p, place: r.display_name.split(',').slice(0, 3).join(','), lat, lon }));
    setResults([]); setQ('');
    // auto timezone
    setTzLoading(true);
    try {
      const tr = await fetch(`https://api.bigdatacloud.net/data/timezone/geocode?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const tj = await tr.json();
      if (tj && tj.utcOffset) {
        const m = tj.utcOffset.match(/([+-])(\d+):(\d+)/);
        if (m) {
          const h = (m[1] === '-' ? -1 : 1) * (parseInt(m[2]) + parseInt(m[3]) / 60);
          setF((p) => ({ ...p, utcOffsetHours: h, tzNote: hi ? `स्वतः पहचाना (${tj.timeZoneId || tj.utcOffset})` : `Auto-detected (${tj.timeZoneId || tj.utcOffset})` }));
        }
      }
    } catch { /* manual fallback below */ }
    setTzLoading(false);
  };

  const offsets = [];
  for (let h = -12; h <= 14; h += 0.5) offsets.push(h);

  return (
    <Section title={hi ? 'जन्म विवरण' : 'Birth Details'} titleEn={hi ? '' : ''} className="no-print">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="hindi text-xs text-cream/55">{hi ? 'नाम' : 'Name'}</span>
          <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder={hi ? 'नाम लिखें' : 'Full name'}
            className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream placeholder:text-cream/30 focus:border-gold/70 focus:outline-none" />
        </label>
        <label className="block">
          <span className="hindi text-xs text-cream/55">{hi ? 'लिंग' : 'Gender'}</span>
          <select value={f.gender} onChange={(e) => set('gender', e.target.value)}
            className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream focus:border-gold/70 focus:outline-none">
            <option value="male">{hi ? 'पुरुष' : 'Male'}</option>
            <option value="female">{hi ? 'महिला' : 'Female'}</option>
            <option value="other">{hi ? 'अन्य' : 'Other'}</option>
          </select>
        </label>
        <label className="block">
          <span className="hindi text-xs text-cream/55">{hi ? 'जन्म तिथि' : 'Date of birth'}</span>
          <input type="date" value={f.dateStr} onChange={(e) => set('dateStr', e.target.value)}
            className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream focus:border-gold/70 focus:outline-none [color-scheme:dark]" />
        </label>
        <label className="block">
          <span className="hindi text-xs text-cream/55">{hi ? 'जन्म समय' : 'Time of birth'}</span>
          <input type="time" step="60" value={f.timeStr} onChange={(e) => set('timeStr', e.target.value)}
            className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream focus:border-gold/70 focus:outline-none [color-scheme:dark]" />
        </label>
        <div className="sm:col-span-2 relative">
          <span className="hindi text-xs text-cream/55">{hi ? 'जन्म स्थान' : 'Place of birth'}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={f.place || (hi ? 'शहर खोजें…' : 'Search city…')}
            className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream placeholder:text-cream/30 focus:border-gold/70 focus:outline-none" />
          <div className="text-xs text-cream/50 mt-1 hindi">{hi ? 'चुना हुआ' : 'Selected'}: {f.place} ({f.lat.toFixed(4)}, {f.lon.toFixed(4)})</div>
          <AnimatePresence>
            {(results.length > 0 || searching) && (
              <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute z-20 left-0 right-0 mt-1 glass-deep rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                {searching && <li className="px-3 py-2 text-sm text-cream/50">…</li>}
                {results.map((r) => (
                  <li key={r.place_id}>
                    <button onClick={() => pickPlace(r)} className="w-full text-left px-3 py-2.5 text-sm text-cream hover:bg-gold/10 border-b border-gold/10 last:border-0">
                      {r.display_name}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <label className="block">
          <span className="hindi text-xs text-cream/55">{hi ? 'समय क्षेत्र (UTC offset)' : 'Timezone (UTC offset)'}</span>
          <select value={f.utcOffsetHours} onChange={(e) => setF((p) => ({ ...p, utcOffsetHours: parseFloat(e.target.value), tzNote: '' }))}
            className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream focus:border-gold/70 focus:outline-none">
            {offsets.map((h) => <option key={h} value={h}>{offsetLabel(h)}</option>)}
          </select>
          <div className="text-[11px] text-cream/45 mt-1 hindi">{tzLoading ? '…' : f.tzNote}</div>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="hindi text-xs text-cream/55">{hi ? 'अयनांश' : 'Ayanamsa'}</span>
            <select value={f.ayanamsaMode} onChange={(e) => set('ayanamsaMode', e.target.value)}
              className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream focus:border-gold/70 focus:outline-none">
              <option value="lahiri">{hi ? 'लाहिरी' : 'Lahiri'}</option>
              <option value="raman">{hi ? 'रमन' : 'Raman'}</option>
              <option value="kp">{hi ? 'केपी' : 'KP'}</option>
              <option value="fagan">Fagan-Bradley</option>
              <option value="custom">{hi ? 'कस्टम' : 'Custom'}</option>
            </select>
          </label>
          <label className="block">
            <span className="hindi text-xs text-cream/55">{hi ? 'राहु/केतु' : 'Nodes'}</span>
            <select value={f.nodeType} onChange={(e) => set('nodeType', e.target.value)}
              className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream focus:border-gold/70 focus:outline-none">
              <option value="mean">{hi ? 'मध्यम' : 'Mean'}</option>
              <option value="true">{hi ? 'सत्य' : 'True'}</option>
            </select>
          </label>
        </div>
        {f.ayanamsaMode === 'custom' && (
          <label className="block sm:col-span-2">
            <span className="hindi text-xs text-cream/55">{hi ? 'कस्टम अयनांश (डिग्री)' : 'Custom ayanamsa (degrees)'}</span>
            <input type="number" step="0.0001" value={f.customAyanamsa} onChange={(e) => set('customAyanamsa', e.target.value)} placeholder="23.85"
              className="mt-1 w-full bg-black/40 border border-gold/25 rounded-xl px-3 py-2.5 text-cream focus:border-gold/70 focus:outline-none" />
          </label>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onCompute(f)}
        disabled={computing}
        className="mt-5 w-full py-3.5 rounded-2xl font-bold hindi text-lg text-[#2a1a05]
          bg-gradient-to-br from-gold-light via-gold to-gold-deep
          shadow-[0_8px_30px_rgba(212,175,55,0.35)] disabled:opacity-50"
      >
        {computing ? (hi ? 'गणना हो रही है…' : 'Calculating…') : (hi ? 'कुंडली बनाएं' : 'Make Kundli')}
      </motion.button>
      <p className="hindi text-[11px] text-cream/40 mt-2 text-center">
        {hi ? 'समय यथासंभव सही रखें — 4 मिनट का अंतर भी लग्न बदल सकता है।' : 'Keep time as accurate as possible — even 4 minutes can change the Lagna.'}
      </p>
    </Section>
  );
}
