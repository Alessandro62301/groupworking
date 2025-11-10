'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { postJson } from '@/lib/api/http';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await postJson('/api/auth/logout', {});
      } catch (error) {
        console.error('Erro ao encerrar sessão:', error);
      } finally {
        router.replace('/');
      }
    };

    doLogout();
  }, [router]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-700">Saindo da sua conta...</p>
      </div>
    </section>
  );
}
