import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { safeReturnTo } from "@/lib/authReturnTo";

// Localized strings per language
const LOGIN_STRINGS = {
  fr: { title: "Bon retour", subtitle: "Connectez-vous pour analyser vos looks", google: "Continuer avec Google", apple: "Continuer avec Apple", or: "ou", emailLabel: "Email", passLabel: "Mot de passe", forgot: "Mot de passe oublié ?", submit: "Se connecter", submitting: "Connexion...", noAccount: "Pas encore de compte ?", register: "Créer un compte", emailPlaceholder: "vous@exemple.com", passPlaceholder: "••••••••" },
  en: { title: "Welcome back", subtitle: "Log in to analyze your looks", google: "Continue with Google", apple: "Continue with Apple", or: "or", emailLabel: "Email", passLabel: "Password", forgot: "Forgot password?", submit: "Log in", submitting: "Logging in...", noAccount: "Don't have an account?", register: "Create one", emailPlaceholder: "you@example.com", passPlaceholder: "••••••••" },
  es: { title: "Bienvenido de nuevo", subtitle: "Inicia sesión para analizar tus looks", google: "Continuar con Google", apple: "Continuar con Apple", or: "o", emailLabel: "Email", passLabel: "Contraseña", forgot: "¿Olvidaste tu contraseña?", submit: "Iniciar sesión", submitting: "Iniciando...", noAccount: "¿No tienes cuenta?", register: "Crear una", emailPlaceholder: "tu@ejemplo.com", passPlaceholder: "••••••••" },
  ru: { title: "С возвращением", subtitle: "Войдите, чтобы анализировать образы", google: "Войти через Google", apple: "Войти через Apple", or: "или", emailLabel: "Email", passLabel: "Пароль", forgot: "Забыли пароль?", submit: "Войти", submitting: "Вход...", noAccount: "Нет аккаунта?", register: "Создать", emailPlaceholder: "вы@пример.com", passPlaceholder: "••••••••" },
  zh: { title: "欢迎回来", subtitle: "登录以分析您的造型", google: "通过 Google 继续", apple: "通过 Apple 继续", or: "或", emailLabel: "邮箱", passLabel: "密码", forgot: "忘记密码？", submit: "登录", submitting: "登录中...", noAccount: "没有账户？", register: "注册", emailPlaceholder: "您@示例.com", passPlaceholder: "••••••••" },
  pt: { title: "Bem-vindo de volta", subtitle: "Entre para analisar seus looks", google: "Continuar com Google", apple: "Continuar com Apple", or: "ou", emailLabel: "Email", passLabel: "Senha", forgot: "Esqueceu a senha?", submit: "Entrar", submitting: "Entrando...", noAccount: "Não tem conta?", register: "Criar conta", emailPlaceholder: "voce@exemplo.com", passPlaceholder: "••••••••" },
};

export default function Login() {
  const { lang } = useLang();
  const s = LOGIN_STRINGS[lang] || LOGIN_STRINGS.fr;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = safeReturnTo();
    } catch {
      setError("Email ou mot de passe invalide");
    } finally {
      setLoading(false);
    }
  };

  const dest = safeReturnTo();
  const handleGoogle = () => base44.auth.loginWithProvider("google", dest);
  const handleApple = () => base44.auth.loginWithProvider("apple", dest);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        {/* App icon + branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-primary/30 mb-4">
            <img src="/icons/icon-192.png" alt="StyleMe" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">StyleMe</h1>
          <p className="text-muted-foreground text-sm mt-1">{s.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
          {/* Social buttons */}
          <div className="space-y-3 mb-5">
            <Button variant="outline" className="w-full h-11 font-medium" onClick={handleGoogle}>
              <GoogleIcon className="w-5 h-5 mr-2" />
              {s.google}
            </Button>
            <Button variant="outline" className="w-full h-11 font-medium" onClick={handleApple}>
              <AppleIcon className="w-5 h-5 mr-2" />
              {s.apple}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground uppercase tracking-wide">{s.or}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">{s.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder={s.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">{s.passLabel}</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  {s.forgot}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={s.passPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {s.submitting}</>
              ) : (
                s.submit
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          {s.noAccount}{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            {s.register}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}