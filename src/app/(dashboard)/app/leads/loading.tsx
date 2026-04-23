import { Skeleton } from '@/components/ui/skeleton'

const COLS = 4

export default function LeadsLoading() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {Array.from({ length: COLS }).map((_, col) => (
          <div key={col} className="flex flex-col gap-2 min-w-[220px] w-[220px]">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-5 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 - (col % 2) }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-3">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                  <div className="flex gap-2 mt-1">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
