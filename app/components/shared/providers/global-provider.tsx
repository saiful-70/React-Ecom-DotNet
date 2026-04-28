import { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-provider";
import { I18nProvider } from "./i18n-provider";
import { CartProvider } from "@/contexts/CartContext";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster as Sonner } from "@/components/shared/ui/sonner";
import { AuthInitializer } from "./auth-initializer";
import { WishlistSyncProvider } from "./wishlist-sync-provider";
import { Provider as JotaiProvider } from "jotai";

export default function GlobalProvider({ children }: PropsWithChildren) {
	return (
		<JotaiProvider>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<I18nProvider>
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
	);
}
