import { useMutation, useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { brandAdmin, notifyError } from '@/lib/brandAdmin';

const STATUS = {
  idle: 'Non synchronisé',
  syncing: 'Synchronisation en cours...',
  ok: 'Catalogue à jour',
  empty: 'Catalogue vide : aucun article actif avec photo',
  error: 'Erreur de synchronisation',
};

export default function BrandCatalogStep({ brand, onSynced }) {
  const { data } = useQuery({
    queryKey: ['brandProducts', brand.last_synced_at],
    queryFn: () => brandAdmin('products'),
    enabled: brand.shop_connected,
  });
  const sync = useMutation({
    mutationFn: () => brandAdmin('sync'),
    onSuccess: onSynced,
    onError: notifyError(toast),
  });

  if (!brand.shop_connected) {
    return <p className="text-sm text-muted-foreground glass rounded-2xl p-5 bg-card/60">Connectez d'abord votre boutique (étape 1).</p>;
  }
  const products = data?.products || [];

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 bg-card/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">{STATUS[sync.isPending ? 'syncing' : brand.sync_status] || STATUS.idle}</p>
          <p className="text-xs text-muted-foreground">
            {brand.product_count} article(s){brand.last_synced_at ? ` · dernière synchro ${new Date(brand.last_synced_at).toLocaleString('fr-FR')}` : ''}
          </p>
          {brand.sync_error && <p className="text-xs text-destructive mt-1">{brand.sync_error}</p>}
        </div>
        <button onClick={() => sync.mutate()} disabled={sync.isPending} className="login-aurora flex items-center gap-2 disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${sync.isPending ? 'animate-spin' : ''}`} /> Synchroniser
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {products.map((p) => (
          <a key={p.id} href={p.product_url} target="_blank" rel="noreferrer" className="glass rounded-xl overflow-hidden bg-card/60 block">
            <img src={p.image_url} alt={p.title} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="p-2">
              <p className="text-xs font-semibold truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.price} {p.currency}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}