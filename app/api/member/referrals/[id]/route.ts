import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';
import { updateReferralStatusSchema } from '@/lib/schemas/referrals';

const referralSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  fromMember: {
    select: { id: true, fullName: true, company: true },
  },
  toMember: {
    select: { id: true, fullName: true, company: true },
  },
} as const;

type RouteContext =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { member } = await requireAuth(req);

    const { id } = await resolveParams(context);
    const referralId = Number(id);

    if (!id || Number.isNaN(referralId)) {
      return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateReferralStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      select: {
        id: true,
        fromMemberId: true,
        toMemberId: true,
      },
    });

    if (!referral) {
      return NextResponse.json({ message: 'Indicação não encontrada.' }, { status: 404 });
    }

    if (referral.fromMemberId !== member.id && referral.toMemberId !== member.id) {
      return NextResponse.json({ message: 'Você não pode alterar esta indicação.' }, { status: 403 });
    }

    const updated = await prisma.referral.update({
      where: { id: referralId },
      data: { status: parsed.data.status },
      select: referralSelect,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    console.error('Erro ao atualizar indicação:', error);
    return NextResponse.json({ message: 'Erro ao atualizar indicação.' }, { status: 500 });
  }
}

async function resolveParams(context: RouteContext) {
  const value = context.params as unknown;
  if (value && typeof (value as Promise<{ id: string }>).then === 'function') {
    return value as Promise<{ id: string }>;
  }
  return value as { id: string };
}
