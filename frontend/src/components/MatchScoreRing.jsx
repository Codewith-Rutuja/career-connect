import { motion } from "framer-motion";

function MatchScoreRing({ score = 0, size = 140 }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? "stroke-emerald-500" : score >= 45 ? "stroke-amber-500" : "stroke-rose-500";
  const textColor =
    score >= 75 ? "text-emerald-500" : score >= 45 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} className="fill-none stroke-slate-200 dark:stroke-slate-800" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          className={`fill-none ${color}`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className={`font-display text-3xl font-bold ${textColor}`}>{score}%</div>
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Match</div>
      </div>
    </div>
  );
}

export default MatchScoreRing;
