import { NextRequest } from 'next/server';

import { prisma } from '@/lib/db';
import { AUTH_COOKIE_NAME, verifyToken } from './token';

export type AuthRole = 'admin' | 'member';

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = 'Não autenticado.') {
    super(message, 401);
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = 'Acesso não autorizado.') {
    super(message, 403);
  }
}

type RequireAuthOptions = {
  requireAdmin?: boolean;
};

export async function requireAuth(req: NextRequest, options?: RequireAuthOptions) {
  const token = extractToken(req);
  if (!token) {
    throw new UnauthorizedError();
  }

  const payload = verifyToken(token);
  const member = await prisma.member.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      fullName: true,
      email: true,
      admin: true,
      status: true,
    },
  });

  if (!member) {
    throw new UnauthorizedError('Usuário não encontrado.');
  }

  if (member.status !== 'active') {
    throw new ForbiddenError('Conta inativa.');
  }

  if (options?.requireAdmin && !member.admin) {
    throw new ForbiddenError();
  }

  return { member, tokenPayload: payload };
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

function extractToken(req: NextRequest) {
  const header = req.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }

  return req.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}
