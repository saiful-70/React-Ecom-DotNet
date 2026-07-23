import { Skeleton } from "@/components/shared/ui/skeleton";

export default function ComboLoading() {
	return (
		<main className="container mx-auto max-w-3xl px-3 sm:px-4 py-3 sm:py-6 pb-40 lg:pb-8">
			{/* Offer ribbon */}
			<Skeleton className="h-9 w-full rounded-lg mb-3" />

			{/* Hero */}
			<div className="grid gap-4 lg:grid-cols-2 lg:items-center">
				<Skeleton className="aspect-[4/3] w-full rounded-xl" />

				<div>
					<Skeleton className="h-7 w-3/4 mb-3" />
					<div className="space-y-2">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-4 w-full" />
						))}
					</div>
				</div>
			</div>

			{/* Trust row */}
			<div className="mt-4 grid grid-cols-4 gap-2 rounded-xl border border-border bg-card p-3">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="flex flex-col items-center gap-1">
						<Skeleton className="size-5 rounded-full" />
						<Skeleton className="h-3 w-3/4" />
					</div>
				))}
			</div>

			{/* Tier selector */}
			<div className="mt-5">
				<Skeleton className="h-5 w-32 mb-3" />
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-24 w-full rounded-xl" />
					))}
				</div>
			</div>

			{/* Total savings bar */}
			<Skeleton className="mt-3 h-10 w-full rounded-lg" />

			{/* Social proof */}
			<Skeleton className="mt-4 h-12 w-full rounded-xl" />

			{/* Sticky action bar */}
			<div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 lg:static lg:mt-5 lg:rounded-xl lg:border lg:p-4">
				<div className="container mx-auto max-w-3xl px-0 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
					<div className="flex items-center justify-between lg:block lg:shrink-0">
						<Skeleton className="h-10 w-24" />
					</div>
					<div className="flex-1">
						<div className="flex gap-2">
							<Skeleton className="h-12 flex-1 rounded-md" />
							<Skeleton className="h-12 flex-1 rounded-md" />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
