import { motion } from 'framer-motion';
import { Camera, Image, Wand2 } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import AuroraSection from '@/components/home/AuroraSection';

const STEPS = [
  { icon: Camera, num: '01', titleKey: 'step1Title', descKey: 'step1Desc', tint: 'from-white/[0.04]' },
  { icon: Image, num: '02', titleKey: 'step2Title', descKey: 'step2Desc', tint: 'from-primary/[0.17]' },
  { icon: Wand2, num: '03', titleKey: 'step3Title', descKey: 'step3Desc', tint: 'from-aurora-pink/[0.13]' },
];

export default function HowItWorksSection({ onStartAnalysis }) {
  const { t } = useLang();

  return (
    <AuroraSection id="section-how" title={t('howItWorksTitle')} subtitle={t('howItWorksSubtitle')}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.1 }}
              className={`relative min-h-[232px] overflow-hidden rounded-[24px] border border-white/[0.12] bg-gradient-to-br ${step.tint} to-white/[0.03] p-7`}
            >
              <Icon className="absolute right-7 top-7 h-6 w-6 text-white/30" />
              <div className="mb-8 text-[56px] font-extrabold leading-none text-accent">{step.num}</div>
              <h3 className="mb-2 text-2xl font-extrabold">{t(step.titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{t(step.descKey)}</p>
            </motion.article>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 }}
        className="mt-10 text-center"
      >
        <button onClick={onStartAnalysis} className="btn-aurora">
          {t('startNow')}
        </button>
      </motion.div>
    </AuroraSection>
  );
}