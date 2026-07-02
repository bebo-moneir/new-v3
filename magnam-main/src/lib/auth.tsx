import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from './supabase';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithCode: (code: string, email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (!error && data) setProfile(data as Profile);
    else setProfile(null);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession) {
        (async () => {
          await loadProfile(newSession.user.id);
          if (mounted) setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithCode = async (code: string, email: string, password: string, fullName: string) => {
    const { data: codeRow, error: codeErr } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', code.trim())
      .is('used_by', null)
      .maybeSingle();

    if (codeErr) return { error: 'حدث خطأ أثناء التحقق من الكود.' };
    if (!codeRow) return { error: 'الكود غير صالح أو تم استخدامه بالفعل.' };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, invite_code: code.trim(), invite_role: codeRow.role } },
    });
    if (error) return { error: error.message };

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from('profiles').update({ role: codeRow.role }).eq('id', userData.user.id);
      await supabase.from('invite_codes').update({ used_by: userData.user.id, used_at: new Date().toISOString() }).eq('id', codeRow.id);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (session) await loadProfile(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signIn, signUpWithCode, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
