import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const unavailable = () =>
  Response.json(
    { error: "Authentication is unavailable until DATABASE_URL is configured." },
    { status: 503 },
  );

const handlers = auth ? toNextJsHandler(auth) : null;

export const GET = handlers?.GET ?? unavailable;
export const POST = handlers?.POST ?? unavailable;
