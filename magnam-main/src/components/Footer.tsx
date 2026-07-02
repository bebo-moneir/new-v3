import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white">
            <GraduationCap className="size-4" />
          </div>
          <span className="font-bold">منصة دفعة تكنولوجيا الأغذية</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          منصة تعليمية مخصصة لطلاب دفعة تكنولوجيا الأغذية — كل المحتوى في مكان واحد.
        </p>
      </div>
    </footer>
  );
}
