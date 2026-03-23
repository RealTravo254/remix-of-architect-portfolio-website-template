import { Skeleton } from "@/components/ui/skeleton";

export const SavedItemsSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="flex-1 flex items-center gap-4 bg-card p-3 rounded-[24px] border border-border">
          <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>
      </div>
    ))}
  </div>
);
