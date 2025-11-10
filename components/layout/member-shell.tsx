'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { MemberSidebar } from './member-sidebar';

export type MemberNavItem = {
  href: string;
  label: string;
};

type MemberShellProps = {
  children: ReactNode;
  navItems: MemberNavItem[];
};

export function MemberShell({ children, navItems }: MemberShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen overflow-hidden bg-neutral-50">
      <div className="flex h-full">
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-md transition-transform duration-200 ease-out md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <MemberSidebar items={navItems} onNavigate={closeSidebar} />
        </div>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={closeSidebar}
          />
        ) : null}

        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 md:px-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">Dashboard do membro</p>
              <h1 className="text-2xl font-semibold text-neutral-900">Conexões e oportunidades</h1>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100 md:hidden"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span className="sr-only">Abrir menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
