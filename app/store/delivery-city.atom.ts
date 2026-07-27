import { atomWithStorage } from "jotai/utils";

/** The customer's selected delivery zone, persisted across PDP -> checkout. */
export type SelectedDeliveryCity = {
	value: string;
	cityId: number;
	rate: number;
};

// Delivery-city atom with localStorage persistence (SSR-safe: mirrors
// cookie-consent.atom.ts's storage guards so this can be read on the server
// render without throwing, and silently no-ops if storage is unavailable).
export const deliveryCityAtom = atomWithStorage<SelectedDeliveryCity | null>(
	"debuggermind-delivery-city",
	null,
	{
		getItem: (key: string, initialValue: SelectedDeliveryCity | null) => {
			if (typeof window === "undefined") return initialValue;
			try {
				const value = localStorage.getItem(key);
				return value ? JSON.parse(value) : initialValue;
			} catch {
				return initialValue;
			}
		},
		setItem: (key: string, value: SelectedDeliveryCity | null) => {
			if (typeof window === "undefined") return;
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch {
				// Ignore localStorage errors
			}
		},
		removeItem: (key: string) => {
			if (typeof window === "undefined") return;
			try {
				localStorage.removeItem(key);
			} catch {
				// Ignore localStorage errors
			}
		},
	},
	{ getOnInit: true }
);
