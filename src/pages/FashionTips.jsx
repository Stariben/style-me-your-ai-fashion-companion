import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StyleProfileSection from '@/components/tips/StyleProfileSection';
import { Sparkles, Palette, Shirt, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/i18n';
import { getFashionTips } from '@/lib/fashionTipsContent';

const ICONS = { palette: Palette, shirt: Shirt, sparkles: Sparkles, camera: Camera };
const IMAGES = {
  palette: 'https://media.base44.com/images/public/69c1a602ac220e242945c724/401d4371d_generated_image.png',
  shirt: 'https://media.base44.com/images/public/69c1a602ac220e242945c724/04a9c4683_generated_image.png',
  sparkles: 'https://media.base44.com/images/public/69c1a602ac220e242945c724/9578f5daa_generated_image.png',
  camera: 'https://media.base44.com/images/public/69c1a602ac220e242945c724/5ae581718_generated_image.png',
};

export default function FashionTips() {
  const { lang } = useLang();
  const content = getFashionTips(lang);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  return (
    <div className="min-h-screen pb-32 max-w-3xl mx-auto">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">{content.title}</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pb-8"
      >
        <p className="mb-8 p-5 glass bg-white/[0.04] border border-white/[0.12] rounded-2xl text-sm leading-relaxed">
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
                <img
                  src={IMAGES[section.icon]}
                  alt={section.heading}
                  loading="lazy"
                  className="w-full aspect-[16/9] object-cover rounded-2xl mb-3 border border-white/10"
                />
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="p-4 rounded-2xl glass bg-white/[0.04] border border-white/[0.12]"
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