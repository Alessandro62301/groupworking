import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { intentionSchema } from '@/lib/schemas/intentions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = intentionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'invalid', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const exists = await prisma.intention.findUnique({
      where: { email: parsed.data.email },
    });

    if (exists) {
      return NextResponse.json(
        { message: 'E-mail já possui uma intenção cadastrada.' },
        { status: 409 }
      );
    }

    const intention = await prisma.intention.create({
      data: {
        fullName: parsed.data.full_name,
        email: parsed.data.email,
        company: parsed.data.company || null,
        phone: parsed.data.phone || null,
        notes: parsed.data.notes || null,
        status: 'pending',
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(intention, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar intenção:', error);
    return NextResponse.json(
      { message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
