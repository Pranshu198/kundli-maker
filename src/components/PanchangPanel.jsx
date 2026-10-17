import Section, { KV, Pill } from './Section.jsx';

export default function PanchangPanel({ kundli, lang }) {
  const hi = lang === 'hi';
  const P = kundli.panchang;
  const rows = [
    [hi ? 'तिथि' : 'Tithi', `${hi ? P.tithi.nameHi : P.tithi.name} (${hi ? P.tithi.paksha[1] : P.tithi.paksha[0]} ${hi ? 'पक्ष' : 'paksha'})`],
    [hi ? 'वार' : 'Weekday', hi ? P.vara.nameHi : P.vara.name],
    [hi ? 'नक्षत्र' : 'Nakshatra', `${hi ? P.nakshatra.nameHi : P.nakshatra.name} · ${hi ? 'चरण' : 'pada'} ${P.nakshatra.pada}`],
    [hi ? 'नक्षत्र स्वामी' : 'Nakshatra lord', hi ? ({Ketu:'केतु',Shukra:'शुक्र',Surya:'सूर्य',Chandra:'चंद्र',Mangal:'मंगल',Rahu:'राहु',Guru:'गुरु',Shani:'शनि',Budh:'बुध'})[P.nakshatra.lord] : P.nakshatra.lord],
    [hi ? 'योग' : 'Yoga', hi ? P.yoga.nameHi : P.yoga.name],
    [hi ? 'करण' : 'Karana', hi ? P.karana.nameHi : P.karana.name],
    [hi ? 'गण' : 'Gana', hi ? P.nakshatra.gana[1] : P.nakshatra.gana[0]],
    [hi ? 'योनि' : 'Yoni', `${hi ? P.nakshatra.yoni[1] : P.nakshatra.yoni[0]} (${P.nakshatra.yoni[2] === 'M' ? (hi ? 'पु.' : 'M') : (hi ? 'स्त्री' : 'F')})`],
    [hi ? 'नाड़ी' : 'Nadi', hi ? P.nakshatra.nadi[1] : P.nakshatra.nadi[0]],
    [hi ? 'वर्ण' : 'Varna', hi ? P.varna[1] : P.varna[0]],
    [hi ? 'वश्य' : 'Vashya', hi ? P.vashya[1] : P.vashya[0]],
    [hi ? 'तत्व' : 'Element', hi ? P.tatva[1] : P.tatva[0]],
    [hi ? 'देवता' : 'Deity', hi ? P.nakshatra.devata[1] : P.nakshatra.devata[0]],
  ];
  return (
    <div className="pt-6">
      <Section title={hi ? 'पंचांग' : 'Panchang'} subtitle={hi ? 'जन्म समय का पंचांग — तिथि, वार, नक्षत्र, योग, करण' : 'Birth-moment almanac'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {rows.map(([k, v]) => <KV key={k} k={k} v={v} />)}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{hi ? `चंद्र ${P.nakshatra.fraction >= 0.5 ? 'उत्तरार्ध' : 'पूर्वार्ध'}` : `Moon ${P.nakshatra.fraction >= 0.5 ? 'latter' : 'former'} half of nakshatra`}</Pill>
          <Pill tone="blue">{hi ? `तिथि ${P.tithi.idx + 1}/30` : `Tithi ${P.tithi.idx + 1}/30`}</Pill>
        </div>
      </Section>
    </div>
  );
}
