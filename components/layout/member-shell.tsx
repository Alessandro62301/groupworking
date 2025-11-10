'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export type MemberNavItem = {
  href: string;
  label: string;
};

type MemberShellProps = {
  children: ReactNode;
  navItems: MemberNavItem[];
};

export function MemberShell({ children, navItems }: MemberShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-md transition-transform duration-200 ease-out md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex h-full flex-col border-r border-neutral-200">
            <div className="border-b border-neutral-200 px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-neutral-400">GroupWorking</p>
              <p className="text-lg font-semibold text-neutral-900">Área do membro</p>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
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

          <main className="flex-1 px-6 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
