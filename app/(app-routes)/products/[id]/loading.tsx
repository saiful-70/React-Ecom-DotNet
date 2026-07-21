import { Card, CardContent } from "@/components/shared/ui/card";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { HeaderSkeleton } from "@/components/shared/HeaderSkeleton";

export default function ProductDetailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSkeleton />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-[500px] w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-md" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-16" />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-12">
          <div className="flex gap-4 border-b mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

    </div>
  );
}
