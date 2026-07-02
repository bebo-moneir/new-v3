import { type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type Variant = 'success' | 'error' | 'info' | 'warning';

const variants: Record<Variant, { icon: typeof Info; base: string }> = {
  success: { icon: CheckCircle, base: 'bg-accent-50 border-accent-300 text-accent-800 dark:bg-accent-950/40 dark:border-accent-800 dark:text-accent-300' },
  error: { icon: XCircle, base: 'bg-error-50 border-error-300 text-error-800 dark:bg-error-950/40 dark:border-error-800 dark:text-error-300' },
  info: { icon: Info, base: 'bg-primary-50 border-primary-300 text-primary-800 dark:bg-primary-950/40 dark:border-primary-800 dark:text-primary-300' },
  warning: { icon: AlertCircle, base: 'bg-warning-50 border-warning-300 text-warning-800 dark:bg-warning-950/40 dark:border-warning-800 dark:text-warning-300' },
};

export function Alert({ variant, children }: { variant: Variant; children: ReactNode }) {
  const { icon: Icon, base } = variants[variant];
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${base}`}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
