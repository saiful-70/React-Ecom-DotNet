'use client';
import { Card, CardContent } from "@/components/shared/ui/card";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { HeaderSkeleton } from "@/components/shared/HeaderSkeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSkeleton />

      <main className="container mx-auto px-4 py-8">
        <Skeleton className="h-9 w-40 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />

                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

    </div>
  );
}
