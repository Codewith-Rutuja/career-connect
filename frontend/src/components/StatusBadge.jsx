const statusStyles = {
  applied: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
  under_review: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  shortlisted: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
  interview_scheduled: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200",
  offer_sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  selected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  rejected: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
  withdrawn: "bg-slate-200 text-slate-900 dark:bg-slate-600/20 dark:text-slate-100",
  hired: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

function StatusBadge({ status, className = "" }) {
  const label = status?.replace(/_/g, " ") || "Unknown";
  const styles = statusStyles[status] || "bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-100";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles} ${className}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
