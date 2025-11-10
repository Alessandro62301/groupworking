import type { ReactNode } from 'react';

import { AdminShell } from '@/components/layout/admin-shell';

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/' },
  { label: 'Indicações', href: '/admin/referrals' },
  { label: 'Intenções', href: '/admin/intentions'},
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell navItems={ADMIN_NAV_ITEMS}>{children}</AdminShell>
  );
}
