import { useEffect, useState, useCallback } from 'react';
import { Download, Eye, Star, MessageSquare, FileText } from 'lucide-react';
import { supabase, type Subject } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { Card, PageLoader } from './ui';
import { fileTypeMeta, yearLabels, semesterLabels } from '../lib/helpers';
import { CommentsSection } from './CommentsSection';

type Props = {
  table: 'materials' | 'sessions' | 'summaries' | 'exams';
  title: string;
  extraColumn?: 'category';
  categoryLabels?: Record<string, string>;
};

export function ContentBrowser({ table, title, extraColumn, categoryLabels }: Props) {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [year, setYear] = useState<number | null>(null);
  const [semester, setSemester] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const loadSubjects = useCallback(async () => {
    let q = supabase.from('subjects').select('*').order('name');
    if (year) q = q.eq('year', year);
    if (semester) q = q.eq('semester', semester);
    const { data } = await q;
    setSubjects((data as Subject[]) ?? []);
  }, [year, semester]);

  const loadItems = useCallback(async (subjectId: string) => {
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
  }, [table]);

  const loadFavorites = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase.from('favorites').select('material_id').eq('user_id', profile.id);
    if (data) setFavorites(new Set(data.map((d) => d.material_id)));
  }, [profile]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    if (year && semester) {
      setLoading(true);
      loadSubjects().finally(() => setLoading(false));
    } else {
      setSubjects([]);
    }
  }, [year, semester, loadSubjects]);

  useEffect(() => {
    if (selectedSubject) loadItems(selectedSubject.id);
    else setItems([]);
  }, [selectedSubject, loadItems]);

  const toggleFavorite = async (materialId: string) => {
    if (!profile) {
      navigate('/login');
      return;
    }
    if (favorites.has(materialId)) {
      await supabase.from('favorites').delete().eq('user_id', profile.id).eq('material_id', materialId);
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(materialId);
        return next;
      });
    } else {
      await supabase.from('favorites').insert({ user_id: profile.id, material_id: materialId });
      setFavorites((prev) => new Set(prev).add(materialId));
    }
  };

  const handleDownload = async (item: any) => {
    await supabase.from(table).update({ downloads: item.downloads + 1 }).eq('id', item.id);
    if (item.file_url) window.open(item.file_url, '_blank');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>

      {/* Year + Semester selectors */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">اختر الفرقة</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((y) => (
              <button
                key={y}
                onClick={() => { setYear(y); setSemester(null); setSelectedSubject(null); }}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  year === y
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {yearLabels[y]}
              </button>
            ))}
          </div>
        </div>
        {year && (
          <div>
            <label className="mb-2 block text-sm font-medium">اختر الترم</label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => { setSemester(s); setSelectedSubject(null); }}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    semester === s
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {semesterLabels[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subjects */}
      {year && semester && (
        <>
          {subjects.length === 0 ? (
            <Card className="text-center text-slate-400">لا توجد مواد في هذا الترم بعد.</Card>
          ) : (
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s)}
                  className={`card text-right transition-transform hover:-translate-y-0.5 ${
                    selectedSubject?.id === s.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <h3 className="font-bold">{s.name}</h3>
                  {s.doctor && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">د. {s.doctor}</p>}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Items */}
      {selectedSubject && (
        <div className="animate-slide-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {selectedSubject.name} — {semesterLabels[selectedSubject.semester]}
            </h2>
            <button onClick={() => setSelectedSubject(null)} className="text-sm text-primary-600 hover:underline dark:text-primary-400">
              رجوع للمواد
            </button>
          </div>

          {items.length === 0 ? (
            <Card className="text-center text-slate-400">لا يوجد محتوى في هذه المادة بعد.</Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const meta = fileTypeMeta[item.file_type as keyof typeof fileTypeMeta];
                const Icon = meta.icon;
                return (
                  <Card key={item.id} className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold leading-tight">{item.title}</h3>
                        {extraColumn && item.category && categoryLabels && (
                          <span className="badge mt-1 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                            {categoryLabels[item.category]}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                    )}
                    <div className="mt-auto flex items-center gap-2">
                      <button onClick={() => handleDownload(item)} className="btn-ghost flex-1 text-sm">
                        <Download className="size-4" />
                        تحميل
                      </button>
                      {item.file_url && (
                        <button onClick={() => window.open(item.file_url, '_blank')} className="btn-ghost text-sm" title="مشاهدة">
                          <Eye className="size-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="المفضلة"
                      >
                        <Star className={`size-4 ${favorites.has(item.id) ? 'fill-warning-400 text-warning-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="التعليقات"
                      >
                        <MessageSquare className="size-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Comments modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <FileText className="size-5" />
                {selectedItem.title}
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <CommentsSection materialId={selectedItem.id} />
          </div>
        </div>
      )}
    </div>
  );
}
