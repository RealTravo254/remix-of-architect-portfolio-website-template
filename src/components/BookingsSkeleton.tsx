import { Skeleton } from "@/components/ui/skeleton";

export const BookingsSkeleton = () => (
  <div className="space-y-10">
    {[...Array(2)].map((_, gi) => (
      <div key={gi} className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <div className="h-px bg-border flex-1" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-[24px] border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-14 rounded-full" />
                    <Skeleton className="h-4 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-5 w-16 ml-auto" />
                  <Skeleton className="h-4 w-4 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
