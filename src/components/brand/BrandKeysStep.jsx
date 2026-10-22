import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { brandAdmin, notifyError } from '@/lib/brandAdmin';

export default function BrandKeysStep({ brand, usage, onChange }) {
  const [newKey, setNewKey] = useState(null);
  const rotate = useMutation({
    mutationFn: () => brandAdmin('rotateKey'),
    onSuccess: (d) => { setNewKey(d.apiKey); onChange(); },
    onError: notifyError(toast),
  });
  const revoke = useMutation({
    mutationFn: () => brandAdmin('revokeKey'),
    onSuccess: () => { setNewKey(null); toast({ title: 'Clé révoquée' }); onChange(); },
    onError: notifyError(toast),
  });
  const onRotate = () => {
    if (brand.has_key && !window.confirm('L\'ancienne clé cessera immédiatement de fonctionner. Continuer ?')) return;
    rotate.mutate();
  };
  const pct = Math.min(100, Math.round((usage.used / Math.max(1, usage.quota)) * 100));

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 bg-card/60 space-y-3">
        <p className="font-bold">Clé API</p>
        <p className="text-sm text-muted-foreground">
          {brand.has_key ? `Clé active : ${brand.api_key_prefix}••••••••` : 'Aucune clé active.'} Utilisez-la uniquement depuis le serveur de votre site, jamais dans le navigateur.
        </p>
        {newKey && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-3">
            <p className="text-xs text-muted-foreground mb-2">Copiez-la maintenant : elle ne sera plus affichée.</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all flex-1">{newKey}</code>
              <button onClick={() => { navigator.clipboard.writeText(newKey); toast({ title: 'Copiée' }); }} aria-label="Copier la clé"><Copy className="h-4 w-4" /></button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button onClick={onRotate} disabled={rotate.isPending} className="btn-aurora !py-3 !text-base disabled:opacity-40">
            {brand.has_key ? 'Renouveler la clé' : 'Générer une clé'}
          </button>
          {brand.has_key && (
            <button onClick={() => revoke.mutate()} disabled={revoke.isPending} className="login-aurora disabled:opacity-40">Révoquer</button>
          )}
        </div>
      </div>
      <div className="glass rounded-2xl p-5 bg-card/60">
        <p className="font-bold">Quota du mois</p>
        <p className="text-sm text-muted-foreground mb-3">{usage.used} / {usage.quota} essayages</p>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-aurora-pink" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}