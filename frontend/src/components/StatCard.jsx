import { motion } from "framer-motion";

function StatCard({ label, value, accent = "brand" }) {
  const accentMap = {
    brand: "from-brand-500/20 to-sky-300/20 text-brand-700 dark:text-brand-300",
    amber: "from-amber-300/20 to-orange-300/20 text-amber-700 dark:text-amber-300",
    rose: "from-rose-300/20 to-fuchsia-300/20 text-rose-700 dark:text-rose-300",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`gradient-ring rounded-[26px] bg-gradient-to-br p-5 ${accentMap[accent] || accentMap.brand}`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </motion.div>
  );
}

export default StatCard;
