'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastContainer, toast } from 'react-toastify';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/forms/TextField';
import { completeSignupFormSchema, type CompleteSignupFormSchema } from '@/lib/schemas/signup';
import { getJson, postJson } from '@/lib/api/http';

type InviteDetails = {
  intention: {
    fullName: string;
    email: string;
    company?: string | null;
    phone?: string | null;
  };
};

export default function CompleteSignupPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid' | 'success'>('loading');
  const [invite, setInvite] = useState<InviteDetails['intention'] | null>(null);

  const form = useForm<CompleteSignupFormSchema>({
    resolver: zodResolver(completeSignupFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      company: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadInvite = async () => {
      setStatus('loading');
      try {
        const data = await getJson<InviteDetails>(`/api/signup?token=${token}`);
        setInvite(data.intention);
        form.reset({
          fullName: data.intention.fullName ?? '',
          email: data.intention.email ?? '',
          company: data.intention.company ?? '',
          phone: data.intention.phone ?? '',
          password: '',
          confirmPassword: '',
        });
        setStatus('ready');
      } catch (error) {
        console.error('Convite inválido', error);
        setStatus('invalid');
      }
    };

    loadInvite();
  }, [token, form]);

  const onSubmit = async (values: CompleteSignupFormSchema) => {
    if (!token) {
      toast.error('Token inválido.');
      return;
    }

    try {
      await postJson(`/api/signup?token=${token}`, {
        fullName: values.fullName,
        email: values.email,
        company: values.company,
        phone: values.phone,
        password: values.password,
      });
      setStatus('success');
    } catch (error: any) {
      console.error('Erro ao concluir cadastro', error);
      toast.error(error?.message ?? 'Erro ao concluir cadastro.');
    }
  };

  const renderContent = () => {
    if (status === 'loading') {
      return <div className="p-6 text-sm text-gray-500">Validando seu convite...</div>;
    }

    if (status === 'invalid') {
      return (
        <div className="p-6 flex flex-col gap-4 text-center">
          <p className="text-base font-medium text-gray-900">Convite inválido ou expirado.</p>
          <p className="text-sm text-gray-500">
            Solicite um novo link ao administrador do grupo ou envie novamente sua intenção.
          </p>
          <div className="flex justify-center">
            <Button type="button" variant="ghost" onClick={() => router.push('/intent')}>
              Voltar para o formulário de intenção
            </Button>
          </div>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className="p-6 flex flex-col gap-4 text-center">
          <h2 className="text-xl font-semibold text-emerald-600">Cadastro concluído com sucesso!</h2>
          <p className="text-sm text-gray-600">
            Você já pode acessar o painel utilizando o e-mail e a senha definidos aqui.
          </p>
          <div className="flex justify-center">
            <Button type="button" onClick={() => router.push('/login')}>
              Ir para o login
            </Button>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 grid gap-4">
        {form.formState.errors.root && (
          <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-sm p-3">
            {form.formState.errors.root.message}
          </div>
        )}

        <TextField control={form.control} name="fullName" label="Nome completo" required />
        <TextField control={form.control} name="email" label="E-mail" type="email" required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField control={form.control} name="company" label="Empresa" />
          <TextField control={form.control} name="phone" label="Telefone" placeholder="(00) 00000-0000" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField control={form.control} name="password" label="Senha" type="password" required />
          <TextField control={form.control} name="confirmPassword" label="Confirmar senha" type="password" required />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => form.reset()}>
            Limpar
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting}>
            Criar acesso
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center p-6">
      <ToastContainer />
      <Card className="w-full max-w-2xl">
        <div className="p-6 border-b">
          <p className="text-sm uppercase tracking-wide text-gray-400">Cadastro completo</p>
          <h1 className="text-2xl font-semibold text-gray-900">Finalize sua entrada no grupo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirme seus dados e defina uma senha para acessar o painel.
          </p>
        </div>
        {renderContent()}
      </Card>
    </div>
  );
}
