import { z } from 'zod';

export const intentionSchema = z.object({
  full_name: z.string().min(3, 'Digite pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  company: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type IntentionFormData = z.infer<typeof intentionSchema>;
