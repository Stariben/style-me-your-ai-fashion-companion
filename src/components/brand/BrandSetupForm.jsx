import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { brandAdmin, notifyError } from '@/lib/brandAdmin';

export default function BrandSetupForm({ brand, onSaved }) {
  const [name, setName] = useState(brand?.name || '');
  const [days, setDays] = useState(brand?.retention_days || 30);
  const save = useMutation({
    mutationFn: () => brandAdmin('save', { name, retentionDays: Number(days) }),
    onSuccess: () => { toast({ title: 'Enregistré' }); onSaved(); },
    onError: notifyError(toast),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="glass rounded-2xl p-5 bg-card/60 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brand-name">Nom de la marque</Label>
        <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="brand-days">Conservation des résultats (jours)</Label>
        <Input id="brand-days" type="number" min={1} max={365} value={days} onChange={(e) => setDays(e.target.value)} />
        <p className="text-xs text-muted-foreground">Passé ce délai, les images générées ne sont plus accessibles.</p>
      </div>
      <button type="submit" disabled={save.isPending || !name.trim()} className="btn-aurora !py-3 !text-base disabled:opacity-40">
        {brand ? 'Enregistrer' : 'Créer mon espace marque'}
      </button>
    </form>
  );
}