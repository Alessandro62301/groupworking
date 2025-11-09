import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, { requireAdmin: true });

    const list = await prisma.intention.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(list, { status: 200 });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error('Erro ao listar intenções:', error);
    return NextResponse.json({ message: 'Erro ao listar intenções.' }, { status: 500 });
  }
}
