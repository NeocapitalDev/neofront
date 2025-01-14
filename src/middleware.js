export { default } from "next-auth/middleware"

export const config = { 
    matcher: [
      "/instances/:path*",  // Esto bloqueará todas las rutas bajo /instances/ cualquiera que sea la subruta
      "/profile",
      "/trial",
      "/support",
      "/"
    ] 
  };