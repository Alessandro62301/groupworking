import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  createIntention,
  IntentionConflictError,
  IntentionValidationError,
} from '@/lib/services/intentions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const intention = await createIntention(prisma, body);

    return NextResponse.json(intention, { status: 201 });
  } catch (error: any) {
    if (error instanceof IntentionValidationError) {
      return NextResponse.json(
        { message: 'invalid', errors: error.fieldErrors },
        { status: 400 },
      );
    }

    if (error instanceof IntentionConflictError) {
      return NextResponse.json(
        { message: 'E-mail já possui uma intenção cadastrada.' },
        { status: 409 },
      );
    }

    console.error('Erro ao criar intenção:', error);
    return NextResponse.json(
      { message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
