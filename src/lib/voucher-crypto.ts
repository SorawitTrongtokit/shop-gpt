import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

function getKey() {
  const configured = process.env.VOUCHER_ENCRYPTION_KEY;
  if (!configured) {
    throw new Error("VOUCHER_ENCRYPTION_KEY is required.");
  }

  const hex = Buffer.from(configured, "hex");
  if (/^[a-f0-9]{64}$/i.test(configured) && hex.length === 32) {
    return hex;
  }

  const base64 = Buffer.from(configured, "base64");
  if (base64.length === 32) {
    return base64;
  }

  throw new Error("VOUCHER_ENCRYPTION_KEY must be 32 bytes as hex or base64.");
}

export function normalizeVoucherCode(code: string) {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}

export function hashVoucherCode(code: string) {
  return createHash("sha256").update(normalizeVoucherCode(code)).digest("hex");
}

export function encryptVoucherCode(code: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(normalizeVoucherCode(code), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((item) => item.toString("base64url")).join(".");
}

export function decryptVoucherCode(payload: string) {
  const [iv, tag, encrypted] = payload
    .split(".")
    .map((item) => Buffer.from(item, "base64url"));
  if (!iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted voucher.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}

export function maskVoucherCode(code: string) {
  const normalized = normalizeVoucherCode(code);
  const suffix = normalized.slice(-4);
  return `XXXX-XXXX-${suffix.padStart(4, "X")}`;
}
