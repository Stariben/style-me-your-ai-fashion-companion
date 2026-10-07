import { Link } from 'react-router-dom';

import { useLang } from '@/lib/i18n';

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const LINK = 'text-left text-muted-foreground hover:text-foreground transition-colors min-h-0';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="px-5 pb-10 md:px-10">
      <div className="mx-auto mt-14 max-w-[1440px] border-t border-white/[0.09] pt-12">
        <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 overflow-hidden rounded-[11px] shadow-[0_0_24px_rgba(140,66,215,0.47)]">
                <img src="/icons/icon-192.png" alt="StyleMe" className="h-full w-full object-cover" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">StyleMe</span>
            </div>
            <p className="max-w-[220px] text-sm leading-relaxed text-muted-foreground">
              {t('whySubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-sm md:gap-14">
            <div className="flex flex-col gap-2">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-foreground/40">{t('footerProduct')}</p>
              <button onClick={() => scrollToSection('section-why')} className={LINK}>{t('footerFeatures')}</button>
              <button onClick={() => scrollToSection('section-how')} className={LINK}>{t('footerHowItWorks')}</button>
              <button onClick={() => scrollToSection('section-pricing')} className={LINK}>{t('footerPricing')}</button>
              <button onClick={() => scrollToSection('section-faq')} className={LINK}>{t('footerFaq')}</button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-foreground/40">{t('footerSupport')}</p>
              <Link to="/about" className={LINK}>{t('about')}</Link>
              <Link to="/contact" className={LINK}>{t('contactUs')}</Link>
              <Link to="/privacy" className={LINK}>{t('privacyPolicy')}</Link>
              <Link to="/terms" className={LINK}>{t('termsTitle')}</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs text-foreground/40">
          <p>© {new Date().getFullYear()} StyleMe. {t('footerRights')}</p>
        </div>
      </div>
    </footer>
  );
}