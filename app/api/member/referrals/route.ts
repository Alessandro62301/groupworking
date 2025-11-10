import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';
import { createReferralSchema } from '@/lib/schemas/referrals';

const referralSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  fromMember: {
    select: {
      id: true,
      fullName: true,
      company: true,
    },
  },
  toMember: {
    select: {
      id: true,
      fullName: true,
      company: true,
    },
  },
} as const;

export async function GET(req: NextRequest) {
  try {
    const { member } = await requireAuth(req);

    const [sent, received] = await Promise.all([
      prisma.referral.findMany({
        where: { fromMemberId: member.id },
        orderBy: { createdAt: 'desc' },
        select: referralSelect,
      }),
      prisma.referral.findMany({
        where: { toMemberId: member.id },
        orderBy: { createdAt: 'desc' },
        select: referralSelect,
      }),
    ]);

    return NextResponse.json({ sent, received }, { status: 200 });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    console.error('Erro ao listar indicações do membro:', error);
    return NextResponse.json({ message: 'Erro ao listar indicações.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member } = await requireAuth(req);

    const body = await req.json().catch(() => ({}));
    const parsed = createReferralSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (parsed.data.toMemberId === member.id) {
      return NextResponse.json(
        { message: 'Não é possível criar uma indicação para você mesmo.' },
        { status: 400 },
      );
    }

    const targetMember = await prisma.member.findUnique({
      where: { id: parsed.data.toMemberId },
      select: { id: true, status: true },
    });

    if (!targetMember || targetMember.status !== 'active') {
      return NextResponse.json({ message: 'Membro indicado inválido.' }, { status: 404 });
    }

    const referral = await prisma.referral.create({
      data: {
        fromMemberId: member.id,
        toMemberId: parsed.data.toMemberId,
        title: parsed.data.title,
        description: parsed.data.description,
      },
      select: referralSelect,
    });

    return NextResponse.json(referral, { status: 201 });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    console.error('Erro ao criar indicação:', error);
    return NextResponse.json({ message: 'Erro ao criar indicação.' }, { status: 500 });
  }
}
