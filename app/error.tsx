"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
	const { t } = useTranslation();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-12">
			<Card className="w-full max-w-md">
				<CardContent className="flex flex-col items-center gap-4 p-8 text-center">
					<div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="size-8 text-destructive" />
					</div>
					<h1 className="text-xl font-bold">{t("common.error")}</h1>
					<Button onClick={reset} className="w-full sm:w-auto" size="lg">
						<RotateCcw className="size-4" />
						{t("common.retry")}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
