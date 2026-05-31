function InputField({ label, helperText, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input
        className="w-full rounded-2xl border border-white/60 bg-white/75 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-brand-400"
        {...props}
      />
      {helperText ? <span className="block mt-2 text-xs text-slate-500 dark:text-slate-400">{helperText}</span> : null}
    </label>
  );
}

export default InputField;
