import { createHmac, timingSafeEqual } from "node:crypto";

const toBuffer = (value: Uint8Array | string): Buffer =>
  typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);

export const createHmacSignature = (
  secret: string,
  payload: Uint8Array | string
): Buffer => createHmac("sha256", secret).update(toBuffer(payload)).digest();

export const verifyHmacSignature = (
  secret: string,
  payload: Uint8Array | string,
  signature: Uint8Array | string
): boolean => {
  const expectedSignature = createHmacSignature(secret, payload);
  const providedSignature =
    typeof signature === "string"
      ? Buffer.from(signature, "hex")
      : Buffer.from(signature);

  try {
    return timingSafeEqual(expectedSignature, providedSignature);
  } catch {
    return false;
  }
};
