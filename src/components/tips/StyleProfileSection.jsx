import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, UserRound, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import SuggestionCard from '@/components/SuggestionCard';

function Chips({ label, items }) {
  if (!items?.length) return null;
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((x) => (
          <span key={x} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">{x}</span>
        ))}
      </div>
    </div>
  );
}

export default function StyleProfileSection({ copy }) {
  const { lang } = useLang();
  const [state, setState] = useState({ loading: true, profile: null, busy: false, error: null });

  useEffect(() => {
    base44.functions.invoke('styleProfile', { action: 'get' })
      .then((res) => setState({ loading: false, profile: res.data?.profile || null, busy: false, error: null }))
      .catch(() => setState({ loading: false, profile: null, busy: false, error: null }));
  }, []);

  const refresh = async () => {
    setState((s) => ({ ...s, busy: true, error: null }));
    try {
      const res = await base44.functions.invoke('styleProfile', { action: 'refresh', lang });
      setState({ loading: false, profile: res.data.profile, busy: false, error: null });
    } catch (e) {
      const noHistory = e?.response?.data?.noHistory;
      setState((s) => ({ ...s, busy: false, error: noHistory ? copy.noHistory : copy.error }));
    }
  };

  if (state.loading) return null;
  const { profile, busy, error } = state;

  return (
    <section className="mb-8 glass bg-white/[0.04] rounded-3xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <UserRound className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-lg font-bold">{copy.heading}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{copy.intro}</p>

      {profile && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(copy.traits).map(([key, label]) => profile[key] && (
              <div key={key} className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{profile[key]}</p>
              </div>
            ))}
          </div>
          <Chips label={copy.colors} items={profile.best_colors} />
          <Chips label={copy.cuts} items={profile.best_cuts} />
          <Chips label={copy.avoid} items={profile.avoid} />
          {profile.recommendations?.length > 0 && (
            <>
              <p className="text-sm font-semibold mt-5 mb-2">{copy.picks}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {profile.recommendations.map((s, i) => (
                  <SuggestionCard key={s.name} suggestion={s} delay={i * 0.08} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {busy && <p className="text-sm text-muted-foreground mb-3">{copy.loading}</p>}
      {error && (
        <p className="text-sm text-red-400 mb-3">
          {error} {error === copy.noHistory && <Link to="/analyze" className="underline">StyleMe</Link>}
        </p>
      )}
      <button onClick={refresh} disabled={busy} className="login-aurora w-full flex items-center justify-center gap-2 h-12 disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {profile ? copy.refresh : copy.generate}
      </button>
    </section>
  );
}