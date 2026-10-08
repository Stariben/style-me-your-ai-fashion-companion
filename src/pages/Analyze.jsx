import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLang } from '@/lib/i18n';
import { Sparkles, RefreshCw } from 'lucide-react';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

import PhotoUploader from '../components/PhotoUploader';
import ResultCard from '../components/ResultCard';
import AnalyzingOverlay from '../components/AnalyzingOverlay';
import Paywall from '../components/Paywall';

const FREE_ANALYSES = 3;

export default function Analyze() {
  const { t, lang } = useLang();

  const [personImage, setPersonImage] = useState(null);
  const [outfitImage, setOutfitImage] = useState(null);
  const [result, setResult] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPaymentSuccess = params.get('payment') === 'success';
    const stripeSessionId = params.get('session_id');
    if (params.get('payment')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('payment') === 'cancel') {
      toast({ title: t('paymentCancelTitle'), description: t('paymentCancelDesc') });
    }

    let cancelled = false;
    let pollTimer = null;

    const fetchCredits = async () => {
      const me = await base44.auth.me();
      const res = await base44.entities.UserCredits.filter({ user_id: me.id }, { limit: 1 });
      return res.items[0] || { analysis_credits: 0, free_analyses_used: 0 };
    };

    const loadUser = async () => {
      const user = await fetchCredits();
      if (cancelled) return;
      setUserData(user);

      if (isPaymentSuccess) {
        toast({ title: t('paymentSuccessTitle'), description: t('paymentSuccessDesc') });
        // Verify the payment with Stripe and grant the credits (idempotent with the webhook)
        if (stripeSessionId) {
          await base44.functions.invoke('stripeCheckout', { action: 'confirm', sessionId: stripeSessionId }).catch(() => {});
          if (cancelled) return;
          setUserData(await fetchCredits());
        }
        let attempts = 0;
        const creditsBefore = user?.analysis_credits || 0;
        const poll = async () => {
          if (cancelled) return;
          attempts++;
          const u = await fetchCredits();
          if (cancelled) return;
          setUserData(u);
          if ((u?.analysis_credits || 0) > creditsBefore) return; // credits updated ✓
          if (attempts < 12) pollTimer = setTimeout(poll, 2000); // keep polling up to ~24s
        };
        pollTimer = setTimeout(poll, 2000);
      }
    };
    loadUser();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  const freeUsed = userData?.free_analyses_used || 0;
  const paidCredits = userData?.analysis_credits || 0;
  // Allow if userData not yet loaded (server will enforce quota) or quota available
  const canUseApp = !userData || freeUsed < FREE_ANALYSES || paidCredits > 0;

  const handleReset = useCallback(() => {
    setOutfitImage(null);
    setResult(null);
    setGeneratedImage(null);
  }, []);

  const analyzeMutation = useMutation({
    onMutate: () => {
      setResult(null);
      setGeneratedImage(null);
    },
    mutationFn: async ({ personImg, outfitImg }) => {
      const res = await base44.functions.invoke('analyzeOutfit', {
        personImg,
        outfitImg,
        lang,
      });

      if (res.data?.needsPayment) {
        setShowPaywall(true);
        throw new Error('quota_exceeded');
      }

      if (!res.data?.analysis || !res.data?.imageUrl) {
        throw new Error(res.data?.error || 'Analyse échouée');
      }

      return { analysis: res.data.analysis, imageUrl: res.data.imageUrl };
    },
    onSuccess: async ({ analysis, imageUrl }) => {
      setResult(analysis);
      setGeneratedImage(imageUrl);
      const me = await base44.auth.me();
      const res = await base44.entities.UserCredits.filter({ user_id: me.id }, { limit: 1 });
      setUserData(res.items[0] || { analysis_credits: 0, free_analyses_used: 0 });
    },
    onError: (err) => {
      if (err.message === 'quota_exceeded') return;
    },
  });

  const handleRefresh = useCallback(() => {
    handleReset();
    analyzeMutation.reset();
  }, [handleReset, analyzeMutation]);

  const { pullDistance, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(handleRefresh);

  const isAnalyzing = analyzeMutation.isPending;
  const canAnalyze = personImage && outfitImage && !isAnalyzing;

  const handleAnalyze = async () => {
    if (!canUseApp) {
      setShowPaywall(true);
      return;
    }
    analyzeMutation.mutate({ personImg: personImage, outfitImg: outfitImage });
  };

  return (
    <div
      className="min-h-screen pt-4 pb-32"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {pullDistance > 0 && (
        <div className="flex items-center justify-center overflow-hidden transition-all" style={{ height: pullDistance }}>
          <RefreshCw className="h-5 w-5 text-primary transition-transform" />
        </div>
      )}

      <AnimatePresence>{isAnalyzing && <AnalyzingOverlay />}</AnimatePresence>
      <AnimatePresence>{showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}</AnimatePresence>

      <div className="max-w-3xl lg:max-w-4xl mx-auto">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-6 mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {t('doesThisOutfit')}
            <br />
            <span className="bg-gradient-to-r from-primary to-aurora-pink bg-clip-text text-transparent">{t('suitYou')}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {t('homeSubtitle')}
          </p>
        </motion.div>

        {/* Upload section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-6"
        >
          <div className="flex gap-4">
            <PhotoUploader
              type="person"
              imageUrl={personImage}
              onImageUploaded={setPersonImage}
              onClear={() => setPersonImage(null)}
            />
            <PhotoUploader
              type="outfit"
              imageUrl={outfitImage}
              onImageUploaded={setOutfitImage}
              onClear={() => setOutfitImage(null)}
            />
          </div>
        </motion.div>

        {/* Analyze button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-6 mt-6"
        >
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="btn-aurora w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles className="h-5 w-5" />
            {t('analyzeMyLook')}
          </button>

          {!personImage && !outfitImage && (
            <p className="text-xs text-center text-muted-foreground mt-3">
              {t('uploadBothPhotos')}
            </p>
          )}

          {userData && (
            <div className="mt-3 flex justify-center">
              {paidCredits > 0 ? (
                <span className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                  ⚡ {paidCredits} {paidCredits > 1 ? t('creditsRemaining') : t('creditRemaining')}
                </span>
              ) : freeUsed < FREE_ANALYSES ? (
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {FREE_ANALYSES - freeUsed} {FREE_ANALYSES - freeUsed > 1 ? t('freeAnalysesRemaining') : t('freeAnalysisRemaining')}
                </span>
              ) : (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="text-xs text-primary font-medium underline"
                >
                  {t('noMoreFreeAnalyses')} → {t('buyPack')}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && <ResultCard key="result-card" result={result} generatedImage={generatedImage} personImage={personImage} outfitImage={outfitImage} onReset={handleReset} />}
        </AnimatePresence>
      </div>
    </div>
  );
}