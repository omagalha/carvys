interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        className={[
          'h-12 rounded-lg bg-surface border px-4',
          'font-body text-sm text-white placeholder:text-slate/40',
          'outline-none transition-colors duration-150',
          error
            ? 'border-alert focus:border-alert'
            : 'border-surface focus:border-green/60',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <span className="font-body text-xs text-alert">{error}</span>
      )}
    </div>
  )
}
