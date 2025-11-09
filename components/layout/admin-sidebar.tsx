'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type AdminNavItem = {
  href: string;
  label: string;
  badge?: string;
};

type AdminSidebarProps = {
  items: AdminNavItem[];
  onNavigate?: () => void;
};

export function AdminSidebar({ items, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-6 py-5">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">
          GW
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">GroupWorking</p>
          <p className="text-xs text-neutral-500">Painel do administrador</p>
        </div>
      </div>

      <nav className="space-y-1 px-4 py-6">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-neutral-900/10 px-2 py-0.5 text-xs font-semibold text-neutral-900">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
