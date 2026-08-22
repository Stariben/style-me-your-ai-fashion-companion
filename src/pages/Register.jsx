import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import { toast } from "@/components/ui/use-toast";
import { useLang } from "@/lib/i18n";
import { safeReturnTo } from "@/lib/authReturnTo";

const REGISTER_STRINGS = {
  fr: {
    title: "Créer un compte", subtitle: "Inscrivez-vous pour commencer",
    google: "Continuer avec Google", apple: "Continuer avec Apple", or: "ou",
    emailLabel: "Email", emailPlaceholder: "vous@exemple.com",
    passLabel: "Mot de passe", passPlaceholder: "••••••••",
    confirmLabel: "Confirmer le mot de passe",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    submit: "Créer un compte", submitting: "Création en cours...",
    hasAccount: "Déjà un compte ?", login: "Se connecter",
    otpTitle: "Vérifiez votre email", otpSubtitle: (email) => `Nous avons envoyé un code à ${email}`,
    verify: "Vérifier", verifying: "Vérification...",
    noCode: "Vous n'avez pas reçu le code ?", resend: "Renvoyer",
  },
  en: {
    title: "Create your account", subtitle: "Sign up to get started",
    google: "Continue with Google", apple: "Continue with Apple", or: "or",
    emailLabel: "Email", emailPlaceholder: "you@example.com",
    passLabel: "Password", passPlaceholder: "••••••••",
    confirmLabel: "Confirm Password",
    passwordMismatch: "Passwords do not match",
    submit: "Create account", submitting: "Creating account...",
    hasAccount: "Already have an account?", login: "Log in",
    otpTitle: "Verify your email", otpSubtitle: (email) => `We sent a code to ${email}`,
    verify: "Verify", verifying: "Verifying...",
    noCode: "Didn't receive the code?", resend: "Resend",
  },
  es: {
    title: "Crear una cuenta", subtitle: "Regístrate para empezar",
    google: "Continuar con Google", apple: "Continuar con Apple", or: "o",
    emailLabel: "Email", emailPlaceholder: "tu@ejemplo.com",
    passLabel: "Contraseña", passPlaceholder: "••••••••",
    confirmLabel: "Confirmar contraseña",
    passwordMismatch: "Las contraseñas no coinciden",
    submit: "Crear cuenta", submitting: "Creando cuenta...",
    hasAccount: "¿Ya tienes cuenta?", login: "Iniciar sesión",
    otpTitle: "Verifica tu email", otpSubtitle: (email) => `Enviamos un código a ${email}`,
    verify: "Verificar", verifying: "Verificando...",
    noCode: "¿No recibiste el código?", resend: "Reenviar",
  },
  ru: {
    title: "Создать аккаунт", subtitle: "Зарегистрируйтесь, чтобы начать",
    google: "Войти через Google", apple: "Войти через Apple", or: "или",
    emailLabel: "Email", emailPlaceholder: "вы@пример.com",
    passLabel: "Пароль", passPlaceholder: "••••••••",
    confirmLabel: "Подтвердите пароль",
    passwordMismatch: "Пароли не совпадают",
    submit: "Создать аккаунт", submitting: "Создание...",
    hasAccount: "Уже есть аккаунт?", login: "Войти",
    otpTitle: "Подтвердите email", otpSubtitle: (email) => `Мы отправили код на ${email}`,
    verify: "Подтвердить", verifying: "Проверка...",
    noCode: "Не получили код?", resend: "Отправить снова",
  },
  zh: {
    title: "创建账户", subtitle: "注册以开始使用",
    google: "通过 Google 继续", apple: "通过 Apple 继续", or: "或",
    emailLabel: "邮箱", emailPlaceholder: "您@示例.com",
    passLabel: "密码", passPlaceholder: "••••••••",
    confirmLabel: "确认密码",
    passwordMismatch: "密码不匹配",
    submit: "创建账户", submitting: "创建中...",
    hasAccount: "已有账户？", login: "登录",
    otpTitle: "验证您的邮箱", otpSubtitle: (email) => `我们已向 ${email} 发送验证码`,
    verify: "验证", verifying: "验证中...",
    noCode: "没有收到验证码？", resend: "重新发送",
  },
  pt: {
    title: "Criar uma conta", subtitle: "Cadastre-se para começar",
    google: "Continuar com Google", apple: "Continuar com Apple", or: "ou",
    emailLabel: "Email", emailPlaceholder: "voce@exemplo.com",
    passLabel: "Senha", passPlaceholder: "••••••••",
    confirmLabel: "Confirmar senha",
    passwordMismatch: "As senhas não coincidem",
    submit: "Criar conta", submitting: "Criando conta...",
    hasAccount: "Já tem uma conta?", login: "Entrar",
    otpTitle: "Verifique seu email", otpSubtitle: (email) => `Enviamos um código para ${email}`,
    verify: "Verificar", verifying: "Verificando...",
    noCode: "Não recebeu o código?", resend: "Reenviar",
  },
};

export default function Register() {
  const { lang } = useLang();
  const s = REGISTER_STRINGS[lang] || REGISTER_STRINGS.fr;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(s.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch {
      setError("Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = safeReturnTo();
    } catch {
      setError("Code de vérification invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: s.resend });
    } catch {
      setError("Erreur lors du renvoi du code");
    }
  };

  if (showOtp) {
    return (
      <AuthLayout
        imgSrc="/icons/icon-192.png"
        title={s.otpTitle}
        subtitle={s.otpSubtitle(email)}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{s.verifying}</>
          ) : s.verify}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {s.noCode}{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            {s.resend}
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      imgSrc="/icons/icon-192.png"
      title={s.title}
      subtitle={s.subtitle}
      footer={
        <>
          {s.hasAccount}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {s.login}
          </Link>
        </>
      }
    >
      <div className="space-y-3 mb-6">
        <Button variant="outline" className="w-full h-12 text-sm font-medium" onClick={() => base44.auth.loginWithProvider("google", safeReturnTo())}>
          <GoogleIcon className="w-5 h-5 mr-2" />
          {s.google}
        </Button>
        <Button variant="outline" className="w-full h-12 text-sm font-medium" onClick={() => base44.auth.loginWithProvider("apple", safeReturnTo())}>
          <AppleIcon className="w-5 h-5 mr-2" />
          {s.apple}
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">{s.or}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{s.emailLabel}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" autoFocus placeholder={s.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{s.passLabel}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="password" type="password" autoComplete="new-password" placeholder={s.passPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{s.confirmLabel}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder={s.passPlaceholder} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{s.submitting}</>
          ) : s.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}