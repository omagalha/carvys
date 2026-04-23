import { Skeleton } from '@/components/ui/skeleton'

export default function VehiclesLoading() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-xl bg-deep border border-surface overflow-hidden">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center justify-between mt-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
