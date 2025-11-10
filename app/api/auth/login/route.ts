import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/db';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth/token';
import { loginSchema } from '@/lib/schemas/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const member = await prisma.member.findUnique({
      where: { email: parsed.data.email },
    });

    if (!member || !member.passwordHash) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    if (member.status !== 'active') {
      return NextResponse.json({ message: 'Conta inativa.' }, { status: 403 });
    }

    const passwordMatches = await bcrypt.compare(parsed.data.password, member.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const role = member.admin ? 'admin' : 'member';
    const token = signToken({ sub: member.id, role });

    const response = NextResponse.json({
      token,
      user: {
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
  }
}
