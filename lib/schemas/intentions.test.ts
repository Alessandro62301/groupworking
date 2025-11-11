import { intentionSchema } from './intentions';

describe('intentionSchema', () => {
  it('valida intenção completa', () => {
    const result = intentionSchema.safeParse({
      full_name: 'Ana Silva',
      email: 'ana@example.com',
      company: 'Empresa',
      phone: '(11) 99999-9999',
      notes: 'Evento',
    });

    expect(result.success).toBe(true);
  });

  it('falha para email inválido', () => {
    const result = intentionSchema.safeParse({ full_name: 'Ana', email: 'invalid-email' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });
});
