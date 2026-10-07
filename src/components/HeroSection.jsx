import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import BeforeAfterDemo from '@/components/home/BeforeAfterDemo';
import HeroLooks from '@/components/home/HeroLooks';

export default function HeroSection({ onStartAnalysis }) {
  const { t } = useLang();

  return (
    <section className="px-5 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid items-center gap-12 py-12 md:py-[72px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-[90px]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-widest text-accent">
              <Sparkles className="h-3 w-3" />
              {t('herobadge')}
            </span>

            <h1 className="mb-7 max-w-[760px] text-[2.8rem] font-extrabold leading-[1.04] tracking-[-0.06em] sm:text-6xl lg:text-[82px]">
              {t('heroHeadline1')}<br />
              <span className="bg-gradient-to-r from-[#b46af3] to-aurora-pink bg-clip-text text-transparent">
                {t('heroHeadline2')}
              </span>
            </h1>

            <p className="mb-8 max-w-[540px] text-base leading-relaxed text-muted-foreground md:text-xl">
              {t('heroSubtitle')}
            </p>

            <button onClick={onStartAnalysis} className="btn-aurora">
              {t('getStartedFree')}
              <span className="text-[22px]">→</span>
            </button>

            <p className="mt-5 text-sm tracking-[0.15px] text-muted-foreground">
              {t('pricingFreeNote')} · {t('pricingFreeDesc')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28 }}
          >
            <BeforeAfterDemo />
          </motion.div>
        </div>

        <HeroLooks />
      </div>
    </section>
  );
}