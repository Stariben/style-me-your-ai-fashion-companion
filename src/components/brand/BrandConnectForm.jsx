import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { brandAdmin, notifyError } from '@/lib/brandAdmin';

export default function BrandConnectForm({ brand, onDone }) {
  const [shopDomain, setShopDomain] = useState(brand.shop_domain || '');
  const [storeUrl, setStoreUrl] = useState(brand.store_url || '');
  const [token, setToken] = useState('');
  const connect = useMutation({
    mutationFn: () => brandAdmin('connect', { shopDomain, storeUrl, token }),
    onSuccess: () => { setToken(''); toast({ title: 'Boutique connectée, catalogue importé' }); onDone(); },
    onError: notifyError(toast),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); connect.mutate(); }} className="glass rounded-2xl p-5 bg-card/60 space-y-4">
      <p className="font-bold">Boutique Shopify</p>
      <div className="space-y-2">
        <Label htmlFor="shop-domain">Domaine Shopify</Label>
        <Input id="shop-domain" placeholder="maboutique.myshopify.com" value={shopDomain} onChange={(e) => setShopDomain(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="store-url">Adresse publique du site (optionnel)</Label>
        <Input id="store-url" placeholder="https://www.mamarque.com" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} />
        <p className="text-xs text-muted-foreground">Utilisée pour les liens d'achat vers vos fiches produit.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="shop-token">Jeton Admin API</Label>
        <Input id="shop-token" type="password" autoComplete="off" placeholder={brand.shop_connected ? '•••••••• (saisir pour remplacer)' : 'shpat_...'} value={token} onChange={(e) => setToken(e.target.value)} required />
        <p className="text-xs text-muted-foreground">
          Dans Shopify : Paramètres, Applications, Développer des applications. Créez une application avec le droit « read_products », installez-la, puis copiez le jeton. Il est stocké côté serveur uniquement.
        </p>
      </div>
      <button type="submit" disabled={connect.isPending} className="btn-aurora !py-3 !text-base disabled:opacity-40">
        {connect.isPending ? 'Connexion et import...' : brand.shop_connected ? 'Reconnecter et synchroniser' : 'Connecter ma boutique'}
      </button>
    </form>
  );
}