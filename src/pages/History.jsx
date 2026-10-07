import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, X, GitCompare, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResultCard from '../components/ResultCard';
import ImageLightbox from '../components/ImageLightbox';

function HistoryItemModal({ item, onClose }) {
  const { t } = useLang();
  let result = {};
  try { result = JSON.parse(item.result_json || '{}'); } catch (_) {}
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-background flex items-center justify-between px-6 pt-5 pb-3 border-b border-border">
          <h2 className="font-bold text-lg">{t('analysisDetails')}</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ResultCard result={result} generatedImage={item.generated_image} personImage={item.person_image} outfitImage={item.outfit_image} onReset={onClose} />
      </motion.div>
    </motion.div>,
    document.body
  );
}

function CompareView({ itemA, itemB, onClose, getScoreColor }) {
  const { t } = useLang();
  const [zoom, setZoom] = useState(null);
  let resultA = {}, resultB = {};
  try { resultA = JSON.parse(itemA.result_json || '{}'); } catch (_) {}
  try { resultB = JSON.parse(itemB.result_json || '{}'); } catch (_) {}

  const ColCard = ({ item, result }) => (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      {item.generated_image && (
        <div className="rounded-2xl overflow-hidden border border-border aspect-[3/4] cursor-zoom-in" onClick={() => setZoom({ src: item.generated_image, alt: 'AI preview' })}>
          <img src={item.generated_image} alt="AI preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="text-center">
        <span className={`text-3xl font-bold ${getScoreColor(result.match_score)}`}>{result.match_score}</span>
        <span className="text-xs text-muted-foreground">/10</span>
        <p className="text-xs font-semibold mt-1 leading-snug">{result.verdict}</p>
      </div>
      <div className="rounded-xl overflow-hidden border border-border aspect-[3/4] cursor-zoom-in" onClick={() => setZoom({ src: item.outfit_image, alt: 'Outfit' })}>
        <img src={item.outfit_image} alt="Outfit" className="w-full h-full object-cover" />
      </div>
      {result.pros?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-500 mb-1">{t('whatWorks')}</p>
          <ul className="space-y-1">
            {result.pros.map((p, i) => <li key={i} className="text-xs text-muted-foreground leading-snug">• {p}</li>)}
          </ul>
        </div>
      )}
      {result.styling_tips?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-accent mb-1">{t('tips')}</p>
          <ul className="space-y-1">
            {result.styling_tips.map((tip, i) => <li key={i} className="text-xs text-muted-foreground leading-snug">• {tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  );

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:items-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="bg-background rounded-t-3xl max-h-[92vh] overflow-y-auto w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background flex items-center justify-between px-6 pt-5 pb-3 border-b border-border z-10">
          <h2 className="font-bold text-lg">{t('sideBySide')}</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('yourLook')}</p>
          <div className="w-24 mx-auto rounded-2xl overflow-hidden border border-border aspect-[3/4] cursor-zoom-in" onClick={() => setZoom({ src: itemA.person_image, alt: 'Person' })}>
            <img src={itemA.person_image} alt="Person" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="px-6 pb-2">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">{t('outfitsCompared')}</p>
          <div className="flex gap-3">
            <ColCard item={itemA} result={resultA} />
            <div className="w-px bg-border shrink-0 self-stretch" />
            <ColCard item={itemB} result={resultB} />
          </div>
        </div>

        <div className="mx-6 mb-28 mt-4 rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('betterMatch')}</p>
          <p className="font-bold text-primary text-base">
            {resultA.match_score >= resultB.match_score ? t('outfit1Wins') : t('outfit2Wins')}
          </p>
        </div>
      </motion.div>
      {zoom && <ImageLightbox src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </motion.div>,
    document.body
  );
}

export default function History() {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareItems, setCompareItems] = useState([]);
  const [comparing, setComparing] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteItems, setDeleteItems] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['analysis-history'],
    queryFn: async () => {
      const me = await base44.auth.me();
      const res = await base44.entities.AnalysisHistory.filter(
        { $or: [{ user_id: me.id }, { created_by_id: me.id }] },
        { sort: '-created_date', limit: 50 }
      );
      return res.items;
    },
  });

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-amber-500';
    return 'text-red-400';
  };

  const toggleCompareSelect = (item) => {
    setCompareItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      if (prev.length >= 2) return prev;
      return [...prev, item];
    });
  };

  const handleStartCompare = () => {
    if (compareItems.length === 2) {
      setComparing(compareItems);
      setCompareMode(false);
      setCompareItems([]);
    }
  };

  const cancelCompare = () => {
    setCompareMode(false);
    setCompareItems([]);
  };

  const toggleDeleteSelect = (item) => {
    setDeleteItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists ? prev.filter((i) => i.id !== item.id) : [...prev, item];
    });
  };

  const handleDelete = async () => {
    if (deleteItems.length === 0) return;
    setDeleting(true);
    try {
      await Promise.all(deleteItems.map((item) => base44.entities.AnalysisHistory.delete(item.id)));
      queryClient.invalidateQueries({ queryKey: ['analysis-history'] });
      setDeleteItems([]);
      setDeleteMode(false);
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteMode(false);
    setDeleteItems([]);
  };

  return (
    <div className="min-h-screen pb-32 max-w-3xl mx-auto">
      <div className="px-6 pt-8 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('historyTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('historySubtitle')}</p>
        </div>
        {!compareMode && !deleteMode && (
          <div className="flex gap-2 mt-1">
            {items.length >= 2 && (
              <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => setCompareMode(true)}>
                <GitCompare className="h-4 w-4" />
                {t('compare')}
              </Button>
            )}
            {items.length > 0 && (
              <Button variant="outline" size="sm" className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5" onClick={() => setDeleteMode(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 mb-4 rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center justify-between gap-3"
          >
            <p className="text-sm font-medium text-primary">
              {compareItems.length === 0 && t('select2')}
              {compareItems.length === 1 && t('select1More')}
              {compareItems.length === 2 && t('readyToCompare')}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="rounded-xl h-8 px-3" onClick={cancelCompare}>{t('cancel')}</Button>
              {compareItems.length === 2 && (
                <Button size="sm" className="rounded-xl h-8 px-3" onClick={handleStartCompare}>{t('compare')}</Button>
              )}
            </div>
          </motion.div>
        )}
        {deleteMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 flex items-center justify-between gap-3"
          >
            <p className="text-sm font-medium text-destructive">
              {deleteItems.length === 0 ? t('deleteSelectLabel') : t('deleteSelected', deleteItems.length)}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="rounded-xl h-8 px-3" onClick={cancelDelete}>{t('cancel')}</Button>
              {deleteItems.length > 0 && (
                <Button size="sm" className="rounded-xl h-8 px-3 bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete} disabled={deleting}>
                  {deleting ? '...' : <><Trash2 className="h-3.5 w-3.5 mr-1" />{t('deleteBtn')}</>}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-3">
          <div className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center">
            <Clock className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-semibold">{t('noAnalysesYet')}</p>
          <p className="text-sm text-muted-foreground">{t('noAnalysesMsg')}</p>
        </div>
      )}

      <div className="px-6 space-y-3">
        {items.map((item, i) => {
          const isCompareSelected = compareItems.some((c) => c.id === item.id);
          const isDeleteSelected = deleteItems.some((d) => d.id === item.id);
          const isSelected = compareMode ? isCompareSelected : isDeleteSelected;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                if (compareMode) toggleCompareSelect(item);
                else if (deleteMode) toggleDeleteSelect(item);
                else setSelected(item);
              }}
              className={`w-full glass bg-white/[0.04] border rounded-2xl p-4 flex items-center gap-4 text-left cursor-pointer active:scale-[0.98] transition-all ${
                deleteMode && isDeleteSelected ? 'border-destructive ring-2 ring-destructive/20' :
                compareMode && isCompareSelected ? 'border-primary ring-2 ring-primary/20' : 'border-white/[0.12]'
              } ${compareMode && compareItems.length === 2 && !isCompareSelected ? 'opacity-40' : ''}`}
            >
              {(compareMode || deleteMode) && (
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  deleteMode && isDeleteSelected ? 'border-destructive bg-destructive' :
                  compareMode && isCompareSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                </div>
              )}
              <div className="flex -space-x-3 shrink-0">
                <div className="h-12 w-12 rounded-xl overflow-hidden border-2 border-background z-10">
                  <img src={item.person_image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-12 w-12 rounded-xl overflow-hidden border-2 border-background">
                  <img src={item.outfit_image} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.verdict || '—'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(item.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-lg font-bold ${getScoreColor(item.match_score)}`}>{item.match_score}</span>
                {!compareMode && !deleteMode && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && <HistoryItemModal item={selected} onClose={() => setSelected(null)} />}
        {comparing && <CompareView itemA={comparing[0]} itemB={comparing[1]} onClose={() => setComparing(null)} getScoreColor={getScoreColor} />}
      </AnimatePresence>
    </div>
  );
}