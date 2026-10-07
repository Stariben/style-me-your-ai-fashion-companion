import { base44 } from '@/api/base44Client';

import HeroSection from '../components/HeroSection';
import WhySection from '../components/WhySection';
import HowItWorksSection from '../components/HowItWorksSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import FAQSection from '../components/FAQSection';
import PricingSection from '../components/PricingSection';
import Header from '../components/Header';
import TestimonialsSection from '../components/TestimonialsSection';

export default function Home() {
  const handleStartAnalysis = async () => {
    const authed = await base44.auth.isAuthenticated();
    if (authed) {
      window.location.href = '/analyze';
    } else {
      base44.auth.redirectToLogin('/analyze');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection onStartAnalysis={handleStartAnalysis} />
      <WhySection />
      <HowItWorksSection onStartAnalysis={handleStartAnalysis} />
      <TestimonialsSection />
      <PricingSection onStartAnalysis={handleStartAnalysis} />
      <FAQSection />
      <CTASection onStartAnalysis={handleStartAnalysis} />
      <Footer />
    </div>
  );
}