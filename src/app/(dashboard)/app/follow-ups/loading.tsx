import { Skeleton } from '@/components/ui/skeleton'

export default function FollowUpsLoading() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Seções */}
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: s === 0 ? 2 : 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-deep border border-surface p-4">
                <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
