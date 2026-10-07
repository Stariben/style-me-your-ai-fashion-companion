import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n';

const MESSAGES = {
  fr: ['Analyse de votre look...', 'Vérification des couleurs...', 'Évaluation du style...', 'Préparation des résultats...'],
  en: ['Analyzing your look...', 'Checking color harmony...', 'Evaluating style match...', 'Preparing your results...'],
  es: ['Analizando tu look...', 'Verificando colores...', 'Evaluando el estilo...', 'Preparando tus resultados...'],
  ru: ['Анализ вашего образа...', 'Проверка цветовой гармонии...', 'Оценка стиля...', 'Подготовка результатов...'],
  zh: ['分析你的造型...', '检查色彩协调...', '评估风格匹配...', '准备你的结果...'],
  pt: ['Analisando seu look...', 'Verificando harmonia de cores...', 'Avaliando o estilo...', 'Preparando seus resultados...'],
};

export default function AnalyzingOverlay() {
  const { lang } = useLang();
  const messages = MESSAGES[lang] || MESSAGES.fr;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/85 backdrop-blur-xl flex flex-col items-center justify-center gap-6 px-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="h-16 w-16 rounded-3xl bg-white/[0.06] border border-white/15 shadow-[0_0_40px_rgba(140,66,215,0.5)] flex items-center justify-center"
      >
        <Sparkles className="h-8 w-8 text-primary" />
      </motion.div>

      <div className="relative h-6 w-64 text-center">
        {messages.map((msg, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
            transition={{
              duration: 3,
              delay: i * 3,
              repeat: Infinity,
              repeatDelay: (messages.length - 1) * 3,
            }}
            className="text-sm font-medium text-muted-foreground absolute inset-x-0"
          >
            {msg}
          </motion.p>
        ))}
      </div>

      <motion.div
        className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-4"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-aurora-pink rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 12, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  );
}