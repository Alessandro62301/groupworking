'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { intentionSchema, IntentionFormData } from '@/lib/schemas/intentions';
import { postJson } from '@/lib/api/http';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/forms/TextField';
import { ToastContainer, toast } from 'react-toastify';

export default function IntentPage() {
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  const form = useForm<IntentionFormData>({
    resolver: zodResolver(intentionSchema),
    defaultValues: { full_name: '', email: '', company: '', phone: '', notes: '' },
  });

  const onSubmit = async (data: IntentionFormData) => {
    try {
      const res = await postJson('/api/intentions', data);
      setSubmittedId(res?.id ?? null);
      form.reset();
    } catch (e: any) {
      toast.error(e?.message);
      // form.setError('root', { message: e?.message || 'Erro ao enviar intenção.' });
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center p-6">
      <ToastContainer />
      <Card className="w-full max-w-2xl">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-900">Quero participar do grupo ✨</h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha seus dados e retornaremos com o convite se aprovado.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 grid gap-4">
          {submittedId && (
            <div className="rounded-md border border-green-200 bg-green-50 text-green-700 text-sm p-3">
              Intenção enviada! Protocolo <b>#{submittedId}</b>. Aguarde o retorno por e-mail.
            </div>
          )}
          {form.formState.errors.root && (
            <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-sm p-3">
              {form.formState.errors.root.message}
            </div>
          )}

          <TextField control={form.control} name="full_name" label="Nome completo" required />
          <TextField control={form.control} name="email" label="E-mail" type="email" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField control={form.control} name="company" label="Empresa" />
            <TextField control={form.control} name="phone" label="Telefone" placeholder="(00) 00000-0000" />
          </div>
          <TextField control={form.control} name="notes" label="Como nos conheceu?" multiline rows={4} />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => form.reset()}>Limpar</Button>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Enviar intenção
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}