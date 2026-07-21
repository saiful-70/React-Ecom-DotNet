import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/shared/ui/card";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { Separator } from "@/components/shared/ui/separator";
import { HeaderSkeleton } from "@/components/shared/HeaderSkeleton";

export default function OrderDetailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSkeleton />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <span>/</span>
          <Skeleton className="h-4 w-20" />
          <span>/</span>
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Back Button Skeleton */}
        <Skeleton className="mb-6 h-10 w-32" />

        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seller Section */}
                {[1, 2].map((seller) => (
                  <div key={seller}>
                    {seller > 1 && <Separator className="my-6" />}

                    {/* Seller Info */}
                    <div className="mb-4 flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="ml-auto h-9 w-16" />
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                      {[1, 2].map((item) => (
                        <div
                          key={item}
                          className="flex gap-4"
                        >
                          <Skeleton className="h-20 w-20 rounded-md" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Price Summary */}
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>

                <Separator />

                {/* Timeline */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-40" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

    </div>
  );
}
