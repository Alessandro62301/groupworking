'use client';

import { Control, Controller } from 'react-hook-form';
import clsx from 'clsx';

type Props = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
};

export function TextField({
  control, name, label, placeholder, type = 'text', required, multiline, rows = 3,
}: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-gray-800">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {multiline ? (
            <textarea
              {...field}
              rows={rows}
              placeholder={placeholder}
              className={clsx(
                'w-full rounded-xl border text-gray-900 bg-white px-3 py-2 text-sm outline-none',
                'border-gray-300 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600',
                fieldState.error && 'border-rose-400 focus:ring-rose-500/20'
              )}
            />
          ) : (
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              className={clsx(
                'w-full rounded-xl border text-gray-900 bg-white px-3 py-2 text-sm outline-none',
                'border-gray-300 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600',
                fieldState.error && 'border-rose-400 focus:ring-rose-500/20'
              )}
            />
          )}
          {fieldState.error && (
            <p className="text-xs text-rose-600">{String(fieldState.error.message)}</p>
          )}
        </div>
      )}
    />
  );
}
