import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { brandAdmin } from '@/lib/brandAdmin';
import BrandSetupForm from '@/components/brand/BrandSetupForm';
import BrandConnectForm from '@/components/brand/BrandConnectForm';
import BrandCatalogStep from '@/components/brand/BrandCatalogStep';
import BrandKeysStep from '@/components/brand/BrandKeysStep';
import BrandJobsStep from '@/components/brand/BrandJobsStep';
import BrandDocs from '@/components/brand/BrandDocs';

export default function BrandDashboard() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['brand'],
    queryFn: async () => {
      try { return await brandAdmin('get'); } catch (e) { return { brand: null }; }
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ['brand'] });
  const brand = data?.brand;

  return (
    <div className="min-h-screen px-6 pt-10 pb-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Espace <span className="bg-gradient-to-r from-primary to-aurora-pink bg-clip-text text-transparent">marques</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2 mb-8">Proposez l'essayage virtuel de vos articles à vos propres clients.</p>

        {isLoading && <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto" />}
        {!isLoading && !brand && !error && <BrandSetupForm brand={null} onSaved={refresh} />}
        {brand && (
          <Tabs defaultValue="shop">
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="shop">1. Boutique</TabsTrigger>
              <TabsTrigger value="catalog">2. Catalogue</TabsTrigger>
              <TabsTrigger value="keys">3. Clés API</TabsTrigger>
              <TabsTrigger value="jobs">4. Essayages</TabsTrigger>
              <TabsTrigger value="docs">Documentation</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="shop" className="space-y-4">
                <BrandSetupForm brand={brand} onSaved={refresh} />
                <BrandConnectForm brand={brand} onDone={refresh} />
              </TabsContent>
              <TabsContent value="catalog"><BrandCatalogStep brand={brand} onSynced={refresh} /></TabsContent>
              <TabsContent value="keys"><BrandKeysStep brand={brand} usage={data.usage} onChange={refresh} /></TabsContent>
              <TabsContent value="jobs"><BrandJobsStep /></TabsContent>
              <TabsContent value="docs"><BrandDocs /></TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}