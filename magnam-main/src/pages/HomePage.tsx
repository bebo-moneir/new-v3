import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, FileText, HelpCircle, Search, ArrowLeft, Sparkles, Bell } from 'lucide-react';
import { supabase, type Material, type SessionItem, type Summary, type Announcement, type FileType } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { Card } from '../components/ui';
import { fileTypeMeta, formatDate } from '../lib/helpers';

export function HomePage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionItem[]>([]);
  const [recentSummaries, setRecentSummaries] = useState<Summary[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    (async () => {
      const [m, s, su, a] = await Promise.all([
        supabase.from('materials').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('sessions').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('summaries').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
      ]);
      if (m.data) setRecentMaterials(m.data as Material[]);
      if (s.data) setRecentSessions(s.data as SessionItem[]);
      if (su.data) setRecentSummaries(su.data as Summary[]);
      if (a.data) setAnnouncements(a.data as Announcement[]);
    })();
  }, []);

  const features = [
    { icon: BookOpen, title: 'المحاضرات', desc: 'PDF، PowerPoint، فيديوهات، تسجيلات صوتية', to: '/lectures', color: 'from-primary-500 to-primary-700' },
    { icon: FileText, title: 'السكاشن', desc: 'ملفات وحلول السكاشن', to: '/sessions', color: 'from-accent-500 to-accent-700' },
    { icon: GraduationCap, title: 'الملخصات', desc: 'ملخصات الدكاترة والطلبة والخرائط الذهنية', to: '/summaries', color: 'from-amber-500 to-orange-600' },
    { icon: FileText, title: 'الامتحانات', desc: 'Midterm، Final، Quiz، سنوات سابقة', to: '/exams', color: 'from-rose-500 to-red-600' },
    { icon: HelpCircle, title: 'بنك الأسئلة', desc: 'حل أونلاين مع تصحيح تلقائي', to: '/question-bank', color: 'from-violet-500 to-purple-600' },
    { icon: Search, title: 'البحث', desc: 'بحث سريع في المواد والملفات', to: '/search', color: 'from-sky-500 to-blue-600' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm ring-1 ring-white/20">
            <Sparkles className="size-4" />
            منصة تعليمية متكاملة لدفعتك
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            منصة دفعة تكنولوجيا الأغذية
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
            كل محاضراتك وسكاشنك وملخصاتك وامتحاناتك في مكان واحد — منظّمة حسب الفرقة والترم،
            مع بنك أسئلة للحل أونلاين وتصحيح تلقائي.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {!profile && (
              <button onClick={() => navigate('/login')} className="btn bg-white text-primary-700 hover:bg-primary-50">
                ابدأ الآن
                <ArrowLeft className="size-4" />
              </button>
            )}
            <button onClick={() => navigate('/lectures')} className="btn bg-white/10 text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/20">
              تصفّح المحتوى
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="size-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-xl font-bold">الإعلانات</h2>
            </div>
            <div className="space-y-3">
              {announcements.map((a) => (
                <Card key={a.id} className="border-r-4 border-r-primary-500">
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{a.body}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(a.created_at)}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        <section className="mt-12">
          <h2 className="mb-6 text-center text-2xl font-bold">أقسام المنصة</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.to}
                  onClick={() => navigate(f.to)}
                  className="group card text-right transition-transform hover:-translate-y-1"
                >
                  <div className={`mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent content */}
        <section className="mt-12 grid gap-8 lg:grid-cols-3">
          <RecentColumn title="آخر المحاضرات" items={recentMaterials} empty="لا توجد محاضرات بعد" />
          <RecentColumn title="آخر السكاشن" items={recentSessions} empty="لا توجد سكاشن بعد" />
          <RecentColumn title="آخر الملخصات" items={recentSummaries} empty="لا توجد ملخصات بعد" />
        </section>
      </div>
    </div>
  );
}

function RecentColumn({ title, items, empty }: { title: string; items: { id: string; title: string; file_type: FileType; created_at: string }[]; empty: string }) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = fileTypeMeta[item.file_type];
            const Icon = meta.icon;
            return (
              <Card key={item.id} className="flex items-center gap-3 p-4">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.created_at)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
