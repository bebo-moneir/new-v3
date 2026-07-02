import { useState } from 'react';
import { GraduationCap, Mail, Lock, User, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { supabase } from '../lib/supabase';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/ui';

type Mode = 'login' | 'signup' | 'reset';

export function AuthPage() {
  const { signIn, signUpWithCode } = useAuth();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('/');
    } else if (mode === 'signup') {
      const { error } = await signUpWithCode(code, email, password, fullName);
      if (error) setError(error);
      else {
        setInfo('تم إنشاء الحساب بنجاح! سجّل دخولك الآن.');
        setMode('login');
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setInfo('تم إرسال رابط استعادة كلمة المرور إلى بريدك.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/30 px-4 py-12 dark:from-slate-950 dark:via-primary-950/20 dark:to-accent-950/20">
      <div className="w-full max-w-md animate-scale-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/30">
            <GraduationCap className="size-8" />
          </div>
          <h1 className="text-2xl font-bold">منصة دفعة تكنولوجيا الأغذية</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' && 'سجّل دخولك للوصول إلى المحتوى'}
            {mode === 'signup' && 'إنشاء حساب جديد (يتطلب كود دعوة)'}
            {mode === 'reset' && 'استعادة كلمة المرور'}
          </p>
        </div>

        <div className="card">
          {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}
          {info && <div className="mb-4"><Alert variant="success">{info}</Alert></div>}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">كود الدعوة (إجباري)</label>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="أدخل كود الدعوة"
                      className="input pr-10 uppercase font-mono tracking-wider"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">لا يمكن إنشاء حساب بدون كود دعوة صالح من الأدمن.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="اسمك الكامل"
                      className="input pr-10"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="input pr-10"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-10"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner className="size-5" /> : (
                <>
                  {mode === 'login' && 'تسجيل الدخول'}
                  {mode === 'signup' && 'إنشاء الحساب'}
                  {mode === 'reset' && 'إرسال رابط الاستعادة'}
                  <ArrowRight className="size-4 rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            {mode === 'login' && (
              <>
                <p className="text-slate-500 dark:text-slate-400">
                  ليس لديك حساب؟{' '}
                  <button onClick={() => setMode('signup')} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
                    إنشاء حساب بكود دعوة
                  </button>
                </p>
                <button onClick={() => setMode('reset')} className="block text-slate-500 hover:underline dark:text-slate-400">
                  نسيت كلمة المرور؟
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button onClick={() => setMode('login')} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
                لديك حساب؟ سجّل الدخول
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => setMode('login')} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
                العودة لتسجيل الدخول
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-100/60 p-3 text-center text-xs text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
          <p className="font-semibold">حساب الأدمن الأساسي</p>
          <p className="mt-1">البريد: admin@foodtech.edu — كلمة المرور: Admin@2024</p>
        </div>
      </div>
    </div>
  );
}
