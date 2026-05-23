import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Public endpoints that do not require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token',
  '/api/health',
  '/api/swagger',
];

/**
 * Helper to decode base64url and verify JWT HMAC-SHA256 signature using Edge-safe Web Crypto API.
 */
async function verifyJWT(token: string, secret: string): Promise<{ userId: string; email: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    // Import the secret key
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode signature from base64url
    const base64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const signature = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      signature[i] = binary.charCodeAt(i);
    }

    // Verify signature
    const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!isValid) return null;

    // Decode and parse payload
    const decodedPayload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.error('JWT Edge verification failed:', error);
    return null;
  }
}

/**
 * Attaches standard CORS headers to a NextResponse.
 */
function corsResponse(response: NextResponse, origin: string) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return corsResponse(new NextResponse(null, { status: 204 }), origin);
  }

  const { pathname } = request.nextUrl;

  // 1. Skip auth check for public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return corsResponse(NextResponse.next(), origin);
  }

  // 2. Extract Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const errorResponse = NextResponse.json(
      { error: 'Unauthorized: Missing or malformed authorization header' },
      { status: 401 }
    );
    return corsResponse(errorResponse, origin);
  }

  const token = authHeader.split(' ')[1];

  // 3. Verify access token
  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload) {
    const errorResponse = NextResponse.json(
      { error: 'Unauthorized: Invalid or expired token' },
      { status: 401 }
    );
    return corsResponse(errorResponse, origin);
  }

  // 4. Inject x-user-id and x-user-email headers for Route Handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-email', payload.email);

  const successResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return corsResponse(successResponse, origin);
}

// Apply this middleware only to /api/:path* routes
export const config = {
  matcher: '/api/:path*',
};
