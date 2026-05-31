import { SearchX } from "lucide-react";

function EmptyState({ title, description, action }) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
        <SearchX size={28} />
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold">{title}</h3>
        <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default EmptyState;
