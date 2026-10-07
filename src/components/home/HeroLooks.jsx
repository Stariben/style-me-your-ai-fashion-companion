const LOOKS = [
  { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=85', tag: 'Smart Casual', score: '9.2', delay: '0s' },
  { src: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&q=85', tag: 'Streetwear', score: '8.7', delay: '0.13s' },
  { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1000&q=85', tag: 'Minimal', score: '9.5', delay: '0.26s' },
];

export default function HeroLooks() {
  return (
    <div className="mt-6 mb-20 grid grid-cols-3 gap-3 md:mt-10 md:gap-6 lg:gap-8">
      {LOOKS.map((item) => (
        <article
          key={item.tag}
          className="aurora-rise relative overflow-hidden rounded-[22px] border border-white/[0.13] bg-card shadow-[0_18px_38px_rgba(0,0,0,0.33)]"
          style={{ animationDelay: item.delay }}
        >
          <img src={item.src} alt="" className="block aspect-[3/4] w-full object-cover" loading="lazy" decoding="async" />
          <div className="flex flex-col items-start gap-1 px-3 py-4 text-xs font-bold md:flex-row md:items-center md:justify-between md:gap-3 md:px-6 md:py-6 md:text-base">
            <span>{item.tag}</span>
            <span className="text-amber-300">★ {item.score}</span>
          </div>
        </article>
      ))}
    </div>
  );
}