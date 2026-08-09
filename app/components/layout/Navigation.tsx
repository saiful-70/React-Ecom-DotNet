import { getAllCategories } from "@/components/shared/actions/categories";
import { NavigationClient } from "./NavigationClient";
import { Suspense } from "react";

export const Navigation = async () => {
	const response = await getAllCategories();

	if (!response.success || !response.data.categories) {
		return null;
	}

	// Only get parent categories (those with parent_id === null)
	const parentCategories = response.data.categories.filter(
		(cat) => cat.parent_id === null
	);

	if (parentCategories.length === 0) {
		return null;
	}

	// Get current pathname to determine which page we're on
	// const headersList = await headers();
	// const pathname = headersList.get("x-pathname") || "/";
	return (
		<nav
			className="hidden md:block bg-muted/30 border-b"
			aria-label="Product categories"
		>
			<div className="container mx-auto">
				<Suspense fallback={<div className="h-12" />}>
					<NavigationClient
						categories={parentCategories}
					/>
				</Suspense>
			</div>
		</nav>
	);
};
