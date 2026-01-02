import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup']

// Define routes that should redirect to home if user is already authenticated
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const userId = request.cookies.get('userId')?.value
    const isAuthenticated = !!userId

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Check if the current route is an auth route (login/signup)
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // If user is authenticated and trying to access auth routes, redirect to home
    if (isAuthenticated && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url)
        // Add the original URL as a callback parameter
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Allow the request to proceed
    return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
    // Match all routes except:
    // - api routes
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public files (images, etc.)
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
