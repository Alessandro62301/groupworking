import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed: iniciando...');

  // 1) Limpeza (somente DEV!)
  await prisma.$transaction([
    prisma.checkin.deleteMany(),
    prisma.meeting.deleteMany(),
    prisma.thanks.deleteMany(),
    prisma.referral.deleteMany(),
    prisma.oneOnOne.deleteMany(),
    prisma.due.deleteMany(),
    prisma.inviteToken.deleteMany(),
    prisma.member.deleteMany(),
    prisma.intention.deleteMany(),
  ]);

  // 2) Intenções + token (fluxo de admissão)
  const pendingIntention = await prisma.intention.create({
    data: {
      fullName: 'João Candidato',
      email: 'joao.candidato@example.com',
      company: 'João Tech',
      phone: '(11) 99999-1111',
      notes: 'Conheceu o grupo em um evento de tecnologia',
      status: 'pending',
    },
  });

  const approvedIntention = await prisma.intention.create({
    data: {
      fullName: 'Ana Aprovada',
      email: 'ana.aprovada@example.com',
      status: 'approved',
    },
  });

  const invite = await prisma.inviteToken.create({
    data: {
      intentionId: approvedIntention.id,      // relação 1:1 (intentionId é @unique)
      token: '11112222333344445555666677778888',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
      used: false,
    },
  });

  // 3) Membros (com admin e passwordHash)
  const [adminHash, mariaHash, carlosHash] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('maria123', 10),
    bcrypt.hash('carlos123', 10),
  ]);

  const admin = await prisma.member.create({
    data: {
      fullName: 'Admin do Grupo',
      email: 'admin@groupworking.com',
      company: 'GroupWorking Ltda',
      phone: '(11) 90000-0000',
      admin: true,
      passwordHash: adminHash,
      status: 'active',
    },
  });

  const maria = await prisma.member.create({
    data: {
      fullName: 'Maria Silva',
      email: 'maria@empresa.com',
      company: 'MS Marketing',
      phone: '(11) 98888-0001',
      admin: false,
      passwordHash: mariaHash,
      status: 'active',
    },
  });

  const carlos = await prisma.member.create({
    data: {
      fullName: 'Carlos Ferreira',
      email: 'carlos@startup.com',
      company: 'Startup X',
      phone: '(21) 97777-2222',
      admin: false,
      passwordHash: carlosHash,
      status: 'active',
    },
  });

  // 4) Reunião + check-ins
  const meeting = await prisma.meeting.create({
    data: {
      meetingDate: new Date(),
      location: 'Espaço Coworking Center',
      notes: 'Reunião semanal do grupo',
    },
  });

  await prisma.checkin.createMany({
    data: [
      { memberId: admin.id, meetingId: meeting.id },
      { memberId: maria.id, meetingId: meeting.id },
      { memberId: carlos.id, meetingId: meeting.id },
    ],
  });

  // 5) Indicação (Maria -> Carlos)
  const referral = await prisma.referral.create({
    data: {
      fromMemberId: maria.id,
      toMemberId: carlos.id,
      title: 'Site institucional XPTO',
      description: 'Maria indicou Carlos para desenvolvimento do site XPTO.',
      status: 'in_progress',
      valueCents: BigInt(800_000),
      currency: 'BRL',
    },
  });

  // 6) Agradecimento (Carlos -> Maria)
  await prisma.thanks.create({
    data: {
      fromMemberId: carlos.id,
      toMemberId: maria.id,
      message: 'Obrigado pela indicação, Maria!',
      valueCents: BigInt(20_000),
      currency: 'BRL',
    },
  });

  // 7) 1 a 1 (Maria x Carlos)
  await prisma.oneOnOne.create({
    data: {
      memberAId: maria.id,
      memberBId: carlos.id,
      occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // há 3 dias
      notes: 'Conversamos sobre possíveis parcerias comerciais.',
    },
  });

  // 8) Mensalidade (Maria)
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  await prisma.due.create({
    data: {
      memberId: maria.id,
      referenceMonth: firstDayOfMonth,
      amountCents: BigInt(15_000),
      currency: 'BRL',
      status: 'open',
    },
  });

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
