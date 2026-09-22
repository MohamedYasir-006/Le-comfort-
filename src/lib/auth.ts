import bcrypt from "bcryptjs";
import crypto from "crypto";

const COOKIE = "lc_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me";
}

export function signSession(email: string): string {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `${email}.${exp}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [email, exp, sig] = raw.split(".");
    if (!email || !exp || !sig) return null;
    if (Number(exp) < Date.now()) return null;
    const expected = crypto.createHmac("sha256", secret()).update(`${email}.${exp}`).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return email;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE;

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@lecomfort.in";
  if (email.toLowerCase().trim() !== adminEmail.toLowerCase()) return false;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compare(password, hash);
  // Dev fallback: ADMIN_PASSWORD plaintext (set in .env.local, never commit)
  const plain = process.env.ADMIN_PASSWORD ?? "admin123";
  return password === plain;
}
