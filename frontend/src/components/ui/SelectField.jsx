function SelectField({ label, options = [], className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <select
        className="w-full rounded-2xl border border-white/60 bg-white/75 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-50 dark:focus:border-brand-400"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SelectField;
