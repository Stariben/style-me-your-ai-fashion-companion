const LOOKS = [
  { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', tag: 'Smart Casual', score: '9.2', delay: '0s' },
  { src: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80', tag: 'Streetwear', score: '8.7', delay: '0.13s' },
  { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', tag: 'Minimal', score: '9.5', delay: '0.26s' },
];

export default function HeroLooks() {
  return (
    <div className="mb-16 grid grid-cols-3 gap-3 md:gap-5">
      {LOOKS.map((item) => (
        <article
          key={item.tag}
          className="aurora-rise relative overflow-hidden rounded-[22px] border border-white/[0.13] bg-card shadow-[0_18px_38px_rgba(0,0,0,0.33)]"
          style={{ animationDelay: item.delay }}
        >
          <img src={item.src} alt="" className="block h-40 w-full object-cover md:h-[290px]" loading="lazy" decoding="async" />
          <div className="flex items-center justify-between px-3 py-3 text-xs font-bold md:px-[19px] md:py-[17px] md:text-base">
            <span>{item.tag}</span>
            <span className="text-amber-300">★ {item.score}</span>
          </div>
        </article>
      ))}
    </div>
  );
}