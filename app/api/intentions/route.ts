import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { intentionSchema } from '@/lib/schemas/intentions';

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = intentionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'invalid', issues: parsed.error.format() },
      { status: 400 }
    );
  }

  // grava no banco
  const intention = await prisma.intention.create({
    data: {
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      company: parsed.data.company,
      phone: parsed.data.phone,
      notes: parsed.data.notes,
      status: 'PENDING',
    },
    select: { id: true, status: true, created_at: true },
  });

  return NextResponse.json(intention, { status: 201 });
}
