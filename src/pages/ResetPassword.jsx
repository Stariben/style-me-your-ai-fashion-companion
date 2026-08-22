import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useLang } from "@/lib/i18n";

const STRINGS = {
  fr: { title: "Nouveau mot de passe", subtitle: "Entrez votre nouveau mot de passe", newPass: "Nouveau mot de passe", confirmPass: "Confirmer le mot de passe", mismatch: "Les mots de passe ne correspondent pas", submit: "Réinitialiser", submitting: "Réinitialisation...", invalidTitle: "Lien invalide", invalidSubtitle: "Ce lien de réinitialisation est manquant ou invalide", invalidText: "Le lien que vous avez utilisé semble incomplet. Demandez un nouvel email de réinitialisation.", requestNew: "Demander un nouveau lien" },
  en: { title: "New password", subtitle: "Enter your new password below", newPass: "New Password", confirmPass: "Confirm Password", mismatch: "Passwords do not match", submit: "Reset password", submitting: "Resetting...", invalidTitle: "Invalid reset link", invalidSubtitle: "This password reset link is missing or invalid", invalidText: "The link you used appears to be incomplete. Please request a new password reset email.", requestNew: "Request a new link" },
  es: { title: "Nueva contraseña", subtitle: "Ingresa tu nueva contraseña a continuación", newPass: "Nueva contraseña", confirmPass: "Confirmar contraseña", mismatch: "Las contraseñas no coinciden", submit: "Restablecer contraseña", submitting: "Restableciendo...", invalidTitle: "Enlace inválido", invalidSubtitle: "Este enlace de restablecimiento es inválido o falta", invalidText: "El enlace que usaste parece estar incompleto. Solicita un nuevo email de restablecimiento.", requestNew: "Solicitar nuevo enlace" },
  ru: { title: "Новый пароль", subtitle: "Введите новый пароль ниже", newPass: "Новый пароль", confirmPass: "Подтвердите пароль", mismatch: "Пароли не совпадают", submit: "Сбросить пароль", submitting: "Сброс...", invalidTitle: "Недействительная ссылка", invalidSubtitle: "Эта ссылка для сброса пароля отсутствует или недействительна", invalidText: "Ссылка, которую вы использовали, кажется неполной. Запросите новое письмо для сброса пароля.", requestNew: "Запросить новую ссылку" },
  zh: { title: "新密码", subtitle: "在下方输入您的新密码", newPass: "新密码", confirmPass: "确认密码", mismatch: "密码不匹配", submit: "重置密码", submitting: "重置中...", invalidTitle: "无效的重置链接", invalidSubtitle: "此密码重置链接缺失或无效", invalidText: "您使用的链接似乎不完整，请申请新的密码重置邮件。", requestNew: "申请新链接" },
  pt: { title: "Nova senha", subtitle: "Digite sua nova senha abaixo", newPass: "Nova senha", confirmPass: "Confirmar senha", mismatch: "As senhas não coincidem", submit: "Redefinir senha", submitting: "Redefinindo...", invalidTitle: "Link inválido", invalidSubtitle: "Este link de redefinição de senha está ausente ou é inválido", invalidText: "O link que você usou parece estar incompleto. Solicite um novo email de redefinição de senha.", requestNew: "Solicitar novo link" },
};

export default function ResetPassword() {
  const { lang } = useLang();
  const s = STRINGS[lang] || STRINGS.fr;

  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError(s.mismatch);
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch {
      setError("Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title={s.invalidTitle}
        subtitle={s.invalidSubtitle}
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            {s.requestNew}
          </Link>
        }
      >
        <p className="text-sm text-foreground text-center">{s.invalidText}</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Lock} title={s.title} subtitle={s.subtitle}>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{s.newPass}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="new-password" autoFocus placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{s.confirmPass}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
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