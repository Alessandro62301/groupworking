import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { intentionDecisionSchema } from '@/lib/schemas/intentions';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';

type RouteContext =
  | {
      params: {
        id: string;
      };
    }
  | {
      params: Promise<{
        id: string;
      }>;
    };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await requireAuth(req, { requireAdmin: true });

    const { id } = await resolveParams(context);
    const intentionId = Number(id);

    if (!id || Number.isNaN(intentionId)) {
      return NextResponse.json({ message: 'ID da intenção inválido.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = intentionDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const intention = await prisma.intention.findUnique({
      where: { id: intentionId },
      select: { id: true, status: true },
    });

    if (!intention) {
      return NextResponse.json({ message: 'Intenção não encontrada.' }, { status: 404 });
    }

    if (intention.status === parsed.data.decision) {
      return NextResponse.json(
        { id: intention.id, status: intention.status, message: 'Status já atualizado.' },
        { status: 200 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.intention.update({
        where: { id: intentionId },
        data: { status: parsed.data.decision },
        select: {
          id: true,
          fullName: true,
          email: true,
          company: true,
          status: true,
          createdAt: true,
          invite: {
            select: {
              token: true,
              expiresAt: true,
              used: true,
            },
          },
        },
      });

      if (parsed.data.decision !== 'approved') {
        return { updated, invite: updated.invite };
      }

      const token = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const invite = await tx.inviteToken.upsert({
        where: { intentionId },
        update: { token, expiresAt, used: false },
        create: { intentionId, token, expiresAt },
        select: { token: true, expiresAt: true, used: true },
      });

      // Simula envio de e-mail
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      console.log(
        `[Convite] Intenção #${intentionId} aprovada para ${updated.email}. Token: ${invite.token}. Link: ${baseUrl}/signup/${invite.token}`,
      );

      return { updated, invite };
    });

    return NextResponse.json({ ...result.updated, invite: result.invite }, { status: 200 });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    console.error('Erro ao atualizar intenção:', error);
    return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
  }
}

async function resolveParams(context: RouteContext) {
  const value = context.params as unknown;
  if (value && typeof (value as Promise<{ id: string }>).then === 'function') {
    return value as Promise<{ id: string }>;
  }

  return value as { id: string };
}
