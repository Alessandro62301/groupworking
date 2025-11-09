import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // ajuste se usar prisma
import { intentionSchema } from '@/lib/schemas/intentions';

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = intentionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: 'invalid', issues: parsed.error.format() }, { status: 400 });
  }

  // Salvar no banco (ex. Prisma) — ou logar para o MVP
  if (prisma) {
    const intention = await prisma.intention.create({
      data: { ...parsed.data, status: 'PENDING' },
      select: { id: true, status: true, created_at: true },
    });
    return NextResponse.json(intention, { status: 201 });
  }

  // fallback sem DB
  return NextResponse.json({ id: 1, status: 'pending', created_at: new Date().toISOString() }, { status: 201 });
}
