import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import AuroraSection from '@/components/home/AuroraSection';

const PACKS = [
  { labelKey: 'paywallPack10Label', priceKey: 'paywallPack10Price', perKey: 'paywallPack10Per', best: false },
  { labelKey: 'paywallPack50Label', priceKey: 'paywallPack50Price', perKey: 'paywallPack50Per', best: true },
];

const CARD = 'relative min-h-[190px] rounded-[23px] border p-[30px]';

export default function PricingSection({ onStartAnalysis }) {
  const { t } = useLang();

  return (
    <AuroraSection id="section-pricing" title={t('pricingTitle')} subtitle={t('pricingSubtitle')}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className={`${CARD} border-white/[0.14] bg-white/[0.035]`}
        >
          <h3 className="mb-1 text-xl font-bold">{t('pricingFreeLabel')}</h3>
          <p className="mb-5 text-sm text-muted-foreground">{t('pricingFreeDesc')}</p>
          <p className="text-[43px] font-extrabold leading-none tracking-[-0.02em]">0€</p>
          <p className="mt-2 text-xs text-muted-foreground">{t('pricingFreeNote')}</p>
        </motion.div>

        {PACKS.map((pack, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className={`${CARD} ${
              pack.best
                ? 'border-accent bg-gradient-to-br from-primary/[0.22] to-white/[0.04] shadow-[0_0_38px_rgba(140,66,215,0.13)]'
                : 'border-white/[0.14] bg-white/[0.035]'
            }`}
          >
            {pack.best && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-aurora-pink px-3 py-1 text-xs font-bold text-white">
                {t('paywallBestValue')}
              </span>
            )}
            <h3 className="mb-1 flex items-center gap-2 text-xl font-bold">
              <Zap className="h-4 w-4 text-accent" />
              {t(pack.labelKey)}
            </h3>
            <p className="mb-5 text-sm text-muted-foreground">{t(pack.perKey)}</p>
            <p className="text-[43px] font-extrabold leading-none tracking-[-0.02em]">{t(pack.priceKey)}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mx-auto mt-8 max-w-md space-y-2"
      >
        {[t('pricingFeature1'), t('pricingFeature2'), t('pricingFeature3')].map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-aurora-pink" />
            {f}
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <button onClick={onStartAnalysis} className="btn-aurora">
          {t('getStartedFree')}
        </button>
        <p className="mt-3 text-xs text-muted-foreground">{t('paywallSecure')}</p>
      </motion.div>
    </AuroraSection>
  );
}