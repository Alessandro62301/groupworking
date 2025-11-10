import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { completeSignupPayloadSchema } from '@/lib/schemas/signup';

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ message: 'Token é obrigatório.' }, { status: 400 });
    }

    const invite = await findValidInvite(token);
    if (!invite) {
      return invalidTokenResponse();
    }

    return NextResponse.json(
      {
        token: invite.token,
        expiresAt: invite.expiresAt,
        intention: {
          fullName: invite.intention.fullName,
          email: invite.intention.email,
          company: invite.intention.company,
          phone: invite.intention.phone,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erro ao validar convite:', error);
    return NextResponse.json({ message: 'Erro ao validar convite.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ message: 'Token é obrigatório.' }, { status: 400 });
    }

    const invite = await findValidInvite(token);
    if (!invite) {
      return invalidTokenResponse();
    }

    const body = await req.json().catch(() => ({}));
    const parsed = completeSignupPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (invite.intention.status !== 'approved') {
      return NextResponse.json({ message: 'Intenção ainda não foi aprovada.' }, { status: 409 });
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const intentionEmail = invite.intention.email.trim().toLowerCase();

    if (normalizedEmail !== intentionEmail) {
      return NextResponse.json(
        { message: 'E-mail não corresponde ao convite aprovado.' },
        { status: 409 },
      );
    }

    const existingMember = await prisma.member.findUnique({
      where: { email: parsed.data.email.trim() },
      select: { id: true },
    });

    if (existingMember) {
      return NextResponse.json({ message: 'E-mail já cadastrado.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const company = getOptionalString(parsed.data.company) ?? invite.intention.company;
    const phone = getOptionalString(parsed.data.phone) ?? invite.intention.phone;

    const member = await prisma.$transaction(async (tx) => {
      const createdMember = await tx.member.create({
        data: {
          fullName: parsed.data.fullName.trim(),
          email: invite.intention.email,
          company,
          phone,
          passwordHash,
          status: 'active',
          admin: false,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });

      await tx.inviteToken.update({
        where: { id: invite.id },
        data: { used: true },
      });

      return createdMember;
    });

    console.log(`[Convite] Cadastro concluído para ${member.email} (intenção #${invite.intention.id}).`);

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Erro ao concluir cadastro:', error);
    return NextResponse.json({ message: 'Erro ao concluir cadastro.' }, { status: 500 });
  }
}

function getToken(req: NextRequest) {
  return req.nextUrl.searchParams.get('token')?.trim();
}

function getOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function invalidTokenResponse() {
  return NextResponse.json({ message: 'Convite inválido ou expirado.' }, { status: 404 });
}

async function findValidInvite(token: string) {
  if (!token) {
    return null;
  }

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: {
      intention: {
        select: {
          id: true,
          fullName: true,
          email: true,
          company: true,
          phone: true,
          status: true,
        },
      },
    },
  });

  if (!invite) {
    return null;
  }

  const now = new Date();
  if (invite.used || invite.expiresAt < now) {
    return null;
  }

  return invite;
}
