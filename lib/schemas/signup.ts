import { z } from 'zod';

const baseFields = {
  fullName: z.string().min(3, 'Informe o nome completo'),
  email: z.string().email('E-mail inválido'),
  company: z
    .string()
    .max(160, 'Máximo de 160 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(40, 'Máximo de 40 caracteres')
    .optional()
    .or(z.literal('')),
};

export const completeSignupFormSchema = z
  .object({
    ...baseFields,
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas precisam coincidir',
    path: ['confirmPassword'],
  });

export const completeSignupPayloadSchema = z.object({
  ...baseFields,
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

export type CompleteSignupFormSchema = z.infer<typeof completeSignupFormSchema>;
export type CompleteSignupPayloadSchema = z.infer<typeof completeSignupPayloadSchema>;
