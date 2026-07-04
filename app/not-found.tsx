import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import React from "react";
import { Button } from "@/components/shared/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "404 - Page Not Found",
	description: "Sorry, the page you are looking for was not found.",
};

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center bg-background px-4 py-6">
			<div className="max-w-md w-full px-8 text-center space-y-3">
				{/* Infographic */}
				<div className="flex justify-center">
					<svg
						className="h-48 w-48 text-destructive"
						fill="none"
						viewBox="0 0 200 200"
					>
						<circle
							cx="100"
							cy="100"
							r="90"
							stroke="currentColor"
							strokeWidth="8"
							className="fill-destructive/10"
						/>
						<rect
							x="60"
							y="60"
							width="80"
							height="80"
							rx="16"
							className="fill-background stroke-destructive"
							strokeWidth="6"
						/>
						<path
							d="M90 100h20"
							className="stroke-destructive"
							strokeWidth="6"
							strokeLinecap="round"
						/>
						<circle
							cx="100"
							cy="120"
							r="6"
							className="fill-destructive"
						/>
					</svg>
				</div>

				{/* Title & Description */}
				<div className="space-y-2 text-destructive">
					<h1 className="text-5xl font-bold ">404</h1>
					<p className="text-xl ">
						Sorry, the page you are looking for was not found.
					</p>
				</div>

				{/* Action Button */}
				<Button
					asChild
					className="w-full sm:w-auto"
					size="lg"
					variant="destructive"
				>
					<Link href="/">Go Home</Link>
				</Button>
			</div>
		</div>
	);
}
