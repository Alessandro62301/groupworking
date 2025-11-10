'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/forms/text-field';
import { loginSchema, type LoginSchema } from '@/lib/schemas/auth';
import { postJson } from '@/lib/api/http';

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginSchema) => {
    setErrorMessage(null);
    try {
      const response = await postJson<{
        user?: {
          role?: 'admin' | 'member';
        };
      }>('/api/auth/login', values);
      const role = response?.user?.role === 'admin' ? 'admin' : 'member';
      router.push(role === 'admin' ? '/admin/intentions' : '/member/referrals');
    } catch (error) {
      setErrorMessage((error as Error)?.message ?? 'Falha ao autenticar.');
    }
  };

  return (
   <section className='w-full min-h-screen bg-gray-50 pt-40 flex justify-center align-middle' >
     <div className="flex items-center w-2xl h-72 justify-center px-4">
      <Card className="w-full  max-w-md space-y-6 p-8">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-widest text-neutral-400">GroupWorking</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Entrar no painel</h1>
          <p className="text-sm text-neutral-500">Use seu e-mail e senha para acessar o dashboard.</p>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        )}

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <TextField control={form.control} name="email" label="E-mail" type="email" required />
          <TextField control={form.control} name="password" label="Senha" type="password" required />
          <Button type="submit" className="w-full mt-4" loading={form.formState.isSubmitting}>
            Acessar painel
          </Button>
        </form>
      </Card>
    </div>
   </section>
  );
}
