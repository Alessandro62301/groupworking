import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { intentionDecisionSchema } from '@/lib/schemas/intentions';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    const updated = await prisma.intention.update({
      where: { id: intentionId },
      data: { status: parsed.data.decision },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar intenção:', error);
    return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
  }
}
