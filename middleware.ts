import { auth } from "@/auth.config"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")
    const isPublicPage = pathname === "/"

    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
        }
        return NextResponse.next()
    }

    if (!isLoggedIn && !isPublicPage) {
        let callbackUrl = pathname
        if (req.nextUrl.search) {
            callbackUrl += req.nextUrl.search
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl)
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

