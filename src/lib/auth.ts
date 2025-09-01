import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  officerName: string;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token from request cookies
 */
export async function verifyToken(req: NextRequest): Promise<DecodedToken | null> {
  try {
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Verify JWT token from string
 */
export async function verifyTokenString(token: string): Promise<DecodedToken | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<DecodedToken, 'iat' | 'exp'>): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "24h" });
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user has required permission
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Get user from request (middleware helper)
 */
export async function getUserFromRequest(req: NextRequest): Promise<DecodedToken | null> {
  return await verifyToken(req);
}

/**
 * Require authentication middleware
 */
export async function requireAuth(req: NextRequest): Promise<DecodedToken> {
  const user = await verifyToken(req);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require role middleware
 */
export async function requireRole(req: NextRequest, roles: string[]): Promise<DecodedToken> {
  const user = await requireAuth(req);
  if (!hasRole(user.role, roles)) {
    throw new Error("Insufficient permissions");
  }
  return user;
} 