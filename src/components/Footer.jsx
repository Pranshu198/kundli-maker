import Section from './Section.jsx';

const AYANAMSA_HI = { lahiri: 'लाहिड़ी', raman: 'रमण', kp: 'केपी', fagan: 'फागन', custom: 'कस्टम' };
const AYANAMSA_EN = { lahiri: 'Lahiri', raman: 'Raman', kp: 'KP', fagan: 'Fagan', custom: 'Custom' };

export default function Footer({ lang, engineType, ayanamsa }) {
  const hi = lang === 'hi';
  const mode = (typeof engineType === 'string' && engineType.includes('fallback')) ? 'fallback' : 'swiss';
  const engineLabel = mode === 'swiss'
    ? (hi ? 'Swiss Ephemeris (WASM)' : 'Swiss Ephemeris (WASM)')
    : (hi ? 'खगोलीय फॉलबैक इंजन' : 'Astronomy fallback engine');
  const ayMode = ayanamsa && typeof ayanamsa === 'object' ? ayanamsa.mode : ayanamsa;
  const ayLabel = (hi ? AYANAMSA_HI[ayMode] : AYANAMSA_EN[ayMode]) || (hi ? 'लाहिड़ी' : 'Lahiri');
  const ayVal = typeof ayanamsa === 'number' ? ayanamsa : (ayanamsa?.value ?? null);

  return (
    <div className="pt-4 pb-10">
      <Section className="!p-0 overflow-hidden" title={null}>
        <div className="px-4 sm:px-6 py-6 text-center">
          <svg viewBox="0 0 64 12" className="w-40 h-3 mx-auto mb-4" aria-hidden="true">
            <defs>
              <linearGradient id="hairGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(212,175,55,0)" />
                <stop offset="50%" stopColor="rgba(212,175,55,0.8)" />
                <stop offset="100%" stopColor="rgba(212,175,55,0)" />
              </linearGradient>
            </defs>
            <rect x="0" y="5.5" width="64" height="1" fill="url(#hairGold)" />
          </svg>

          <p className="hindi text-sm leading-relaxed text-cream/80 max-w-2xl mx-auto">
            {hi
              ? 'सभी गणनाएँ Swiss Ephemeris से की गई हैं — कोई AI-जनित भविष्यवाणी नहीं। प्रभाव व उपाय पारंपरिक मान्यता पर आधारित हैं।'
              : 'All calculations are computed from the Swiss Ephemeris — no AI-generated predictions. Effects and remedies follow traditional belief.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-cream/50">
            <span className="tabular-nums">{hi ? 'इंजन' : 'Engine'}: <span className="text-gold-light/80">{engineLabel}</span></span>
            <span>{hi ? 'अयनांश' : 'Ayanamsa'}: <span className="text-gold-light/80 hindi">{ayLabel}</span>{ayVal != null && <span className="tabular-nums"> · {Number(ayVal).toFixed(4)}°</span>}</span>
          </div>

          <svg viewBox="0 0 64 12" className="w-40 h-3 mx-auto my-4" aria-hidden="true">
            <rect x="0" y="5.5" width="64" height="1" fill="url(#hairGold)" />
          </svg>

          <p className="text-xs tracking-wide">
            <span className="text-cream/45">{hi ? 'निर्माता' : 'Crafted by'}</span>{' '}
            <span className="gold-text font-semibold hindi">Tausif Raza</span>
          </p>
        </div>
      </Section>
    </div>
  );
}
