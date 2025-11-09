'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';

type HeaderPayload = {
  title?: string;
  subtitle?: string;
};

type AdminHeaderContextValue = {
  setHeader: (payload: HeaderPayload) => void;
};

const AdminHeaderContext = createContext<AdminHeaderContextValue | null>(null);

type AdminHeaderProviderProps = {
  children: ReactNode;
  value: AdminHeaderContextValue;
};

export function AdminHeaderProvider({ children, value }: AdminHeaderProviderProps) {
  return <AdminHeaderContext.Provider value={value}>{children}</AdminHeaderContext.Provider>;
}

export function useAdminHeader(payload: HeaderPayload) {
  const context = useContext(AdminHeaderContext);

  useEffect(() => {
    if (!context) {
      return;
    }
    context.setHeader(payload);
  }, [context, payload.title, payload.subtitle]);
}
