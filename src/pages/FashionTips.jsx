import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StyleProfileSection from '@/components/tips/StyleProfileSection';
import { ChevronLeft, Sparkles, Palette, Shirt, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/i18n';
import { getFashionTips } from '@/lib/fashionTipsContent';

const ICONS = { palette: Palette, shirt: Shirt, sparkles: Sparkles, camera: Camera };

export default function FashionTips() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const content = getFashionTips(lang);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center gap-3 px-5 py-3">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">{content.title}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-8 max-w-2xl mx-auto"
      >
        <p className="mb-8 p-5 bg-primary/5 border border-primary/20 rounded-2xl text-sm leading-relaxed">
          {content.intro}
        </p>

        {isAuthenticated && <StyleProfileSection copy={content.profile} />}

        <div className="space-y-8 mb-8">
          {content.sections.map((section) => {
            const Icon = ICONS[section.icon];
            return (
              <section key={section.heading}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold">{section.heading}</h2>
                </div>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="p-4 rounded-2xl border border-border bg-card"
                    >
                      <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <Link to="/analyze" className="btn-aurora w-full justify-center !text-base !py-4">
          <Sparkles className="h-5 w-5" />
          {content.cta}
        </Link>
      </motion.div>
    </div>
  );
}