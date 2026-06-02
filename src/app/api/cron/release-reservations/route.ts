import { releaseExpiredReservations } from "@/lib/orders";

export async function GET(request: Request) {
  const configured = process.env.CRON_SECRET;
  const token = request.headers.get("authorization");
  if (!configured || token !== `Bearer ${configured}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return Response.json(await releaseExpiredReservations());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    return Response.json({ error: message }, { status: 503 });
  }
}
