import { Toaster } from "@/components/ui/toaster"
import { AnimatePresence } from 'framer-motion';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { NavigationProvider } from '@/lib/NavigationContext';
import PageNotFound from './lib/PageNotFound';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import AccountSettings from './pages/AccountSettings';
import History from './pages/History.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import Contact from './pages/Contact';
import FashionTips from './pages/FashionTips';
import TermsAndConditions from './pages/TermsAndConditions';
import BottomNav from './components/BottomNav';
import PageTransition from './components/PageTransition';
import MobileHeader from './components/MobileHeader';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { LangProvider } from '@/lib/i18n';
import LanguagePicker from '@/components/LanguagePicker';
import { CameraProvider } from '@/lib/CameraContext';
import TermsConsentModal from '@/components/TermsConsentModal';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings, authError, isAuthenticated, user } = useAuth();

  // Only block on public settings load, not auth (so public pages render immediately)
  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Allow public access — individual pages handle auth requirements
    }
  }

  // Render the main app
  return (
    <NavigationProvider>
      <div className="aurora min-h-screen overflow-x-clip">
      <LanguagePicker />
      {isAuthenticated && user && window.location.pathname !== '/' && <TermsConsentModal userId={user.id} />}
      <AnimatePresence mode="wait" initial={false}>
        <Routes key={window.location.pathname}>
          {/* Auth routes — public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Home — public landing page */}
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />

          {/* Public support pages */}
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/fashion-tips" element={<PageTransition><MobileHeader /><FashionTips /><BottomNav /></PageTransition>} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route path="/analyze" element={<PageTransition><MobileHeader /><Analyze /><BottomNav /></PageTransition>} />
            <Route path="/account" element={<PageTransition><MobileHeader /><AccountSettings /><BottomNav /></PageTransition>} />
            <Route path="/history" element={<PageTransition><MobileHeader /><History /><BottomNav /></PageTransition>} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AnimatePresence>
      </div>
    </NavigationProvider>
  );
};


function App() {

  return (
    <LangProvider>
      <CameraProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
      </CameraProvider>
    </LangProvider>
  )
}

export default App