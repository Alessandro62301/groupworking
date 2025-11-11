import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import IntentPage from './page';

jest.mock('@/lib/api/http', () => ({
  postJson: jest.fn(),
}));

const mockToastError = jest.fn();

jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const { postJson } = jest.requireMock('@/lib/api/http');

describe('IntentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('envia intenção com dados válidos', async () => {
    (postJson as jest.Mock).mockResolvedValue({ id: 42 });
    const user = userEvent.setup();

    render(<IntentPage />);

    await user.type(screen.getByLabelText(/Nome completo/i), 'Maria Teste');
    await user.type(screen.getByLabelText(/E-mail/i), 'maria@example.com');
    await user.click(screen.getByRole('button', { name: /enviar intenção/i }));

    await waitFor(() => expect(postJson).toHaveBeenCalled());
    expect(postJson).toHaveBeenCalledWith(
      '/api/intentions',
      expect.objectContaining({
        full_name: 'Maria Teste',
        email: 'maria@example.com',
        company: '',
        notes: '',
      }),
    );
    expect(screen.getByText(/#42/)).toBeInTheDocument();
  });

  it('mostra toast de erro quando API falha', async () => {
    (postJson as jest.Mock).mockRejectedValue(new Error('Falha ao enviar'));
    const user = userEvent.setup();

    render(<IntentPage />);

    await user.type(screen.getByLabelText(/Nome completo/i), 'João Erro');
    await user.type(screen.getByLabelText(/E-mail/i), 'joao@example.com');
    await user.click(screen.getByRole('button', { name: /enviar intenção/i }));

    await waitFor(() => expect(postJson).toHaveBeenCalled());
    expect(mockToastError).toHaveBeenCalledWith('Falha ao enviar');
  });
});
