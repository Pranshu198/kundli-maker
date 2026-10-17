import { motion } from 'framer-motion';
import Section, { Pill } from './Section.jsx';
import { GRAHA_HI } from '../lib/vedic/constants.js';

const STRENGTH_TONE = { 'Very Strong': 'gold', Strong: 'gold', Moderate: 'blue', Mild: 'gold' };

const DISCLAIMER = {
  hi: 'परंपरागत मान्यता — traditional belief',
  en: 'Traditional belief — not a prediction',
};

function grahaName(id, hi) {
  return hi ? GRAHA_HI[id] : id;
}

/* ── One yoga card ─────────────────────────────────────────── */
function YogaCard({ y, hi, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="glass-deep rounded-xl p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="hindi text-base sm:text-lg font-semibold">
            <span className="gold-text">{hi ? y.nameHi : y.name}</span>
          </h3>
          {!hi && y.nameHi && <div className="hindi text-xs text-cream/45">{y.nameHi}</div>}
          <div className="mt-1 flex flex-wrap gap-1.5 items-center">
            <Pill tone={STRENGTH_TONE[y.strength] || 'gold'}>{hi ? { 'Very Strong': 'अति प्रबल', Strong: 'प्रबल', Moderate: 'मध्यम', Mild: 'मंद' }[y.strength] || y.strength : y.strength}</Pill>
            {y.planets?.map((p) => (
              <span key={p} className="hindi text-[11px] px-2 py-0.5 rounded-full bg-gold/10 border border-gold/25 text-gold-light">{grahaName(p, hi)}</span>
            ))}
            {y.houses?.map((h) => (
              <span key={h} className="text-[11px] px-2 py-0.5 rounded-full bg-black/30 border border-cream/15 text-cream/60">{hi ? `भाव ${h}` : `House ${h}`}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Cited classical rule — honesty architecture */}
      <div className="mt-2.5 rounded-lg border-l-2 border-gold/60 bg-black/30 px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-gold-light/70 hindi mb-0.5">{hi ? 'शास्त्रीय नियम (उद्धरण)' : 'Classical rule (cited)'}</div>
        <p className="hindi text-[13px] leading-relaxed text-cream/85">{y.rule}</p>
      </div>
      <div className="mt-2">
        <div className="text-[10px] uppercase tracking-wider text-cream/45 hindi mb-0.5">{hi ? 'परंपरागत फल' : 'Traditional phala'}</div>
        <p className="hindi text-[13px] leading-relaxed text-cream/70">{hi ? y.effectHi : y.effect}</p>
      </div>
    </motion.article>
  );
}

/* ── Dosha status card ─────────────────────────────────────── */
function DoshaCard({ title, titleHi, tone, children, rule, hi }) {
  const borders = { green: 'border-emerald-400/30', amber: 'border-amber-400/40', red: 'border-red-400/40' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4 }}
      className={`glass-deep rounded-xl p-4 border ${borders[tone] || borders.green}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="hindi text-lg font-semibold text-cream">{hi ? titleHi : title}</h3>
        <Pill tone={tone === 'amber' ? 'gold' : tone}>{hi ? DISCLAIMER.hi : DISCLAIMER.en}</Pill>
      </div>
      <div className="mt-2">{children}</div>
      {rule && (
        <div className="mt-2.5 rounded-lg bg-black/30 px-3 py-2 border-l-2 border-cream/25">
          <div className="text-[10px] uppercase tracking-wider text-cream/40 mb-0.5">{hi ? 'नियम' : 'Rule'}</div>
          <p className="hindi text-[13px] text-cream/75 leading-relaxed">{rule}</p>
        </div>
      )}
    </motion.div>
  );
}

function ManglikBody({ m, hi }) {
  if (!m.rawPresent) {
    return (
      <Pill tone="green">{hi ? 'मांगलिक नहीं — Mangal none of 1/2/4/7/8/12 from Lagna, Chandra or Shukra' : 'Not Manglik — Mangal is not in 1/2/4/7/8/12 from Lagna, Chandra or Shukra'}</Pill>
    );
  }
  if (m.fullyCancelled) {
    return (
      <div className="space-y-2">
        <Pill tone="gold">{hi ? 'मांगलिक था — पूर्ण भंग' : 'Manglik — fully cancelled (bhanga)'}</Pill>
        {['fromLagna', 'fromMoon', 'fromShukra'].map((k) => {
          const f = m[k];
          if (!f?.present) return null;
          return (
            <div key={k} className="hindi text-[13px] text-cream/75 leading-relaxed">
              <span className="text-gold-light font-medium">{f.ref} {hi ? 'से' : 'ref'} · {hi ? `भाव ${f.house}` : `house ${f.house}`}</span>
              {f.cancellations?.length > 0 && (
                <span className="text-cream/60"> — {hi ? 'भंग' : 'bhanga'}: {f.cancellations.join(' · ')}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <Pill tone="red">{hi ? 'मांगलिक दोष उपस्थित' : 'Manglik dosha present'}</Pill>
      {['fromLagna', 'fromMoon', 'fromShukra'].map((k) => {
        const f = m[k];
        if (!f?.present) return null;
        return (
          <div key={k} className="hindi text-[13px] text-cream/75 leading-relaxed">
            <span className="text-red-300 font-medium">{f.ref} {hi ? 'से' : 'ref'} · {hi ? `भाव ${f.house}` : `house ${f.house}`}</span>
            <span className="text-cream/50"> · {hi ? 'तीव्रता' : 'intensity'}: {f.intensity}</span>
            {f.cancelled && f.cancellations?.length > 0 && (
              <span className="text-cream/60"> · {hi ? 'आंशिक भंग' : 'partial bhanga'}: {f.cancellations.join(' · ')}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function YogDoshPanel({ kundli, lang }) {
  const hi = lang === 'hi';
  const yogas = kundli.yogas || [];

  // group yogas by category, preserving first-appearance order
  const groups = [];
  const byCat = new Map();
  for (const y of yogas) {
    if (!byCat.has(y.category)) { byCat.set(y.category, []); groups.push(y.category); }
    byCat.get(y.category).push(y);
  }

  const m = kundli.doshas?.manglik;
  const ks = kundli.doshas?.kaalSarp;
  const pd = kundli.doshas?.pitra;

  return (
    <div className="pt-6 space-y-4">
      {/* ─────────── YOGAS ─────────── */}
      <Section
        title={hi ? 'योग' : 'Yogas'}
        titleEn={`${yogas.length} detected`}
        subtitle={hi ? 'प्रत्येक योग अपने शास्त्रीय नियम सहित — कोई नियम न मिला तो योग नहीं गिना गया' : 'Every yoga cites its classical rule — nothing was counted without a matching rule'}
      >
        {yogas.length === 0 ? (
          <div className="glass-deep rounded-xl p-6 text-center">
            <p className="hindi text-cream/60">{hi ? 'कोई प्रमुख योग नहीं मिला।' : 'No major yoga found.'}</p>
            <p className="hindi text-xs text-cream/40 mt-1">{hi ? 'यह भी एक सही गणना है — न मिलने वाले योग गिने नहीं जाते।' : 'This is an honest result — yogas that do not match their rules are not counted.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((cat) => {
              const list = byCat.get(cat);
              const catHi = list[0].categoryHi || cat;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="hindi text-sm font-semibold text-gold-light uppercase tracking-wider">{hi ? catHi : cat}</h3>
                    <span className="text-[11px] text-cream/40">· {list.length}</span>
                    <div className="flex-1 h-px bg-gold/15" />
                  </div>
                  <div className="space-y-3">
                    {list.map((y, i) => <YogaCard key={`${y.name}-${i}`} y={y} hi={hi} index={i} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ─────────── DOSHAS ─────────── */}
      <Section
        title={hi ? 'दोष' : 'Doshas'}
        subtitle={hi ? 'शास्त्रीय गणना — केवल संकेत, कोई घटना-भविष्यवाणी नहीं' : 'Classical computation — indications only, no event predictions'}
      >
        <div className="space-y-3">
          {m && (
            <DoshaCard title="Manglik Dosha" titleHi="मांगलिक दोष" tone={!m.rawPresent ? 'green' : m.fullyCancelled ? 'amber' : 'red'} rule={m.rule} hi={hi}>
              <ManglikBody m={m} hi={hi} />
            </DoshaCard>
          )}

          {ks && (
            <DoshaCard title="Kaal Sarp Yoga" titleHi="कालसर्प योग" tone={ks.present ? 'red' : 'green'} rule={ks.rule} hi={hi}>
              {ks.present && ks.type ? (
                <div className="space-y-1.5">
                  <Pill tone="red">{hi ? 'कालसर्प योग उपस्थित' : 'Kaal Sarp present'}</Pill>
                  <p className="hindi text-cream/80">
                    {hi ? `${ks.type.nameHi} (${ks.type.name})` : `${ks.type.name} (${ks.type.nameHi})`}
                    <span className="text-cream/50 text-sm"> · {hi ? `राहु भाव ${ks.type.house} से` : `Rahu in house ${ks.type.house}`}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Pill tone="green">{hi ? 'कालसर्प योग नहीं' : 'No Kaal Sarp'}</Pill>
                  {ks.outside?.length > 0 && (
                    <p className="hindi text-xs text-cream/50">
                      {hi ? 'राहु–केतु के अर्धगोल से बाहर:' : 'Outside the Rahu–Ketu arc:'} {ks.outside.map((p) => grahaName(p, hi)).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </DoshaCard>
          )}

          {pd && (
            <DoshaCard title="Pitra Dosha" titleHi="पितृ दोष" tone={pd.present ? 'red' : 'green'} rule={pd.rule} hi={hi}>
              {pd.present ? (
                <div className="space-y-1.5">
                  <Pill tone="red">{hi ? 'पितृ दोष के लक्षण' : 'Pitra dosha indication'}</Pill>
                  {pd.details?.length > 0 && (
                    <p className="hindi text-[13px] text-cream/75">{pd.details.join(' · ')}</p>
                  )}
                </div>
              ) : (
                <Pill tone="green">{hi ? 'पितृ दोष का लक्षण नहीं' : 'No Pitra dosha indication'}</Pill>
              )}
            </DoshaCard>
          )}
        </div>
      </Section>
    </div>
  );
}
