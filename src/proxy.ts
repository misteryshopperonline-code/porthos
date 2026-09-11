import { withAuth } from 'next-auth/middleware';
import { getAuthSecret } from '@/lib/authSecret';

export const proxy = withAuth({
  secret: getAuthSecret(),
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) {
        return false;
      }
      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith('/admin') && token.role === 'OPERATOR') {
        return false;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/((?!login|activar|api/auth|_next/static|_next/image|favicon.ico).*)'],
};
