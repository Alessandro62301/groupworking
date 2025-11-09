import * as React from 'react';
import clsx from 'clsx';

export function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx('bg-white rounded-2xl shadow-sm border border-gray-200', className)}>
      {children}
    </div>
  );
}
