'use client';

import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

import { AdminSidebar, type AdminNavItem } from './admin-sidebar';
import { AdminHeaderProvider } from './admin-header-context';

type AdminShellProps = {
  children: ReactNode;
  navItems: AdminNavItem[];
};

const DEFAULT_HEADER = {
  title: 'Dashboard administrativo',
  subtitle: 'Acompanhe métricas, intenções e indicações em tempo real.',
};

export function AdminShell({ children, navItems }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [header, setHeader] = useState(DEFAULT_HEADER);

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleHeaderChange = useCallback(
    ({ title, subtitle }: { title?: string; subtitle?: string } = {}) => {
      setHeader((prev) => {
        const nextTitle = title ?? prev.title ?? DEFAULT_HEADER.title;
        const nextSubtitle = subtitle ?? prev.subtitle ?? DEFAULT_HEADER.subtitle;

        if (prev.title === nextTitle && prev.subtitle === nextSubtitle) {
          return prev;
        }

        return {
          title: nextTitle,
          subtitle: nextSubtitle,
        };
      });
    },
    [],
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white transition-transform duration-200 ease-out md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <AdminSidebar items={navItems} onNavigate={closeSidebar} />
        </div>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={closeSidebar}
          />
        ) : null}

        <div className="flex flex-1 flex-col">
          <header className="flex flex-col gap-4 border-b border-neutral-200 bg-white px-6 py-4 md:px-8 md:py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">Área restrita</p>
                <h1 className="text-2xl font-semibold text-neutral-900">{header.title}</h1>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100 md:hidden"
                onClick={handleToggleSidebar}
                aria-label="Abrir menu"
              >
                <span className="sr-only">Abrir menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-neutral-500">{header.subtitle}</p>
          </header>

          <main className="flex-1 px-6 py-6 md:px-8 md:py-8">
            <AdminHeaderProvider value={{ setHeader: handleHeaderChange }}>{children}</AdminHeaderProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
