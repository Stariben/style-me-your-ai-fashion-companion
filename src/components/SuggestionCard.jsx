import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function SuggestionCard({ suggestion, delay = 0 }) {
  const { t } = useLang();
  const s = typeof suggestion === 'string' ? { name: suggestion } : suggestion;
  const query = s.search_query || s.name;
  const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass bg-white/[0.04] rounded-2xl overflow-hidden flex flex-col"
    >
      {s.image_url && (
        <div className="aspect-square bg-white/[0.06]">
          <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-semibold leading-snug">{s.name}</p>
        {s.reason && <p className="text-xs text-muted-foreground leading-snug">{s.reason}</p>}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t('resultShop')}
        </a>
      </div>
    </motion.div>
  );
}