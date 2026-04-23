export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 'h-8 w-8 text-base', text: 'text-xl', sub: 'text-[10px]' },
    md: { icon: 'h-10 w-10 text-lg', text: 'text-2xl', sub: 'text-xs' },
    lg: { icon: 'h-14 w-14 text-2xl', text: 'text-3xl', sub: 'text-sm' },
  }

  const s = sizes[size]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${s.icon} flex items-center justify-center rounded-xl bg-green`}>
        <span className={`font-display font-black text-void ${s.text}`}>C</span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className={`font-display font-bold text-white ${s.text}`}>
          Car<span className="text-green">vys</span>
        </span>
        <span className={`font-body uppercase tracking-widest text-slate ${s.sub}`}>
          Dealer Management
        </span>
      </div>
    </div>
  )
}
