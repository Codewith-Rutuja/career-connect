import { motion } from "framer-motion";

function AuthHero({ title, subtitle, stats }) {
  return (
    <div className="glass-panel relative overflow-hidden p-8 md:p-10">
      <div className="pointer-events-none absolute inset-0 mesh-grid opacity-50" />
      <div className="relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
        >
          CareerConnect
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 max-w-lg font-display text-4xl font-bold leading-tight md:text-5xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300"
        >
          {subtitle}
        </motion.p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + index * 0.04 }}
              className="rounded-3xl border border-white/60 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/80"
            >
              <p className="font-display text-2xl font-bold">{item.value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthHero;
