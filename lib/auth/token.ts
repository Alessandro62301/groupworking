import jwt from 'jsonwebtoken';

type Role = 'admin' | 'member';

export type JwtPayload = {
  sub: number;
  role: Role;
};

const DEFAULT_EXPIRATION = '12h';
export const AUTH_COOKIE_NAME = 'gw.token';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado nas variáveis de ambiente.');
  }
  return secret;
}

export function signToken(payload: JwtPayload, options?: jwt.SignOptions) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: DEFAULT_EXPIRATION,
    ...options,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as JwtPayload & jwt.JwtPayload;
}
