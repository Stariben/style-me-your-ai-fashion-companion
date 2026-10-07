import { motion } from 'framer-motion';

export default function AuroraSection({ id, title, subtitle, children }) {
  return (
    <section id={id} className="px-5 md:px-10">
      <div className="mx-auto max-w-[1440px] border-t border-white/[0.07] py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <h2 className="text-[1.9rem] font-extrabold leading-[1.12] tracking-[-0.04em] md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm text-muted-foreground md:text-lg">{subtitle}</p>
          )}
        </motion.div>
        {children}
      </div>
    </section>
  );
}