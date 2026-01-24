import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is public
    const isPublicPath = publicPaths.some(path =>
        pathname === path || pathname.startsWith('/_next') || pathname.startsWith('/api')
    );

    // Allow public paths
    if (isPublicPath) {
        return NextResponse.next();
    }

    // Check for authentication token in cookies or header
    // Note: In production, use HTTP-only cookies set by the server
    // For client-side token storage, we check via a custom header or just allow
    // The actual auth check happens client-side in AuthProvider

    // For protected routes (dashboard/*), we can check for a session cookie
    // but since we're using client-side token storage, we'll let the client handle auth
    // and redirect from the AuthProvider

    // If you want server-side route protection with cookies:
    // const token = request.cookies.get('ftf_access_token')?.value;
    // if (!token && pathname.startsWith('/dashboard')) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
