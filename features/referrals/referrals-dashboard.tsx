'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';

import SummaryCard from '@/components/ui/summary-card';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import {
  createReferralSchema,
  referralStatusLabels,
  referralStatusValues,
  type CreateReferralSchema,
} from '@/lib/schemas/referrals';
import { getJson, patchJson, postJson, type ApiError } from '@/lib/api/http';

type ReferralStatus = (typeof referralStatusValues)[number];

type ReferralMember = {
  id: number;
  fullName: string;
  company?: string | null;
};

type Referral = {
  id: number;
  title: string;
  description: string;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  fromMember: ReferralMember;
  toMember: ReferralMember;
};

type ReferralResponse = {
  sent: Referral[];
  received: Referral[];
};

type MemberOption = {
  id: number;
  fullName: string;
  company?: string | null;
};

const STATUS_BADGES: Record<ReferralStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-sky-100 text-sky-800 border-sky-200',
  won: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lost: 'bg-rose-100 text-rose-800 border-rose-200',
};

export function ReferralsDashboard() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<ReferralResponse>({ sent: [], received: [] });
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);

  const form = useForm<CreateReferralSchema>({
    resolver: zodResolver(createReferralSchema),
    defaultValues: {
      toMemberId: '' as unknown as number,
      title: '',
      description: '',
    },
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

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const [referralData, membersData] = await Promise.all([
        getJson<ReferralResponse>('/api/member/referrals'),
        getJson<MemberOption[]>('/api/member/members'),
      ]);
      setReferrals(referralData);
      setMembers(membersData);
    } catch (error) {
      if (redirectIfUnauthorized(error)) {
        return;
      }
      console.error('Erro ao carregar dados de indicações', error);
      toast.error('Não foi possível carregar as informações.');
    } finally {
      setIsLoading(false);
    }
  }, [redirectIfUnauthorized]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const summary = useMemo(() => {
    return {
      sent: referrals.sent.length,
      received: referrals.received.length,
      activeSuggestions: referrals.sent.filter((item) => item.status === 'pending' || item.status === 'in_progress').length,
    };
  }, [referrals]);

  const handleCreateReferral = async (values: CreateReferralSchema) => {
    try {
      const created = await postJson<Referral>('/api/member/referrals', values);
      toast.success('Indicação registrada e enviada para o membro.');
      form.reset();
      setReferrals((prev) => ({ ...prev, sent: [created, ...prev.sent] }));
    } catch (error) {
      if (redirectIfUnauthorized(error)) {
        return;
      }
      console.error('Erro ao criar indicação', error);
      toast.error((error as ApiError)?.message ?? 'Erro ao criar indicação.');
    }
  };

  const handleStatusChange = async (id: number, status: ReferralStatus) => {
    setStatusLoadingId(id);
    try {
      const updated = await patchJson<Referral>(`/api/member/referrals/${id}`, { status });
      setReferrals((prev) => ({
        sent: prev.sent.map((item) => (item.id === updated.id ? updated : item)),
        received: prev.received.map((item) => (item.id === updated.id ? updated : item)),
      }));
      toast.success('Status atualizado com sucesso.');
    } catch (error) {
      if (redirectIfUnauthorized(error)) {
        return;
      }
      console.error('Erro ao atualizar status da indicação', error);
      toast.error((error as ApiError)?.message ?? 'Erro ao atualizar status.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const renderReferralList = (items: Referral[], type: 'sent' | 'received') => {
    if (items.length === 0) {
      return <p className="text-sm text-neutral-500">Nenhuma indicação {type === 'sent' ? 'enviada' : 'recebida'} ainda.</p>;
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase text-neutral-400">
                    {type === 'sent' ? 'Indicado para' : 'Indicado por'}
                  </p>
                  <p className="text-base font-semibold text-neutral-900">
                    {type === 'sent' ? item.toMember.fullName : item.fromMember.fullName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {(type === 'sent' ? item.toMember.company : item.fromMember.company) ?? '—'}
                  </p>
                </div>
                <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${STATUS_BADGES[item.status]}`}>
                  {referralStatusLabels[item.status]}
                </span>
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                <p className="text-xs uppercase text-neutral-400">Empresa / contato</p>
                <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-neutral-500">
                  Atualizado em {new Intl.DateTimeFormat('pt-BR').format(new Date(item.updatedAt))}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor={`status-${type}-${item.id}`} className="text-xs text-neutral-500">
                    Atualizar status
                  </label>
                  <select
                    id={`status-${type}-${item.id}`}
                    value={item.status}
                    disabled={statusLoadingId === item.id}
                    onChange={(event) => handleStatusChange(item.id, event.target.value as ReferralStatus)}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none"
                  >
                    {referralStatusValues.map((value) => (
                      <option key={value} value={value}>
                        {referralStatusLabels[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <ToastContainer />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <SummaryCard label="Minhas indicações" value={summary.sent} accent="border-blue-200 bg-blue-50 text-blue-900" />
        <SummaryCard label="Recebidas" value={summary.received} accent="border-emerald-200 bg-emerald-50 text-emerald-900" />
        <SummaryCard label="Em aberto" value={summary.activeSuggestions} accent="border-amber-200 bg-amber-50 text-amber-900" />
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-6 py-4">
          <h2 className="text-xl font-semibold text-neutral-900">Nova indicação</h2>
          <p className="text-sm text-neutral-500">Compartilhe oportunidades com outros membros.</p>
        </div>
        <form className="space-y-4 p-6" onSubmit={form.handleSubmit(handleCreateReferral)}>
          <Controller
            control={form.control}
            name="toMemberId"
            render={({ field, fieldState }) => (
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-neutral-800">
                  Membro indicado <span className="text-rose-500">*</span>
                </label>
                <select
                  {...field}
                  className={`rounded-xl border px-3 py-2 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-neutral-900/10 ${
                    fieldState.error ? 'border-rose-400 focus:ring-rose-500/20' : 'border-neutral-300'
                  }`}
                >
                  <option value="">Selecione o membro</option>
                  {members.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.fullName} {option.company ? `— ${option.company}` : ''}
                    </option>
                  ))}
                </select>
                {fieldState.error ? (
                  <p className="text-xs text-rose-600">{String(fieldState.error.message)}</p>
                ) : null}
              </div>
            )}
          />

          <TextField control={form.control} name="title" label="Empresa ou contato indicado" required />
          <TextField control={form.control} name="description" label="Descrição da oportunidade" multiline rows={4} required />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => form.reset()}>
              Limpar
            </Button>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Enviar indicação
            </Button>
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-900">Indicações enviadas</h3>
          {isLoading ? <p className="text-sm text-neutral-500">Carregando...</p> : renderReferralList(referrals.sent, 'sent')}
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-900">Indicações recebidas</h3>
          {isLoading ? <p className="text-sm text-neutral-500">Carregando...</p> : renderReferralList(referrals.received, 'received')}
        </div>
      </div>
    </section>
  );
}
