import { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-provider";
import { I18nProvider } from "./i18n-provider";
import { CartProvider } from "@/contexts/CartContext";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster as Sonner } from "@/components/shared/ui/sonner";
import { AuthInitializer } from "./auth-initializer";
import { WishlistSyncProvider } from "./wishlist-sync-provider";
import { VariantProvider } from "./variant-provider";
import { Provider as JotaiProvider } from "jotai";
import type { VariantDescriptor } from "@/variants/types";

interface GlobalProviderProps extends PropsWithChildren {
	/** UI language resolved server-side (from cookie) so SSR/CSR match. */
	language?: string;
	/** Active variant (theme/branding/feature flags) resolved server-side. */
	variant: VariantDescriptor;
}

export default function GlobalProvider({
	children,
	language,
	variant,
}: GlobalProviderProps) {
	return (
		<VariantProvider variant={variant}>
			<JotaiProvider>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<I18nProvider language={language}>
						<CartProvider>
							<TooltipProvider>
								<AuthInitializer />
								<WishlistSyncProvider>
									{children}
								</WishlistSyncProvider>
								<Sonner />
							</TooltipProvider>
						</CartProvider>
					</I18nProvider>
				</ThemeProvider>
			</JotaiProvider>
		</VariantProvider>
	);
}
