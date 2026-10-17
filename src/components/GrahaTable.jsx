import { useState } from 'react';
import Section, { Pill } from './Section.jsx';

const DIGNITY_TONE = { exalted: 'green', debilitated: 'red', moolatrikona: 'green', own: 'green', friend: 'blue', neutral: '', enemy: 'red' };

export default function GrahaTable({ kundli, lang }) {
  const hi = lang === 'hi';
  const [varga, setVarga] = useState('D1');
  const vargaKeys = ['D1', 'D9', 'D10'];

  return (
    <div className="pt-6 space-y-4">
      <Section title={hi ? 'ग्रह स्पष्ट' : 'Planetary Positions'} subtitle={hi ? 'सभी 9 ग्रह — निरयन (स्विस एफ़ेमेरिस)' : 'All 9 grahas — sidereal (Swiss Ephemeris)'}>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-cream/45 text-xs border-b border-gold/20">
                <th className="py-2 pr-2 hindi">{hi ? 'ग्रह' : 'Planet'}</th>
                <th className="py-2 pr-2">{hi ? 'राशि' : 'Sign'}</th>
                <th className="py-2 pr-2">{hi ? 'अंश' : 'Degree'}</th>
                <th className="py-2 pr-2">{hi ? 'नक्षत्र' : 'Nakshatra'}</th>
                <th className="py-2 pr-2">{hi ? 'भाव' : 'House'}</th>
                <th className="py-2 pr-2">{hi ? 'बल' : 'Dignity'}</th>
                <th className="py-2 pr-2">{hi ? 'गति' : 'Motion'}</th>
              </tr>
            </thead>
            <tbody>
              {kundli.grahas.map((g) => (
                <tr key={g.id} className="border-b border-gold/10 last:border-0 hover:bg-gold/5">
                  <td className="py-2.5 pr-2 font-semibold hindi text-cream">
                    {hi ? g.hi : g.en}
                    {g.combust && <span className="ml-1 text-[10px] text-orange-300">({hi ? 'अस्त' : 'combust'})</span>}
                  </td>
                  <td className="py-2.5 pr-2 hindi text-gold-light/90">{hi ? g.rashiHi : g.rashi}</td>
                  <td className="py-2.5 pr-2 text-cream/85 tabular-nums">{g.dms}</td>
                  <td className="py-2.5 pr-2 hindi text-cream/75">{hi ? g.nakshatra.nameHi : g.nakshatra.name}-{g.nakshatra.pada}</td>
                  <td className="py-2.5 pr-2 text-cream/85">{g.house}</td>
                  <td className="py-2.5 pr-2"><Pill tone={DIGNITY_TONE[g.dignity.type]}>{hi ? g.dignity.labelHi : g.dignity.label}</Pill></td>
                  <td className="py-2.5 pr-2 text-cream/75">
                    {g.id === 'Rahu' || g.id === 'Ketu' ? (hi ? 'वक्री' : 'retro') + ' ℞'
                      : g.retro ? <span className="text-orange-300 font-semibold">℞ {hi ? 'वक्री' : 'retro'}</span>
                      : <span className="text-cream/50">{hi ? 'मार्गी' : 'direct'}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hindi text-[11px] text-cream/40 mt-3">
          {hi ? '℞ = वक्री (उल्टी चाल)। अस्त ग्रह सूर्य के तेज में दबा होता है। गति °/दिन में।' : '℞ = retrograde. Combust planets are eclipsed by the Sun. Speed in °/day.'}
        </p>
      </Section>

      <Section title={hi ? 'वर्ग स्थिति' : 'Divisional Placements'}>
        <div className="flex gap-2 mb-3 no-print">
          {vargaKeys.map((vk) => (
            <button key={vk} onClick={() => setVarga(vk)}
              className={`px-4 py-1.5 rounded-full text-sm border ${varga === vk ? 'bg-gold/20 border-gold/60 text-gold-light' : 'border-gold/20 text-cream/55'}`}>{vk}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {kundli.grahas.map((g) => {
            const v = g.vargas[varga];
            return (
              <div key={g.id} className="rounded-xl border border-gold/15 bg-black/30 px-3 py-2">
                <div className="hindi text-sm font-semibold text-cream">{hi ? g.hi : g.en}</div>
                <div className="hindi text-xs text-gold-light/85">{hi ? v.rashiHi : v.rashi}</div>
                {v.vargottama && <div className="text-[10px] text-emerald-300 hindi">{hi ? 'वर्गोत्तम ✓' : 'vargottama ✓'}</div>}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
