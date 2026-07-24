"use client";

import { useEffect } from "react";

interface GlobalErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

// This boundary replaces the root layout when an error escapes it, so no
// providers (i18n, theme, etc.) are mounted. Keep it self-contained: inline
// styles only, and both languages hardcoded (Bengali first, per the app's
// default locale, then English).
export default function GlobalError({ error, reset }: GlobalErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="bn">
			<body
				style={{
					margin: 0,
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "1rem",
					fontFamily:
						"system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
					backgroundColor: "#0a0a0a",
					color: "#fafafa",
				}}
			>
				<div
					style={{
						width: "100%",
						maxWidth: "28rem",
						textAlign: "center",
						padding: "2rem",
						borderRadius: "0.75rem",
						border: "1px solid #262626",
						backgroundColor: "#171717",
					}}
				>
					<div style={{ fontSize: "2.5rem", lineHeight: 1, marginBottom: "1rem" }}>
						⚠️
					</div>
					<p style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 0.25rem" }}>
						কিছু একটা সমস্যা হয়েছে
					</p>
					<p style={{ fontSize: "0.95rem", color: "#a3a3a3", margin: "0 0 1.5rem" }}>
						Something went wrong
					</p>
					<button
						onClick={reset}
						style={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "0.5rem",
							width: "100%",
							padding: "0.75rem 1.5rem",
							borderRadius: "0.5rem",
							border: "none",
							backgroundColor: "#fafafa",
							color: "#0a0a0a",
							fontSize: "1rem",
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						আবার চেষ্টা করুন / Try again
					</button>
				</div>
			</body>
		</html>
	);
}
