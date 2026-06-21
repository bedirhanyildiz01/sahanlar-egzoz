import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const ADMIN_EMAIL = 'admin@egzozcu.com';
const ADMIN_PASSWORD = 'Egzoz123!_Admin'; // From prompt requirements
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-egzoz-key-321!_admin_sec';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Hatalı e-posta veya şifre.' },
        { status: 401 }
      );
    }

    // Generate JWT using jose (fully compatible with Edge runtime)
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ email: ADMIN_EMAIL, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    const response = NextResponse.json({ success: true, message: 'Giriş başarılı.' });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Giriş işlemi sırasında hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}
