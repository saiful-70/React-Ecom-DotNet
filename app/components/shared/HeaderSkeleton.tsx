import { Skeleton } from "@/components/shared/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <header className="border-b">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Skeleton */}
      <nav className="border-b">
        <div className="container mx-auto">
          <div className="flex items-center gap-6 h-12">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </nav>
    </>
  );
}
