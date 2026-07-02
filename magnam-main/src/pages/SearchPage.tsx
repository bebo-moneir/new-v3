import { useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui';
import { fileTypeMeta, yearLabels, semesterLabels } from '../lib/helpers';

type Result = {
  id: string;
  title: string;
  file_type: string;
  file_url: string;
  subject_name: string;
  doctor: string;
  year: number;
  semester: number;
  source: string;
};

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, doctor, year, semester')
      .or(`name.ilike.%${query}%,doctor.ilike.%${query}%`);

    const subjectMap = new Map((subjects ?? []).map((s: any) => [s.id, s]));

    const tables = ['materials', 'sessions', 'summaries', 'exams'] as const;
    const all: Result[] = [];

    for (const t of tables) {
      const { data } = await supabase
        .from(t)
        .select('id, title, file_type, file_url, subject_id')
        .ilike('title', `%${query}%`);
      for (const item of (data ?? [])) {
        const subj = subjectMap.get((item as any).subject_id);
        if (subj) {
          all.push({
            id: item.id,
            title: item.title,
            file_type: item.file_type,
            file_url: item.file_url,
            subject_name: subj.name,
            doctor: subj.doctor,
            year: subj.year,
            semester: subj.semester,
            source: t,
          });
        }
      }
    }

    setResults(all);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">البحث</h1>

      <form onSubmit={search} className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم المادة، الدكتور، أو اسم الملف..."
            className="input pr-11 text-base"
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary mt-3 w-full">بحث</button>
      </form>

      {loading && <p className="text-center text-slate-400">جارٍ البحث...</p>}

      {!loading && searched && results.length === 0 && (
        <Card className="text-center text-slate-400">لا توجد نتائج مطابقة.</Card>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => {
            const meta = fileTypeMeta[r.file_type as keyof typeof fileTypeMeta];
            const Icon = meta.icon;
            return (
              <Card key={`${r.source}-${r.id}`} className="flex items-center gap-3">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{r.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {r.subject_name} — د. {r.doctor} — {yearLabels[r.year]} / {semesterLabels[r.semester]}
                  </p>
                </div>
                {r.file_url && (
                  <div className="flex gap-1">
                    <button onClick={() => window.open(r.file_url, '_blank')} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="مشاهدة">
                      <Eye className="size-4" />
                    </button>
                    <button onClick={() => window.open(r.file_url, '_blank')} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="تحميل">
                      <Download className="size-4" />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
