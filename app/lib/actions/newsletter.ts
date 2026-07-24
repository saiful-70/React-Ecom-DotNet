"use server";

import { ApiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-route";
import { SubscribeNewsletterSchema } from "@/lib/models/newsletter.model";
import type { SubscribeNewsletterResponse } from "@/lib/models/newsletter.model";

export async function subscribeNewsletter(email: string) {
  try {
    const parsed = SubscribeNewsletterSchema.safeParse({ email });
    if (!parsed.success) {
      return {
        success: false,
        message: "Please provide a valid email address.",
        data: null,
      };
    }

    const response = await ApiClient.create(API_ROUTES.NEWSLETTER.SUBSCRIBE)
      .withMethod("POST")
      .withBody(parsed.data)
      .execute<SubscribeNewsletterResponse>();

    return response;
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      message: "An error occurred while subscribing. Please try again.",
      data: null,
    };
  }
}
