import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserCircle, LogOut, Clock, Shield, Mail, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';

export default function AccountSettings() {
  const { user } = useAuth();
  const { t } = useLang();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [sendingContact, setSendingContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await base44.functions.invoke('sendContactEmail', { type: 'delete', subject: '', message: '' });
      setDeleted(true);
    } catch (err) {

      alert(t('contactError') || 'Erreur, réessayez plus tard');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => base44.auth.logout('/');

  const handleContactSubmit = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) return;
    setSendingContact(true);
    try {
      await base44.functions.invoke('sendContactEmail', {
        type: 'contact',
        subject: contactForm.subject,
        message: contactForm.message,
      });
      setContactForm({ subject: '', message: '' });
      setContactSent(true);
      setTimeout(() => { setContactSent(false); setShowContactForm(false); }, 2500);
    } catch (err) {

      alert(t('contactError') || 'Erreur, réessayez plus tard');
    } finally {
      setSendingContact(false);
    }
  };

  if (deleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center gap-5">
        <div className="h-20 w-20 rounded-3xl bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t('deletionRequestedTitle')}</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t('deletionRequestedMsg')}</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={handleLogout}>{t('logOut')}</Button>
      </div>
    );
  }

  const menuItems = [
    { icon: Shield, label: t('privacyPolicy'), onClick: () => navigate('/privacy') },
    { icon: Clock, label: t('analysisHistory'), onClick: () => navigate('/history') },
    { icon: Mail, label: t('contactUs'), onClick: () => setShowContactForm(true) },
    { icon: LogOut, label: t('logOut'), onClick: handleLogout },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-20 pb-6">
        <h1 className="text-2xl font-black tracking-tight">{t('accountSettings')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('manageAccount')}</p>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mb-5"
      >
        <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl border border-primary/15 p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate">{user?.full_name || 'User'}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
        </div>
      </motion.div>

      {/* Menu items */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-5 bg-card rounded-2xl border border-border overflow-hidden"
      >
        {menuItems.map(({ icon: MenuIcon, label, onClick }, i) => (
          <button
            key={i}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors ${i < menuItems.length - 1 ? 'border-b border-border/50' : ''}`}
          >
            <MenuIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </button>
        ))}
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-3"
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center gap-3 px-5 py-4 text-left rounded-2xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4 text-destructive shrink-0" />
              <span className="flex-1 text-sm font-medium text-destructive">{t('deleteAccount')}</span>
              <ChevronRight className="h-4 w-4 text-destructive/40" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteAccountTitle')}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{t('deleteAccountDesc')}</p>
                  <p className="font-medium text-foreground">{t('deleteAccount30days')}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? t('deleting') : t('sendDeletionRequest')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Contact form sheet */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {contactSent ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-bold text-lg">{t('contactMessageSent')}</p>
                <p className="text-sm text-muted-foreground">{t('contactMessageSentDesc')}</p>
              </div>
            ) : (
              <>
                <div className="sticky top-0 bg-background flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
                  <h2 className="font-bold text-lg">{t('contactUs')}</h2>
                  <button onClick={() => setShowContactForm(false)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4 pb-8">
                  <Input
                    placeholder={t('contactSubjectPlaceholder')}
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="rounded-xl"
                  />
                  <Textarea
                    placeholder={t('contactMessagePlaceholder')}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="rounded-xl h-32"
                  />
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowContactForm(false)}>
                      {t('cancel')}
                    </Button>
                    <Button
                      className="flex-1 rounded-xl"
                      onClick={handleContactSubmit}
                      disabled={sendingContact || !contactForm.subject.trim() || !contactForm.message.trim()}
                    >
                      {sendingContact ? t('contactSending') : t('contactSend')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}