import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import AuroraSection from '@/components/home/AuroraSection';

const TESTIMONIALS = [
  {
    nameKey: 'testimonial1Name',
    textKey: 'testimonial1Text',
    titleKey: 'testimonial1Title',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
  },
  {
    nameKey: 'testimonial2Name',
    textKey: 'testimonial2Text',
    titleKey: 'testimonial2Title',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
  },
  {
    nameKey: 'testimonial3Name',
    textKey: 'testimonial3Text',
    titleKey: 'testimonial3Title',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80',
  },
];

export default function TestimonialsSection() {
  const { t } = useLang();

  return (
    <AuroraSection title={t('testimonialsTitle')} subtitle={t('testimonialsSubtitle')}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((item, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: i * 0.09 }}
            className="flex min-h-[155px] flex-col gap-4 rounded-[22px] border border-white/[0.12] bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-[25px]"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-base font-bold leading-snug">{t(item.titleKey)}</p>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{t(item.textKey)}</p>
            <div className="flex items-center gap-3 border-t border-white/10 pt-3">
              <img src={item.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold">{t(item.nameKey)}</p>
                <p className="text-[11px] text-muted-foreground">✓ Verified</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </AuroraSection>
  );
}