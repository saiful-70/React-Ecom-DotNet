import type { TemplateId } from "@/variants/types";
import type { Template } from "./types";
import { classicTemplate } from "./classic";

/**
 * Template registry. Add a paradigm by adding a folder under app/templates/
 * and one entry here; variants opt in via `template: "<id>"`.
 *
 * NOTE: never import this from app/variants/* or middleware — templates pull
 * in the whole component tree, and the variant layer must stay edge-safe.
 */
const TEMPLATES: Record<TemplateId, Template> = {
	classic: classicTemplate,
	// Placeholder until the bazar template lands (Task 12 replaces this).
	bazar: classicTemplate,
};

export function getTemplate(id: TemplateId): Template {
	return TEMPLATES[id] ?? TEMPLATES.classic;
}
