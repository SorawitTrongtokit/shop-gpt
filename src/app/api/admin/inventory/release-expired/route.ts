import { revalidatePath } from "next/cache";
import { releaseExpiredReservations } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";

export async function POST() {
  try {
    await requireAdmin();
    const result = await releaseExpiredReservations();
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/orders");
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "คืน stock ที่หมดเวลาไม่สำเร็จ";
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400;
    return Response.json({ error: message }, { status });
  }
}
