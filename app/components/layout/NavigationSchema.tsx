import { getAllCategories } from "@/components/shared/actions/categories";
import { API_CONFIG } from "@/lib/config/api.config";
import { renderStructuredData } from "@/lib/utils/seo.utils";

export const NavigationSchema = async () => {
	const response = await getAllCategories();

	if (!response.success || !response.data.categories) {
		return null;
	}

	const parentCategories = response.data.categories.filter(
		(cat) => cat.parent_id === null
	);

	if (parentCategories.length === 0) return null;

	const baseUrl = API_CONFIG.SITE_URL

	// Create breadcrumb list for each category
	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: parentCategories.flatMap((category, index) => {
			const items = [
				{
					"@type": "ListItem",
					position: index + 1,
					name: category.name,
					item: `${baseUrl}/products?category=${encodeURIComponent(category.slug)}`,
				},
			];

			// Add child categories
			if (category.child_category && category.child_category.length > 0) {
				category.child_category.forEach((child, childIndex) => {
					items.push({
						"@type": "ListItem",
						position: index + 1 + childIndex + 0.1, // Nested position
						name: `${category.name} > ${child.name}`,
						item: `${baseUrl}/products?category=${encodeURIComponent(child.slug)}`,
					});
				});
			}

			return items;
		}),
	};

	// Create site navigation element
	const siteNavigationSchema = {
		"@context": "https://schema.org",
		"@type": "SiteNavigationElement",
		name: "Product Categories",
		url: parentCategories.map((category) => ({
			"@type": "WebPage",
			name: category.name,
			url: `${baseUrl}/products?category=${encodeURIComponent(category.slug)}`,
			description: category.description,
		})),
	};

	return (
		<>
			{renderStructuredData(breadcrumbSchema)}
			{renderStructuredData(siteNavigationSchema)}
		</>
	);
};
