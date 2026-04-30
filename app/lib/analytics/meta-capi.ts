import "server-only";
import crypto from "crypto";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;
const GRAPH_API_VERSION = process.env.META_CAPI_GRAPH_VERSION || "v19.0";

export type MetaCapiUserData = {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type MetaCapiEvent = {
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  userData: MetaCapiUserData;
};

const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, "");

const buildUserData = (u: MetaCapiUserData) => {
  const data: Record<string, unknown> = {};
  if (u.email) data.em = [sha256(normalizeEmail(u.email))];
  if (u.phone) data.ph = [sha256(normalizePhone(u.phone))];
  if (u.externalId) data.external_id = [sha256(u.externalId)];
  if (u.ip) data.client_ip_address = u.ip;
  if (u.userAgent) data.client_user_agent = u.userAgent;
  if (u.fbp) data.fbp = u.fbp;
  if (u.fbc) data.fbc = u.fbc;
  return data;
};

export async function sendMetaCapiEvent(event: MetaCapiEvent): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return { success: false, error: "Meta CAPI not configured" };
  }

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: event.eventSourceUrl,
        user_data: buildUserData(event.userData),
        custom_data: event.customData ?? {},
      },
    ],
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Meta CAPI ${res.status}: ${body}` };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown CAPI error",
    };
  }
}
