import { createIntention, IntentionConflictError, IntentionValidationError } from './intentions';

const prisma = {
  intention: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as unknown as Parameters<typeof createIntention>[0];

const resetMocks = () => {
  (prisma.intention.findUnique as jest.Mock).mockReset();
  (prisma.intention.create as jest.Mock).mockReset();
};

describe('createIntention', () => {
  beforeEach(resetMocks);

  it('persiste a intenção quando o e-mail ainda não existe', async () => {
    const payload = {
      full_name: 'João Teste',
      email: 'joao@example.com',
      company: 'JT Tech',
      phone: '(11) 90000-0000',
      notes: 'Encontrou no LinkedIn',
    };
    const expected = { id: 7, email: payload.email, status: 'pending', createdAt: new Date('2024-11-01') };

    (prisma.intention.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.intention.create as jest.Mock).mockResolvedValue(expected);

    const result = await createIntention(prisma, payload);

    expect(prisma.intention.findUnique).toHaveBeenCalledWith({ where: { email: payload.email } });
    expect(prisma.intention.create).toHaveBeenCalledWith({
      data: {
        fullName: payload.full_name,
        email: payload.email,
        company: payload.company,
        phone: payload.phone,
        notes: payload.notes,
        status: 'pending',
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });
    expect(result).toEqual(expected);
  });

  it('normaliza campos opcionais vazios para null antes de salvar', async () => {
    (prisma.intention.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.intention.create as jest.Mock).mockResolvedValue({ id: 1 });

    await createIntention(prisma, { full_name: 'Ana', email: 'ana@example.com', company: '', phone: '', notes: '' });

    expect(prisma.intention.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ company: null, phone: null, notes: null }),
      }),
    );
  });

  it('lança IntentionConflictError quando o e-mail já foi utilizado', async () => {
    (prisma.intention.findUnique as jest.Mock).mockResolvedValue({ id: 99 });

    await expect(createIntention(prisma, { full_name: 'Bruno', email: 'bruno@example.com' })).rejects.toBeInstanceOf(
      IntentionConflictError,
    );
    expect(prisma.intention.create).not.toHaveBeenCalled();
  });

  it('lança IntentionValidationError ao receber payload inválido e expõe os fieldErrors', async () => {
    (prisma.intention.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(createIntention(prisma, { full_name: '', email: 'inválido' })).rejects.toMatchObject({
      fieldErrors: expect.objectContaining({ full_name: expect.any(Array), email: expect.any(Array) }),
    });
  });
});
