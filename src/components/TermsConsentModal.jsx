import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { ShieldCheck } from 'lucide-react';

const CONSENT_KEY = 'styleme_terms_accepted';

export default function TermsConsentModal({ userId }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (localStorage.getItem(`${CONSENT_KEY}_${userId}`)) return;
    base44.functions.invoke('termsConsent', { action: 'get' }).then((res) => {
      if (res.data?.accepted) localStorage.setItem(`${CONSENT_KEY}_${userId}`, '1');
      else setVisible(true);
    }).catch(() => setVisible(true));
  }, [userId]);

  const handleAccept = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('termsConsent', { action: 'accept' });
      localStorage.setItem(`${CONSENT_KEY}_${userId}`, '1');
      setVisible(false);
    } catch {
      alert(t('errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end justify-center"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-lg bg-background rounded-t-3xl p-6 pb-10 shadow-2xl"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-center mb-2">
              {t('consentModalTitle')}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              {t('consentModalDesc')}
            </p>

            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer mb-6 select-none">
              <div
                onClick={() => setChecked((v) => !v)}
                className={`mt-0.5 h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
                  checked ? 'bg-primary border-primary' : 'border-muted-foreground/40 bg-background'
                }`}
              >
                {checked && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-foreground leading-relaxed" onClick={() => setChecked((v) => !v)}>
                {t('consentCheckboxPre')}{' '}
                <Link
                  to="/terms"
                  className="text-primary underline underline-offset-2 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('termsTitle')}
                </Link>{' '}
                {t('consentCheckboxMid')}{' '}
                <Link
                  to="/privacy"
                  className="text-primary underline underline-offset-2 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('privacyPolicy')}
                </Link>
              </span>
            </label>

            <Button
              onClick={handleAccept}
              disabled={!checked || saving}
              className="w-full h-12 rounded-2xl text-base font-semibold"
            >
              {t('consentAccept')}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}