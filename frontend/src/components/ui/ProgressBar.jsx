export default function ProgressBar({ value = 0, label }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  const barColor =
    safeValue > 75
      ? "from-emerald-500 to-emerald-600"
      : safeValue >= 50
        ? "from-amber-500 to-amber-600"
        : "from-rose-500 to-rose-600";

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{safeValue}%</span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Progress</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{safeValue}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${safeValue}%` }}
          aria-valuenow={safeValue}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  );
}

