'use client';
import { Card, CardContent, CardHeader } from "@/components/shared/ui/card";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { HeaderSkeleton } from "@/components/shared/HeaderSkeleton";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSkeleton />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-4" />
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:w-64 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Special Offers */}
                <div>
                  <Skeleton className="h-5 w-32 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <Skeleton className="h-5 w-24 mb-3" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <Skeleton className="h-5 w-20 mb-3" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Skeleton className="h-5 w-28 mb-3" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

            {/* Pagination Skeleton */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
