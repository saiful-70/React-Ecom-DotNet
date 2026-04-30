import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/analytics/meta-capi";

type IncomingEvent = {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  user?: {
    email?: string | null;
    phone?: string | null;
    externalId?: string | null;
  };
};

export async function POST(req: NextRequest) {
  let body: IncomingEvent;
  try {
    body = (await req.json()) as IncomingEvent;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.eventName || !body?.eventId) {
    return NextResponse.json(
      { success: false, error: "eventName and eventId are required" },
      { status: 400 }
    );
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
  const userAgent = req.headers.get("user-agent") || null;

  const fbp = req.cookies.get("_fbp")?.value || null;
  const fbc = req.cookies.get("_fbc")?.value || null;

  const result = await sendMetaCapiEvent({
    eventName: body.eventName,
    eventId: body.eventId,
    eventSourceUrl: body.eventSourceUrl,
    customData: body.customData,
    userData: {
      email: body.user?.email,
      phone: body.user?.phone,
      externalId: body.user?.externalId,
      ip,
      userAgent,
      fbp,
      fbc,
    },
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
