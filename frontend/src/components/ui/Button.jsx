import { motion } from "framer-motion";

function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  as: Component = "button",
  ...props
}) {
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 dark:bg-brand-500 dark:hover:bg-brand-400",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
    ghost:
      "bg-transparent text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700",
    info:
      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  return (
    <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1.5 }}>
      <Component
        className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold shadow-soft transition disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />}
        {children}
      </Component>
    </motion.div>
  );
}

export default Button;
