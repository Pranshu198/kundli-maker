import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header.jsx';
import BirthForm, { defaultForm } from './components/BirthForm.jsx';
import ChartSVG from './components/ChartSVG.jsx';
import Section, { KV } from './components/Section.jsx';
import { computeKundli } from './lib/vedic/kundli.js';
import { initEngine } from './lib/engine/sweph.js';
import { STRINGS } from './lib/i18n.js';
import { VARGA_INFO } from './lib/vedic/vargas.js';

// Panels (built in parallel batches)
import PanchangPanel from './components/PanchangPanel.jsx';
import GrahaTable from './components/GrahaTable.jsx';
import DashaPanel from './components/DashaPanel.jsx';
import YogDoshPanel from './components/YogDoshPanel.jsx';
import GocharPanel from './components/GocharPanel.jsx';
import BalaPanel from './components/BalaPanel.jsx';
import MilanPanel from './components/MilanPanel.jsx';
import MuhuratPanel from './components/MuhuratPanel.jsx';
import UpayPanel from './components/UpayPanel.jsx';
import Footer from './components/Footer.jsx';

const TABS = ['kundli', 'panchang', 'graha', 'dasha', 'yogdosh', 'gochar', 'bala', 'milan', 'muhurat', 'upay'];

function encodeHash(form, lang, chartStyle) {
  const obj = { ...form, lang, chartStyle, v: 1 };
  return '#k=' + btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decodeHash() {
  try {
    const h = window.location.hash;
    if (!h.startsWith('#k=')) return null;
    const b64 = h.slice(3).replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch { return null; }
}

export default function App() {
  const [engineType, setEngineType] = useState(null);
  const [lang, setLang] = useState('hi');
  const [chartStyle, setChartStyle] = useState('north');
  const [form, setForm] = useState(() => {
    const h = typeof window !== 'undefined' ? decodeHash() : null;
    if (h && h.dateStr) return { ...defaultForm(), ...h };
    return defaultForm();
  });
  const initialFormRef = useRef(null);
  if (!initialFormRef.current) {
    const h = typeof window !== 'undefined' ? decodeHash() : null;
    initialFormRef.current = h && h.dateStr ? { ...defaultForm(), ...h } : defaultForm();
  }
  const [kundli, setKundli] = useState(null);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('kundli');
  const [varga, setVarga] = useState('D1');
  const formRef = useRef(null);

  useEffect(() => {
    const h = decodeHash();
    if (h) {
      if (h.lang === 'en' || h.lang === 'hi') setLang(h.lang);
      if (['north', 'south', 'east'].includes(h.chartStyle)) setChartStyle(h.chartStyle);
    }
  }, []);

  useEffect(() => {
    initEngine().then(({ engineType }) => setEngineType(engineType));
    handleCompute(initialFormRef.current, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompute = useCallback(async (f, silent) => {
    setComputing(true); setError('');
    try {
      const k = await computeKundli({
        ...f,
        customAyanamsa: f.customAyanamsa ? parseFloat(f.customAyanamsa) : null,
      });
      setKundli(k);
      setForm(f);
      window.location.hash = encodeHash(f, lang, chartStyle);
      if (!silent) document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      setError(e.message || String(e));
    }
    setComputing(false);
  }, [lang, chartStyle]);

  const share = async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); alert(lang === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link copied!'); }
    catch { prompt('Link:', url); }
  };

  const hi = lang === 'hi';
  const tabs = STRINGS.tabs;

  return (
    <div className="min-h-screen">
      <Header lang={lang} engineType={engineType} onOpenForm={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })} />

      {/* controls bar */}
      <div className="no-print sticky top-0 z-30 bg-[#0a0605]/85 backdrop-blur-md border-b border-gold/15">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-2 overflow-x-auto">
          <button onClick={() => setLang(hi ? 'en' : 'hi')}
            className="shrink-0 px-3 py-1.5 rounded-full border border-gold/40 text-xs hindi text-gold-light">
            {hi ? 'EN' : 'हिंदी'}
          </button>
          <div className="flex gap-1 shrink-0">
            {[['north', hi ? 'उत्तर' : 'North'], ['south', hi ? 'दक्षिण' : 'South'], ['east', hi ? 'पूर्व' : 'East']].map(([s, label]) => (
              <button key={s} onClick={() => setChartStyle(s)}
                className={`px-3 py-1.5 rounded-full text-xs hindi border ${chartStyle === s ? 'bg-gold/20 border-gold/60 text-gold-light' : 'border-gold/20 text-cream/50'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          {kundli && (
            <>
              <button onClick={share} className="shrink-0 px-3 py-1.5 rounded-full border border-gold/40 text-xs hindi text-gold-light">⤴ {hi ? 'शेयर' : 'Share'}</button>
              <button onClick={() => window.print()} className="shrink-0 px-3 py-1.5 rounded-full border border-gold/40 text-xs hindi text-gold-light">🖨 {hi ? 'प्रिंट' : 'Print'}</button>
            </>
          )}
        </div>
        {kundli && (
          <div className="max-w-5xl mx-auto px-3 pb-2 flex gap-1.5 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs hindi border transition-all ${tab === t ? 'bg-gradient-to-br from-gold-light/30 to-gold/20 border-gold/60 text-gold-light' : 'border-gold/15 text-cream/55 hover:border-gold/40'}`}>
                {tabs[t][hi ? 0 : 1]}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 pb-16">
        <div ref={formRef} className="pt-6 no-print">
          <BirthForm lang={lang} initial={form} onCompute={(f) => handleCompute(f)} computing={computing} />
        </div>

        {error && <div className="mt-4 p-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-sm">{error}</div>}

        {!kundli && (
          <div className="mt-8 grid gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="shimmer rounded-2xl h-28" />)}
          </div>
        )}

        <div id="result" className="scroll-mt-24" />
        <AnimatePresence mode="wait">
          {kundli && (
            <motion.div key={tab + chartStyle} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              {tab === 'kundli' && <KundliTab kundli={kundli} lang={lang} chartStyle={chartStyle} varga={varga} setVarga={setVarga} />}
              {tab === 'panchang' && <PanchangPanel kundli={kundli} lang={lang} />}
              {tab === 'graha' && <GrahaTable kundli={kundli} lang={lang} />}
              {tab === 'dasha' && <DashaPanel kundli={kundli} lang={lang} />}
              {tab === 'yogdosh' && <YogDoshPanel kundli={kundli} lang={lang} />}
              {tab === 'gochar' && <GocharPanel kundli={kundli} lang={lang} />}
              {tab === 'bala' && <BalaPanel kundli={kundli} lang={lang} />}
              {tab === 'milan' && <MilanPanel kundli={kundli} lang={lang} />}
              {tab === 'muhurat' && <MuhuratPanel kundli={kundli} lang={lang} />}
              {tab === 'upay' && <UpayPanel kundli={kundli} lang={lang} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer lang={lang} engineType={kundli?.meta.engineType || engineType} ayanamsa={kundli ? { mode: kundli.meta.ayanamsaMode, value: kundli.meta.ayanamsa } : null} />
    </div>
  );
}

/** Kundli tab: D1/D9/D10 + secondary vargas, details header. */
function KundliTab({ kundli, lang, chartStyle, varga, setVarga }) {
  const hi = lang === 'hi';
  const m = kundli.meta, L = kundli.lagna, C = kundli.chandra, P = kundli.panchang;
  const vargaKeys = ['D1', 'D9', 'D10'];
  const vargaRow = ['D2', 'D3', 'D4', 'D7', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
  return (
    <div className="pt-6 space-y-4">
      <Section title={m.name ? (hi ? `${m.name} की कुंडली` : `Kundli of ${m.name}`) : (hi ? 'जन्म कुंडली' : 'Birth Chart')}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 mb-4 text-sm">
          <KV k={hi ? 'जन्म' : 'Born'} v={`${m.dateStr} ${m.timeStr}`} />
          <KV k={hi ? 'स्थान' : 'Place'} v={m.place} />
          <KV k={hi ? 'लग्न' : 'Lagna'} v={`${hi ? L.rashiHi : L.rashi} ${L.dms}`} />
          <KV k={hi ? 'राशि' : 'Rashi'} v={`${hi ? C.rashiHi : C.rashi}`} />
          <KV k={hi ? 'नक्षत्र' : 'Nakshatra'} v={`${hi ? P.nakshatra.nameHi : P.nakshatra.name} ${hi ? 'चरण' : 'pada'} ${P.nakshatra.pada}`} />
          <KV k={hi ? 'तिथि' : 'Tithi'} v={`${hi ? P.tithi.nameHi : P.tithi.name}`} />
          <KV k={hi ? 'अयनांश' : 'Ayanamsa'} v={`${m.ayanamsa.toFixed(4)}°`} />
          <KV k={hi ? 'इंजन' : 'Engine'} v={m.engineType === 'swisseph-wasm' ? 'Swiss Ephemeris' : 'VSOP87'} />
        </div>
        <div className="no-print flex gap-2 justify-center mb-3">
          {vargaKeys.map((vk) => (
            <button key={vk} onClick={() => setVarga(vk)}
              className={`px-4 py-1.5 rounded-full text-sm border ${varga === vk ? 'bg-gold/20 border-gold/60 text-gold-light' : 'border-gold/20 text-cream/55'}`}>
              {vk} <span className="hindi text-xs opacity-70">{hi ? VARGA_INFO[vk][1] : VARGA_INFO[vk][0]}</span>
            </button>
          ))}
        </div>
        <div className="max-w-md mx-auto">
          <ChartSVG grahas={kundli.grahas} lagna={kundli.lagna} vargaKey={varga} style={chartStyle} lang={lang}
            title={`${varga} · ${hi ? VARGA_INFO[varga][1] : VARGA_INFO[varga][0]}`} />
        </div>
        <div className="no-print mt-4">
          <div className="hindi text-xs text-cream/45 mb-2 text-center">{hi ? 'अन्य वर्ग' : 'Other Vargas'}</div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {vargaRow.map((vk) => (
              <button key={vk} onClick={() => setVarga(vk)}
                className={`px-2.5 py-1 rounded-full text-[11px] border ${varga === vk ? 'bg-gold/20 border-gold/60 text-gold-light' : 'border-gold/15 text-cream/50'}`}>
                {vk}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title={hi ? 'मुख्य विवरण' : 'Key Details'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <KV k={hi ? 'वार' : 'Weekday'} v={hi ? P.vara.nameHi : P.vara.name} />
          <KV k={hi ? 'योग' : 'Yoga'} v={hi ? P.yoga.nameHi : P.yoga.name} />
          <KV k={hi ? 'करण' : 'Karana'} v={hi ? P.karana.nameHi : P.karana.name} />
          <KV k={hi ? 'गण' : 'Gana'} v={hi ? P.nakshatra.gana[1] : P.nakshatra.gana[0]} />
          <KV k={hi ? 'योनि' : 'Yoni'} v={hi ? P.nakshatra.yoni[1] : P.nakshatra.yoni[0]} />
          <KV k={hi ? 'नाड़ी' : 'Nadi'} v={hi ? P.nakshatra.nadi[1] : P.nakshatra.nadi[0]} />
          <KV k={hi ? 'वर्ण' : 'Varna'} v={hi ? P.varna[1] : P.varna[0]} />
          <KV k={hi ? 'वश्य' : 'Vashya'} v={hi ? P.vashya[1] : P.vashya[0]} />
          <KV k={hi ? 'तत्व' : 'Element'} v={hi ? P.tatva[1] : P.tatva[0]} />
          <KV k={hi ? 'देवता' : 'Deity'} v={hi ? P.nakshatra.devata[1] : P.nakshatra.devata[0]} />
        </div>
      </Section>

      <div className="no-print">
        <Section title={hi ? 'नवांश कुंडली' : 'Navamsha Chart'} subtitle={hi ? 'विवाह व धर्म का वर्ग' : 'Marriage & dharma varga'}>
          <div className="max-w-sm mx-auto">
            <ChartSVG grahas={kundli.grahas} lagna={kundli.lagna} vargaKey="D9" style={chartStyle} lang={lang} />
          </div>
        </Section>
      </div>
    </div>
  );
}
