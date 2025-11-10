import type { ReactNode } from 'react';

import { MemberShell } from '@/components/layout/member-shell';

const MEMBER_NAV_ITEMS = [{ label: 'Indicações', href: '/member/referrals' }];

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <MemberShell navItems={MEMBER_NAV_ITEMS}>{children}</MemberShell>;
}
