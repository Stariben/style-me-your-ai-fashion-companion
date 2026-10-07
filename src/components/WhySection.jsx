import { motion } from 'framer-motion';
import { Eye, ShieldCheck, Palette, BookMarked } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import AuroraSection from '@/components/home/AuroraSection';

const FEATURES = [
  { icon: Eye, titleKey: 'featureVisualTryOnTitle', descKey: 'featureVisualTryOnDesc', tint: 'from-white/[0.07]' },
  { icon: ShieldCheck, titleKey: 'featurePrivacyTitle', descKey: 'featurePrivacyDesc', tint: 'from-primary/[0.17]' },
  { icon: Palette, titleKey: 'featureStyleTitle', descKey: 'featureStyleDesc', tint: 'from-aurora-pink/[0.13]' },
  { icon: BookMarked, titleKey: 'featureSaveTitle', descKey: 'featureSaveDesc', tint: 'from-primary/[0.1]' },
];

export default function WhySection() {
  const { t } = useLang();

  return (
    <AuroraSection id="section-why" title={t('whyTitle')} subtitle={t('whySubtitle')}>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.08 }}
              className={`glass min-h-[200px] rounded-[23px] bg-gradient-to-br ${f.tint} to-white/[0.02] p-[27px]`}
            >
              <div className="mb-6 flex h-[45px] w-[45px] items-center justify-center rounded-[14px] bg-gradient-to-br from-primary to-aurora-pink text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-[21px] font-extrabold leading-tight tracking-[-0.02em]">
                {t(f.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
            </motion.article>
          );
        })}
      </div>
    </AuroraSection>
  );
}