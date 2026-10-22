import { useQuery } from '@tanstack/react-query';
import { brandAdmin } from '@/lib/brandAdmin';

const LABEL = { done: 'Terminé', processing: 'En cours', failed: 'Échec' };

export default function BrandJobsStep() {
  const { data, isLoading } = useQuery({ queryKey: ['brandJobs'], queryFn: () => brandAdmin('jobs') });
  const jobs = data?.jobs || [];

  if (isLoading) return <div className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto" />;
  if (!jobs.length) {
    return <p className="text-sm text-muted-foreground glass rounded-2xl p-5 bg-card/60">Aucun essayage pour l'instant. Ils apparaîtront ici dès le premier appel à l'API.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {jobs.map((j) => (
        <div key={j.id} className="glass rounded-xl overflow-hidden bg-card/60">
          {j.url ? (
            <img src={j.url} alt={j.product_title} loading="lazy" className="aspect-[3/4] w-full object-cover" />
          ) : (
            <div className="aspect-[3/4] flex items-center justify-center text-xs text-muted-foreground px-2 text-center">
              {j.expired ? 'Image expirée' : LABEL[j.status] || j.status}
            </div>
          )}
          <div className="p-2">
            <p className="text-xs font-semibold truncate">{j.product_title}</p>
            <p className="text-xs text-muted-foreground">{LABEL[j.status] || j.status} · {new Date(j.created_date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}