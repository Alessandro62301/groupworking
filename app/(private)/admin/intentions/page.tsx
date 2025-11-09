'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';

import { useAdminHeader } from '@/components/layout/admin-header-context';
import SummaryCard from '@/components/ui/summary-card';
import { getJson, patchJson, type ApiError } from '@/lib/api/http';

type IntentionStatus = 'pending' | 'approved' | 'rejected';

type Intention = {
  id: number;
  fullName: string;
  email: string;
  company?: string;
  createdAt: string;
  status: IntentionStatus;
  notes?: string;
};

const DECISION_LABEL: Record<IntentionStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Recusada',
};

const STATUS_STYLES: Record<IntentionStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(new Date(value));

export default function AdminIntentionsPage() {
  const router = useRouter();
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [decisionLoadingId, setDecisionLoadingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useAdminHeader({
    title: 'Intenções submetidas',
    subtitle: 'Revise o funil de admissões e aprove ou recuse conforme o alinhamento com o grupo.',
  });

  const redirectIfUnauthorized = useCallback(
    (error: unknown) => {
      const status = (error as ApiError)?.status;
      if (status === 401 || status === 403) {
        router.push('/login');
        return true;
      }
      return false;
    },
    [router],
  );

  const loadIntentions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getJson<Intention[]>('/api/admin/intentions');
      setIntentions(data);
    } catch (error) {
      if (redirectIfUnauthorized(error)) {
        return;
      }
      console.error('Erro ao buscar intenções', error);
      setErrorMessage((error as Error)?.message ?? 'Erro ao buscar intenções.');
    } finally {
      setIsLoading(false);
    }
  }, [redirectIfUnauthorized]);

  useEffect(() => {
    loadIntentions();
  }, [loadIntentions]);

  const summary = useMemo(() => {
    return intentions.reduce(
      (acc, current) => {
        acc[current.status] += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 } as Record<IntentionStatus, number>,
    );
  }, [intentions]);

  const handleDecision = async (id: number, decision: Exclude<IntentionStatus, 'pending'>) => {
    setDecisionLoadingId(id);

    try {
      const updated = await patchJson<Intention>(`/api/admin/intentions/${id}`, { decision });
      setIntentions((prev) =>
        prev.map((intention) =>
          intention.id === updated.id ? { ...intention, status: updated.status } : intention,
        ),
      );
      if (decision === 'approved') {
        toast.success('Intenção aprovada com sucesso!');
      } else {
        toast.warning('Intenção recusada.');
      }
    } catch (error) {
      if (redirectIfUnauthorized(error)) {
        return;
      }
      console.error('Erro ao atualizar intenção', error);
      toast.error('Erro ao atualizar intenção.');
    } finally {
      setDecisionLoadingId(null);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToastContainer />

      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="Pendentes" value={summary.pending} accent="border-amber-200 bg-amber-50 text-amber-900" />
        <SummaryCard label="Aprovadas" value={summary.approved} accent="border-emerald-200 bg-emerald-50 text-emerald-900" />
        <SummaryCard label="Recusadas" value={summary.rejected} accent="border-rose-200 bg-rose-50 text-rose-900" />
      </section>

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6 text-sm text-neutral-500">Carregando intenções...</div>
        ) : intentions.length === 0 ? (
          <div className="p-6 text-sm text-neutral-500">Nenhuma intenção encontrada.</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50 text-left text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-6 py-3">Membro</th>
                    <th className="px-6 py-3">Empresa</th>
                    <th className="px-6 py-3">Enviado em</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm text-neutral-800">
                  {intentions.map((intention) => (
                    <tr key={intention.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{intention.fullName}</div>
                        <div className="text-xs text-neutral-500">{intention.email}</div>
                      </td>
                      <td className="px-6 py-4">{intention.company ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{formatDate(intention.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[intention.status]}`}
                        >
                          {DECISION_LABEL[intention.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={intention.status === 'approved' || decisionLoadingId === intention.id}
                            onClick={() => handleDecision(intention.id, 'approved')}
                            className="rounded-full border border-emerald-200 px-4 py-1 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
                          >
                            Aprovar
                          </button>
                          <button
                            type="button"
                            disabled={intention.status === 'rejected' || decisionLoadingId === intention.id}
                            onClick={() => handleDecision(intention.id, 'rejected')}
                            className="rounded-full border border-rose-200 px-4 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
                          >
                            Recusar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-neutral-100 md:hidden">
              {intentions.map((intention) => (
                <article key={intention.id} className="px-4 py-5">
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="font-semibold text-neutral-900">{intention.fullName}</p>
                      <p className="text-xs text-neutral-500">{intention.email}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-y-2 text-sm text-neutral-600">
                      <div>
                        <dt className="text-xs font-medium uppercase text-neutral-400">Empresa</dt>
                        <dd>{intention.company ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase text-neutral-400">Enviado em</dt>
                        <dd>{formatDate(intention.createdAt)}</dd>
                      </div>
                    </dl>
                    <div className="flex flex-col gap-3">
                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[intention.status]}`}
                      >
                        {DECISION_LABEL[intention.status]}
                      </span>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          disabled={intention.status === 'approved' || decisionLoadingId === intention.id}
                          onClick={() => handleDecision(intention.id, 'approved')}
                          className="w-full rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          disabled={intention.status === 'rejected' || decisionLoadingId === intention.id}
                          onClick={() => handleDecision(intention.id, 'rejected')}
                          className="w-full rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
