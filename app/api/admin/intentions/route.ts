import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const list = await prisma.intention.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(list, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao listar intenções:', error);
    return NextResponse.json(
      { message: 'Erro ao listar intenções.' },
      { status: 500 }
    );
  }
}
