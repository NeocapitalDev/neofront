import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Si no hay sesión, redirigir al login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Verifica si el usuario tiene rol de admin
    if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "admin") {
        return NextResponse.redirect(new URL("/403", req.url)); // Página de acceso denegado
    }

    return NextResponse.next();
}

// Especificar qué rutas proteger
export const config = {
    matcher: ["/admin/:path*"], // Protege todas las rutas bajo /admin
};
