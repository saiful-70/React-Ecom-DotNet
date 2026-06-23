import type { CampaignConfig } from "./types";
import { demoCampaign } from "./demo";

const CAMPAIGNS: Record<string, CampaignConfig> = {
	[demoCampaign.slug]: demoCampaign,
};

export function getCampaign(slug: string): CampaignConfig | null {
	return CAMPAIGNS[slug] ?? null;
}

export function listCampaignSlugs(): string[] {
	return Object.keys(CAMPAIGNS);
}
