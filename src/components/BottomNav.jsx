import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, User, Clock } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useCamera } from '@/lib/CameraContext';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();
  const { isCameraOpen } = useCamera();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  if (isCameraOpen || !isAuthenticated) return null;

  const tabs = [
    { path: '/analyze', label: 'StyleMe', icon: Sparkles },
    { path: '/history', label: t('history'), icon: Clock },
    { path: '/account', label: t('account'), icon: User },
  ];

  return createPortal(
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/50 backdrop-blur-xl border-t border-white/10 md:left-1/2 md:right-auto md:bottom-4 md:w-[460px] md:-translate-x-1/2 md:rounded-2xl md:border shadow-[0_-8px_30px_rgba(0,0,0,0.3)] flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path, { replace: active })}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
          >
            <Icon className={`h-5 w-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>,
    document.body
  );
}