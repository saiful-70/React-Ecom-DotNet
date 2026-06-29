import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Campaign not found",
	description: "This campaign does not exist or is no longer available.",
};

export default function CampaignNotFound() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-md space-y-4 text-center">
				<div className="flex justify-center">
					<div className="rounded-full bg-muted p-5">
						<SearchX className="h-12 w-12 text-muted-foreground" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
						ক্যাম্পেইনটি খুঁজে পাওয়া যায়নি
					</h1>
					<p className="text-muted-foreground">
						এই ক্যাম্পেইনটি নেই অথবা আর চালু নেই।
					</p>
					<p className="text-sm text-muted-foreground">
						This campaign does not exist or is no longer available.
					</p>
				</div>

				<Button asChild size="lg">
					<Link href="/">হোমে ফিরে যান</Link>
				</Button>
			</div>
		</div>
	);
}
