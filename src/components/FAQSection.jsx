import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import AuroraSection from '@/components/home/AuroraSection';

const FAQ_KEYS = [
  { qKey: 'faq1Q', aKey: 'faq1A' },
  { qKey: 'faq2Q', aKey: 'faq2A' },
  { qKey: 'faq3Q', aKey: 'faq3A' },
  { qKey: 'faq4Q', aKey: 'faq4A' },
  { qKey: 'faq5Q', aKey: 'faq5A' },
  { qKey: 'faq6Q', aKey: 'faq6A' },
  { qKey: 'faq7Q', aKey: 'faq7A' },
];

export default function FAQSection() {
  const { t } = useLang();
  const [open, setOpen] = useState(null);

  return (
    <AuroraSection id="section-faq" title={t('faqTitle')} subtitle={t('faqSubtitle')}>
      <div className="mx-auto max-w-4xl space-y-2 md:space-y-3">
        {FAQ_KEYS.map(({ qKey, aKey }, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.06 }}
              className="glass overflow-hidden rounded-2xl bg-white/[0.04]"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left md:px-8 md:py-6"
              >
                <span className="text-[15px] font-semibold leading-snug md:text-lg">{t(qKey)}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 md:h-6 md:w-6 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-[14px] leading-relaxed text-muted-foreground md:px-8 md:pb-6 md:text-base">
                      {t(aKey)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </AuroraSection>
  );
}