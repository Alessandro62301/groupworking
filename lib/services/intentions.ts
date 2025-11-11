import type { PrismaClient } from '@prisma/client';

import { intentionSchema } from '@/lib/schemas/intentions';

export class IntentionValidationError extends Error {
  fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]>) {
    super('validation_error');
    this.fieldErrors = fieldErrors;
  }
}

export class IntentionConflictError extends Error {
  constructor() {
    super('conflict');
  }
}

export async function createIntention(prisma: PrismaClient, payload: unknown) {
  const parsed = intentionSchema.safeParse(payload);

  if (!parsed.success) {
    throw new IntentionValidationError(parsed.error.flatten().fieldErrors);
  }

  const exists = await prisma.intention.findUnique({
    where: { email: parsed.data.email },
  });

  if (exists) {
    throw new IntentionConflictError();
  }

  return prisma.intention.create({
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
}
