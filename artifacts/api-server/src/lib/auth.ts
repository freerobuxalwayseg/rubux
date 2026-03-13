import { createHash, randomBytes } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const testHash = createHash("sha256").update(password + salt).digest("hex");
  return testHash === hash;
}

export function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${randomBytes(16).toString("hex")}`;
  return Buffer.from(payload).toString("base64url");
}

export function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length >= 3) {
      return parseInt(parts[0], 10);
    }
    return null;
  } catch {
    return null;
  }
}

export function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}
