import { SignJWT, jwtVerify } from "jose"
import type { SessionPayload } from "~/types"

const ALG = "HS256"
const EXPIRY = "7d"

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(key(secret))
}

export async function verifySession(token: string, secret: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, key(secret), { algorithms: [ALG] })
  if (typeof payload.user_id !== "string") {
    throw new Error("invalid session payload")
  }
  const telegram_id = typeof payload.telegram_id === "number" ? payload.telegram_id : undefined
  return { user_id: payload.user_id, telegram_id }
}
