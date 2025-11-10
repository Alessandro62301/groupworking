'use client';

import { useEffect, useState } from 'react';

import { useAdminHeader } from '@/components/layout/admin-header-context';
import SummaryCard from '@/components/ui/summary-card';
import { getJson, type ApiError } from '@/lib/api/http';

type DashboardMetrics = {
  activeMembers: number;
  referralsThisMonth: number;
  thanksThisMonth: number;
  monthStartsAt: string;
};

export default function Admin() {
  useAdminHeader({
    title: 'Dashboard administrativo',
    subtitle: 'Acompanhe métricas, intenções e indicações em tempo real.',
  });

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await getJson<DashboardMetrics>('/api/admin/dashboard');
        setMetrics(data);
      } catch (error) {
        const message = (error as ApiError)?.message ?? 'Erro ao carregar métricas.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const monthLabel = metrics
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
        new Date(metrics.monthStartsAt),
      )
    : '';

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading || !metrics ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 shadow-sm">
          Carregando métricas...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label="Membros ativos"
              value={metrics.activeMembers}
              accent="border-neutral-200 bg-white text-neutral-900"
            />
            <SummaryCard
              label={`Indicações em ${monthLabel}`}
              value={metrics.referralsThisMonth}
              accent="border-blue-200 bg-blue-50 text-blue-900"
            />
            <SummaryCard
              label={`Obrigados em ${monthLabel}`}
              value={metrics.thanksThisMonth}
              accent="border-emerald-200 bg-emerald-50 text-emerald-900"
            />
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Resumo do mês</h2>
            <p className="text-sm text-neutral-500">
              Dados consolidados a partir de {monthLabel}. Os indicadores são atualizados em tempo real conforme o
              andamento das operações.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              <li>
                • <strong>{metrics.activeMembers}</strong> membros estão ativos e podem interagir no ecossistema.
              </li>
              <li>
                • <strong>{metrics.referralsThisMonth}</strong> indicações foram registradas neste mês.
              </li>
              <li>
                • <strong>{metrics.thanksThisMonth}</strong> “obrigados” foram celebrados no período.
              </li>
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
