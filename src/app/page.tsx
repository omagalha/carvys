export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-green)]">
            <span className="font-display text-xl font-black text-[var(--color-void)]">C</span>
          </div>
          <span className="font-display text-3xl font-bold text-white">
            Car<span className="text-[var(--color-green)]">vys</span>
          </span>
        </div>
        <p className="ml-[60px] font-body text-sm uppercase tracking-widest text-[var(--color-slate)]">
          Dealer Management
        </p>
      </div>
    </main>
  )
}
