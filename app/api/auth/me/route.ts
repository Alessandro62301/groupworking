import { NextRequest, NextResponse } from 'next/server';

import { requireAuth, isAuthError } from '@/lib/auth/require-auth';

export async function GET(req: NextRequest) {
  try {
    const { member } = await requireAuth(req);

    return NextResponse.json({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      role: member.admin ? 'admin' : 'member',
      status: member.status,
    });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error('Erro ao obter usuário autenticado:', error);
    return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
  }
}
