import { withAuth } from "next-auth/middleware";
import { authSecret } from "@/lib/authSecret";

// El proxy intercepta las peticiones de las rutas especificadas en el matcher.
// Redirigirá automáticamente a la página de login si no detecta una sesión válida (JWT Token).
export const proxy = withAuth({
  secret: authSecret,
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protegemos todas las rutas excepto login, el api de nextauth propio y los archivos estáticos.
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};