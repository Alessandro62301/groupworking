import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';

export async function GET(req: NextRequest) {
  try {
    const { member } = await requireAuth(req);

    const members = await prisma.member.findMany({
      where: {
        status: 'active',
        id: { not: member.id },
      },
      select: {
        id: true,
        fullName: true,
        company: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    console.error('Erro ao listar membros ativos:', error);
    return NextResponse.json({ message: 'Erro ao listar membros.' }, { status: 500 });
  }
}
