import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'experimental-edge';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-egzoz-key-321!_admin_sec';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('admin_session')?.value;

  const isAdminPath = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  
  // Protect API route mutations
  const isMutationApi = 
    (pathname.startsWith('/api/products') || 
     pathname.startsWith('/api/cars') || 
     pathname.startsWith('/api/upload')) && 
    ['POST', 'PUT', 'DELETE'].includes(req.method);

  // Helper to verify JWT token
  let isValidToken = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch (e) {
      isValidToken = false;
    }
  }

  // Protection logic for API write requests
  if (isMutationApi) {
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen önce giriş yapın.' },
        { status: 401 }
      );
    }
  }

  // Protection logic for Admin Frontend routes
  if (isAdminPath) {
    // If accessing the login page
    if (isLoginPage) {
      if (isValidToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // If accessing any other admin sub-page without a valid token
    if (!isValidToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
