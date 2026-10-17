import { motion } from 'framer-motion';

/** Standard luxury section wrapper. */
export default function Section({ title, titleEn, subtitle, children, className = '', id }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`glass rounded-2xl p-4 sm:p-6 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="hindi text-xl sm:text-2xl font-semibold">
              <span className="gold-text">{title}</span>
              {titleEn && <span className="ml-2 text-sm text-cream/50 font-normal">· {titleEn}</span>}
            </h2>
          )}
          {subtitle && <p className="text-xs sm:text-sm text-cream/55 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.section>
  );
}

/** Small label-value row. */
export function KV({ k, v, khi }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-gold/10 last:border-0">
      <span className="text-cream/55 text-sm">{k}</span>
      <span className="hindi text-right text-cream font-medium">{khi || v}</span>
    </div>
  );
}

/** Pill badge. */
export function Pill({ children, tone = 'gold' }) {
  const tones = {
    gold: 'border-gold/40 text-gold-light bg-gold/10',
    red: 'border-red-400/40 text-red-300 bg-red-500/10',
    green: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10',
    blue: 'border-sky-400/40 text-sky-300 bg-sky-500/10',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs ${tones[tone] || tones.gold}`}>
      {children}
    </span>
  );
}
