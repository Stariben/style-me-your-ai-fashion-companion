import { useState } from 'react';
import { useLang } from '@/lib/i18n';

const DEMO_IMAGE = 'https://media.base44.com/images/public/69c1a602ac220e242945c724/47a28fb4a_generated_9b23d98d.jpg';

const LABELS = {
  fr: ['Avant', 'Après'],
  en: ['Before', 'After'],
  es: ['Antes', 'Después'],
  ru: ['До', 'После'],
  zh: ['之前', '之后'],
  pt: ['Antes', 'Depois'],
};

export default function BeforeAfterDemo() {
  const { lang } = useLang();
  const [pos, setPos] = useState(50);
  const [before, after] = LABELS[lang] || LABELS.fr;
  const imgClass = 'block h-[300px] w-full object-cover md:h-[416px]';

  return (
    <div className="relative rounded-[30px] border border-white/[0.19] bg-gradient-to-br from-white/[0.11] to-white/[0.02] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.53),0_0_75px_rgba(140,66,215,0.2)] backdrop-blur-[18px]">
      <div className="relative overflow-hidden rounded-[21px]">
        <img src={DEMO_IMAGE} alt="" className={imgClass} />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img src={DEMO_IMAGE} alt="" className={`scale-[1.15] blur-md ${imgClass}`} />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/80 shadow-[0_0_12px_#f472b6]"
          style={{ left: `${pos}%`, opacity: pos <= 0 || pos >= 100 ? 0 : 1 }}
        />
      </div>
      <div className="flex items-center gap-3.5 px-2.5 pb-2 pt-[17px] text-sm font-bold text-[#eeeaf8]">
        <span>{before}</span>
        <div className="relative flex h-5 flex-1 items-center">
          <div className="h-[5px] w-full rounded-full bg-gradient-to-r from-primary to-aurora-pink" />
          <span
            className="pointer-events-none absolute top-1/2 h-[19px] w-[19px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-accent bg-white shadow-[0_0_18px_#f472b6]"
            style={{ left: `${pos}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={`${before} / ${after}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <span>{after}</span>
      </div>
    </div>
  );
}