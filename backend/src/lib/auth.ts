import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";
const REFRESH_JWT_SECRET =
  process.env.REFRESH_JWT_SECRET || "fallback-refresh-secret-for-dev";

/**
 * Hashes a user password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compares a plain-text password with a hash.
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a signed JWT Access Token containing userId and email.
 * Valid for 15 minutes.
 */
export function generateToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

/**
 * Generates a signed JWT Refresh Token containing userId and email.
 * Valid for 7 days.
 */
export function generateRefreshToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(payload, REFRESH_JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies a JWT Access Token and returns the decoded payload, or null if invalid.
 */
export function verifyToken(
  token: string,
): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}

/**
 * Verifies a JWT Refresh Token and returns the decoded payload, or null if invalid.
 */
export function verifyRefreshToken(
  token: string,
): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, REFRESH_JWT_SECRET) as {
      userId: string;
      email: string;
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extracts and verifies JWT from the Request Authorization header,
 * returning the userId if successful.
 */
export async function getUserIdFromRequest(
  req: Request,
): Promise<string | null> {
  try {
    // 1. Check if user ID was injected by the middleware
    const headerUserId = req.headers.get('x-user-id');
    if (headerUserId) {
      return headerUserId;
    }

    // 2. Fallback verification (e.g., direct route calls or tests)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return decoded ? decoded.userId : null;
  } catch (error) {
    return null;
  }
}
export interface AuthenticatedRequest extends Request {
  userId: string;
}
