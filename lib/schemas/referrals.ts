import { z } from 'zod';

export const referralStatusValues = ['pending', 'in_progress', 'won', 'lost'] as const;

export const createReferralSchema = z.object({
  toMemberId: z.coerce.number().int().positive('Selecione um membro'),
  title: z.string().min(3, 'Informe a empresa ou contato indicado'),
  description: z.string().min(10, 'Descreva brevemente a oportunidade'),
});

export const updateReferralStatusSchema = z.object({
  status: z.enum(referralStatusValues, {
    required_error: 'Status é obrigatório',
  }),
});

export const referralStatusLabels: Record<(typeof referralStatusValues)[number], string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  won: 'Convertida',
  lost: 'Perdida',
};

export type CreateReferralSchema = z.infer<typeof createReferralSchema>;
export type UpdateReferralStatusSchema = z.infer<typeof updateReferralStatusSchema>;
