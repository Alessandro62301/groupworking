import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, { requireAdmin: true });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeMembers, referralsThisMonth, thanksThisMonth] = await Promise.all([
      prisma.member.count({ where: { status: 'active' } }),
      prisma.referral.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.thanks.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return NextResponse.json(
      {
        activeMembers,
        referralsThisMonth,
        thanksThisMonth,
        monthStartsAt: startOfMonth,
      },
      { status: 200 },
    );
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error('Erro ao carregar métricas do dashboard:', error);
    return NextResponse.json({ message: 'Erro ao carregar métricas.' }, { status: 500 });
  }
}
