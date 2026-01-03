import { auth } from "@/auth.config"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")

    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", req.nextUrl))
        }
        return NextResponse.next()
    }

    if (!isLoggedIn) {
        let callbackUrl = req.nextUrl.pathname
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

