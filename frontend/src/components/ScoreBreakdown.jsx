import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function ScoreBreakdown({ breakdown, isExpanded = false }) {
  const [expanded, setExpanded] = useState(isExpanded);

  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  // Calculate average
  const average = breakdown.length
    ? Math.round(breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length)
    : 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="font-semibold text-slate-900 dark:text-white">Score Breakdown</span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Average: {average}%
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-slate-500" />
        ) : (
          <ChevronDown size={20} className="text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-3">
          {breakdown.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.score}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
