import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageLightbox from '@/components/ImageLightbox';
import PrivateImg from '@/components/PrivateImg';
import SuggestionCard from '@/components/SuggestionCard';
import { ThumbsUp, ThumbsDown, Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n';

function ScoreRing({ score }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  const getColor = () => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-amber-500';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.1 }}
      className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center drop-shadow-[0_0_24px_rgba(140,66,215,0.55)]"
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-white/10" />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
          className={getColor()}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-5xl md:text-6xl font-black ${getColor()}`}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium">/10</span>
      </div>
    </motion.div>
  );
}

function CompareTile({ src, label, highlight }) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <div className="flex-1 min-w-0">
      <div
        onClick={() => setZoomed(true)}
        className={`aspect-[3/4] rounded-2xl overflow-hidden cursor-zoom-in ${highlight ? 'border-2 border-primary shadow-[0_0_30px_rgba(140,66,215,0.45)]' : 'glass'}`}
      >
        <PrivateImg src={src} alt={label} className="w-full h-full object-cover" />
      </div>
      <p className={`text-xs font-semibold text-center mt-2 truncate ${highlight ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
      <AnimatePresence>
        {zoomed && <ImageLightbox src={src} alt={label} onClose={() => setZoomed(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function ResultCard({ result, generatedImage, personImage, outfitImage, onReset }) {
  const { t } = useLang();
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-6 mt-6 mb-8"
      data-testid="result-card"
    >
      <div className="glass bg-white/[0.04] rounded-3xl p-6">
        {/* Comparison: photo + outfit → AI result */}
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              {personImage && <CompareTile src={personImage} label={t('yourPhoto')} />}
              {outfitImage && <CompareTile src={outfitImage} label={t('outfitPhoto')} />}
              <CompareTile src={generatedImage} label={t('aiPreview')} highlight />
            </div>
          </motion.div>
        )}

        {/* Score */}
        <div className="flex flex-col items-center mb-6">
          <ScoreRing score={result.match_score} />
          <h3 className="text-2xl md:text-3xl font-extrabold mt-4 text-center leading-snug bg-gradient-to-r from-primary to-aurora-pink bg-clip-text text-transparent">{result.verdict}</h3>
        </div>

        {/* Pros */}
        {result.pros?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold">{t('resultWhatWorks')}</span>
            </div>
            <ul className="space-y-1.5">
              {result.pros.map((pro, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-sm text-muted-foreground pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-green-400"
                >
                  {pro}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {result.cons?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-semibold">{t('resultConsider')}</span>
            </div>
            <ul className="space-y-1.5">
              {result.cons.map((con, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-sm text-muted-foreground pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-red-400"
                >
                  {con}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        {result.styling_tips?.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">{t('resultStyleTips')}</span>
            </div>
            <ul className="space-y-1.5">
              {result.styling_tips.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-sm text-muted-foreground pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent"
                >
                  {tip}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {result.suggestions?.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-aurora-pink" />
              <span className="text-sm font-semibold">{t('resultSuggestions')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.suggestions.map((s, i) => (
                <SuggestionCard key={i} suggestion={s} delay={1.3 + i * 0.1} />
              ))}
            </div>
          </div>
        )}

        <button onClick={onReset} className="login-aurora w-full flex items-center justify-center gap-2 h-12">
          <RefreshCw className="h-4 w-4" />
          {t('tryAnotherOutfit')}
        </button>
      </div>
    </motion.div>
  );
}