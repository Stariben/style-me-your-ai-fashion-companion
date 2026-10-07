import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';

function isIOS() {
  const ua = navigator.userAgent || navigator.vendor || '';
  return /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || window.navigator.standalone === 1;
}

const iosInstallStrings = {
  fr: { title: "Installer StyleMe", subtitle: "Ajoutez l'app sur votre écran d'accueil", step1: <><strong>Partager</strong> <Share className="inline h-4 w-4 text-blue-500" /> en bas de Safari</>, step2: <>Faites défiler et appuyez sur <strong>« Sur l'écran d'accueil »</strong></>, step3: <>Appuyez sur <strong>Ajouter</strong> en haut à droite</> },
  en: { title: "Install StyleMe", subtitle: "Add the app to your home screen", step1: <>Tap <strong>Share</strong> <Share className="inline h-4 w-4 text-blue-500" /> at the bottom of Safari</>, step2: <>Scroll and tap <strong>"Add to Home Screen"</strong></>, step3: <>Tap <strong>Add</strong> in the top right</> },
  es: { title: "Instalar StyleMe", subtitle: "Añade la app a tu pantalla de inicio", step1: <>Pulsa <strong>Compartir</strong> <Share className="inline h-4 w-4 text-blue-500" /> en la parte inferior de Safari</>, step2: <>Desplázate y pulsa <strong>"En la pantalla de inicio"</strong></>, step3: <>Pulsa <strong>Añadir</strong> en la esquina superior derecha</> },
  ru: { title: "Установить StyleMe", subtitle: "Добавьте приложение на главный экран", step1: <>Нажмите <strong>Поделиться</strong> <Share className="inline h-4 w-4 text-blue-500" /> внизу Safari</>, step2: <>Прокрутите и нажмите <strong>«На экран «Домой»»</strong></>, step3: <>Нажмите <strong>Добавить</strong> в правом верхнем углу</> },
  zh: { title: "安装 StyleMe", subtitle: "将应用添加到主屏幕", step1: <>点击 Safari 底部的<strong>分享</strong> <Share className="inline h-4 w-4 text-blue-500" /></>, step2: <>滚动并点击<strong>「添加到主屏幕」</strong></>, step3: <>点击右上角的<strong>添加</strong></> },
  pt: { title: "Instalar StyleMe", subtitle: "Adicione o app à sua tela inicial", step1: <>Toque em <strong>Compartilhar</strong> <Share className="inline h-4 w-4 text-blue-500" /> na parte inferior do Safari</>, step2: <>Role e toque em <strong>"Adicionar à Tela de Início"</strong></>, step3: <>Toque em <strong>Adicionar</strong> no canto superior direito</> },
};

function IOSInstallModal({ onClose, lang }) {
  const s = iosInstallStrings[lang] || iosInstallStrings['fr'];
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-3xl w-full max-w-sm shadow-2xl relative mb-2 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
          <X className="h-5 w-5" />
        </button>
        <div className="overflow-y-auto p-6">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-3 shadow-md">
              <img src="/icons/icon-192.png" alt="StyleMe" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-bold">{s.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{s.subtitle}</p>
          </div>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>{s.step1}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>{s.step2}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>{s.step3}</span>
            </li>
          </ol>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroidButton, setShowAndroidButton] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { lang } = useLang();

  const ios = typeof navigator !== 'undefined' && isIOS();
  const standalone = typeof window !== 'undefined' && isInStandaloneMode();

  useEffect(() => {
    if (ios || standalone) return;
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidButton(true);
    };
    const installedHandler = () => setShowAndroidButton(false);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowAndroidButton(false);
    setDeferredPrompt(null);
  };

  if (standalone) return null;

  // Show iOS modal button for iOS devices (including iPadOS)
  if (ios) {
    return (
      <>
        <Button
          onClick={() => setShowIOSModal(true)}
          variant="outline"
          size="sm"
          className="gap-2 rounded-full"
        >
          <Download className="h-4 w-4" />
          <span>Installer</span>
        </Button>
        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} lang={lang || 'fr'} />}
      </>
    );
  }

  if (!showAndroidButton) return null;

  return (
    <Button onClick={handleAndroidInstall} variant="outline" size="sm" className="gap-2 rounded-full">
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Installer</span>
    </Button>
  );
}

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Header() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const navigate = useNavigate();
  const handleLogin = () => navigate('/login');

  return (
    <header className={`sticky top-0 z-40 px-5 md:px-10 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl' : 'bg-transparent'}`}>
      <div className="aurora-rise max-w-[1440px] mx-auto h-20 md:h-[104px] flex items-center justify-between gap-4 border-b border-white/[0.09]">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 md:h-[42px] md:w-[42px] rounded-[14px] overflow-hidden shrink-0 shadow-[0_0_30px_rgba(140,66,215,0.47)]">
            <img src="/icons/icon-192.png" alt="StyleMe" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-extrabold tracking-[-0.04em] text-foreground">StyleMe</span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-[42px] text-base text-[#c4bfd1]">
          {[
            { label: t('footerFeatures'), id: 'section-why' },
            { label: t('footerHowItWorks'), id: 'section-how' },
            { label: t('headerPricing'), id: 'section-pricing' },
            { label: t('footerFaq'), id: 'section-faq' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="hover:text-white transition-colors duration-200 min-h-0 font-semibold text-base"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <InstallPWAButton />
          <button onClick={handleLogin} className="login-aurora">
            {t('loginBtn')}
          </button>
        </div>
      </div>
    </header>
  );
}