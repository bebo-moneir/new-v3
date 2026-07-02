import { useState } from 'react';
import {
  Home, BookOpen, FileText, GraduationCap, HelpCircle, Search,
  Bell, Star, Settings, Menu, X, LogOut, Moon, Sun, Shield,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { useRouter } from '../lib/router';
import { useNotifications } from '../lib/notifications';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { path, navigate } = useRouter();
  const { unread } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  const links = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/lectures', label: 'المحاضرات', icon: BookOpen },
    { to: '/sessions', label: 'السكاشن', icon: FileText },
    { to: '/summaries', label: 'الملخصات', icon: GraduationCap },
    { to: '/exams', label: 'الامتحانات', icon: FileText },
    { to: '/question-bank', label: 'بنك الأسئلة', icon: HelpCircle },
    { to: '/search', label: 'البحث', icon: Search },
    { to: '/favorites', label: 'المفضلة', icon: Star },
  ];

  const isActive = (to: string) => (to === '/' ? path === '/' : path.startsWith(to));

  const handleNav = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <button onClick={() => handleNav('/')} className="flex items-center gap-2 shrink-0">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30">
            <GraduationCap className="size-5" />
          </div>
          <span className="hidden text-sm font-bold sm:block">منصة دفعة تكنولوجيا الأغذية</span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <button
                key={l.to}
                onClick={() => handleNav(l.to)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(l.to)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="size-4" />
                {l.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <button
              onClick={() => handleNav('/notifications')}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          )}

          <button
            onClick={toggle}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          {profile ? (
            <div className="hidden items-center gap-2 sm:flex">
              {isAdmin && (
                <button
                  onClick={() => handleNav('/admin')}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Shield className="size-4" />
                  لوحة الأدمن
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                title="تسجيل الخروج"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          ) : (
            <button onClick={() => handleNav('/login')} className="btn-primary text-sm">
              تسجيل الدخول
            </button>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.to}
                  onClick={() => handleNav(l.to)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(l.to)
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="size-4" />
                  {l.label}
                </button>
              );
            })}
            {profile && isAdmin && (
              <button
                onClick={() => handleNav('/admin')}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Settings className="size-4" />
                لوحة الأدمن
              </button>
            )}
            {profile && (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-950/40"
              >
                <LogOut className="size-4" />
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
