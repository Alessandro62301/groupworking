import { z } from 'zod';

export const intentionSchema = z.object({
  full_name: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido'),
  company: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type IntentionSchema = z.infer<typeof intentionSchema>;

export const intentionDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected'], {
    required_error: 'Decisão é obrigatória',
    invalid_type_error: 'Decisão inválida',
  }),
});

export type IntentionDecisionSchema = z.infer<typeof intentionDecisionSchema>;
