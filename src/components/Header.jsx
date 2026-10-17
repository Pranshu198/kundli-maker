import { motion } from 'framer-motion';
import { STRINGS } from '../lib/i18n.js';

/** Decorative rotating mandala ring (geometric, tasteful). */
function Mandala({ size = 300, className = '' }) {
  const rings = [140, 118, 96, 74, 52];
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" className={className}>
      {rings.map((r, i) => (
        <g key={r} className={i % 2 ? 'animate-spin-slower' : ''} style={{ transformOrigin: '150px 150px', animationDirection: i % 2 ? 'reverse' : undefined }}>
          <circle cx="150" cy="150" r={r} fill="none" stroke="rgba(212,175,55,0.28)" strokeWidth="1" strokeDasharray={i % 2 ? '6 8' : '2 6'} />
          {Array.from({ length: 12 }).map((_, k) => {
            const a = (k * Math.PI) / 6;
            return <circle key={k} cx={150 + r * Math.cos(a)} cy={150 + r * Math.sin(a)} r={i % 2 ? 2.5 : 1.6} fill="rgba(212,175,55,0.5)" />;
          })}
        </g>
      ))}
      <text x="150" y="163" textAnchor="middle" fontSize="44" fill="rgba(212,175,55,0.85)" className="hindi">ॐ</text>
    </svg>
  );
}

export default function Header({ lang, engineType, onOpenForm }) {
  const t = (k) => STRINGS[k][lang === 'hi' ? 0 : 1];
  return (
    <header className="relative overflow-hidden">
      {/* backdrop mandalas */}
      <div className="absolute -top-24 -right-24 opacity-40 pointer-events-none">
        <Mandala size={340} />
      </div>
      <div className="absolute -bottom-32 -left-28 opacity-25 pointer-events-none">
        <Mandala size={300} />
      </div>
      {/* top gold hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="hindi text-gold/80 text-sm tracking-widest mb-2">॥ श्री गणेशाय नमः ॥</div>
          <h1 className="hindi text-4xl sm:text-6xl font-bold leading-tight">
            <span className="gold-text">{t('appName')}</span>
          </h1>
          <p className="hindi text-cream/60 text-sm sm:text-lg mt-2 tracking-wide">{t('appSub')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-4 flex items-center justify-center gap-2 text-[11px] text-cream/45"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hindi">
            {engineType === 'swisseph-wasm'
              ? (lang === 'hi' ? 'स्विस एफ़ेमेरिस इंजन · लाहिरी अयनांश' : 'Swiss Ephemeris engine · Lahiri ayanamsa')
              : (lang === 'hi' ? 'गणना इंजन तैयार हो रहा है…' : 'Preparing calculation engine…')}
          </span>
        </motion.div>

        {onOpenForm && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            onClick={onOpenForm}
            className="no-print mt-6 px-8 py-3 rounded-full font-semibold hindi text-lg text-[#2a1a05]
              bg-gradient-to-br from-gold-light via-gold to-gold-deep
              shadow-[0_8px_30px_rgba(212,175,55,0.35)] hover:shadow-[0_8px_40px_rgba(212,175,55,0.55)]
              active:scale-95 transition-all"
          >
            {t('makeKundli')}
          </motion.button>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </header>
  );
}
