import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function CTASection({ onStartAnalysis }) {
  const { t } = useLang();

  return (
    <section className="px-5 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mt-6 max-w-[1440px]"
      >
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.12] bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-8 py-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.33)] md:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_130%,rgba(140,66,215,0.33),transparent_65%)]" />
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
              <Sparkles className="h-3 w-3" />
              StyleMe AI
            </div>
            <h2 className="mb-4 text-[2.2rem] font-extrabold leading-[1.15] tracking-[-0.04em] md:text-[2.6rem]">
              {t('ctaTitle')}
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-muted-foreground md:text-xl">
              {t('ctaSubtitle')}
            </p>
            <button onClick={onStartAnalysis} className="btn-aurora">
              {t('ctaButton')}
              <span className="text-[22px]">→</span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}