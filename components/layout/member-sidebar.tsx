'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import type { MemberNavItem } from './member-shell';

type MemberSidebarProps = {
  items: MemberNavItem[];
  onNavigate?: () => void;
};

export function MemberSidebar({ items, onNavigate }: MemberSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    router.push('/logout');
  };

  return (
    <div className="flex h-screen max-h-screen flex-col border-r border-neutral-200">
      <div className="border-b border-neutral-200 px-6 py-5">
        <p className="text-xs uppercase tracking-widest text-neutral-400">GroupWorking</p>
        <p className="text-lg font-semibold text-neutral-900">Área do membro</p>
      </div>

      <div className="flex flex-1 flex-col">
        <nav className="flex-1 space-y-1 px-4 py-6">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
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

        <div className="mt-auto border-t border-neutral-200 px-4 py-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
