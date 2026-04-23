import { Skeleton } from '@/components/ui/skeleton'

export default function FinanceiroLoading() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      {/* Header + navegação de mês */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>

      {/* Lista de vendas */}
      <div className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <Skeleton className="h-4 w-28" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-surface last:border-0">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
