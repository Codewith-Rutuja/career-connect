function LoadingCard() {
  return (
    <div className="glass-panel animate-pulse p-6">
      <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-7 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 flex gap-2">
        <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default LoadingCard;
