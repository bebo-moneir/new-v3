import { useEffect, useState } from 'react';
import {
  BookOpen, FileText, HelpCircle, Users, Megaphone, BarChart3,
  Plus, Trash2, Edit2, X, Upload, Ban, CheckCircle2, KeyRound, Copy, Check,
} from 'lucide-react';
import { supabase, type Subject, type Profile, type QuestionType, type InviteCode } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Card, PageLoader, Spinner } from '../components/ui';
import { yearLabels, semesterLabels, summaryCategoryLabels, examCategoryLabels, questionTypeLabels } from '../lib/helpers';

type Tab = 'subjects' | 'materials' | 'questions' | 'users' | 'announcements' | 'stats' | 'codes';

export function AdminPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>('subjects');

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Card>
          <p className="text-slate-500">هذه الصفحة مخصصة للأدمن فقط.</p>
        </Card>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: 'subjects', label: 'المواد', icon: BookOpen },
    { id: 'materials', label: 'الملفات', icon: FileText },
    { id: 'questions', label: 'الأسئلة', icon: HelpCircle },
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'announcements', label: 'الإعلانات', icon: Megaphone },
    { id: 'stats', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'codes', label: 'أكواد الدعوة', icon: KeyRound },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">لوحة الأدمن</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'subjects' && <SubjectsManager />}
      {tab === 'materials' && <MaterialsManager />}
      {tab === 'questions' && <QuestionsManager />}
      {tab === 'users' && <UsersManager />}
      {tab === 'announcements' && <AnnouncementsManager />}
      {tab === 'stats' && <StatsPanel />}
      {tab === 'codes' && <CodesManager />}
    </div>
  );
}

// ============ Invite Codes ============
function CodesManager() {
  const { profile } = useAuth();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from('invite_codes').select('*').order('created_at', { ascending: false });
    setCodes((data as InviteCode[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    const newCodes: any[] = [];
    for (let i = 0; i < count; i++) {
      const code = generateCode();
      newCodes.push({ code, role, created_by: profile?.id });
    }
    await supabase.from('invite_codes').insert(newCodes);
    setGenerating(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('invite_codes').delete().eq('id', id);
    load();
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <Card className="mb-6">
        <h3 className="mb-4 font-bold">توليد أكواد دعوة</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">نوع الحساب</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="student">طالب</option>
              <option value="admin">أدمن فرعي</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">العدد</label>
            <input type="number" min={1} max={50} className="input w-24" value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, +e.target.value)))} />
          </div>
          <button onClick={generate} disabled={generating} className="btn-primary">
            {generating ? <Spinner className="size-5" /> : <><Plus className="size-4" /> توليد</>}
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {codes.length === 0 ? (
          <Card className="text-center text-slate-400">لا توجد أكواد بعد.</Card>
        ) : (
          codes.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-xl ${c.role === 'admin' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40' : 'bg-accent-50 text-accent-600 dark:bg-accent-950/40'}`}>
                  <KeyRound className="size-5" />
                </div>
                <div>
                  <p className="font-mono text-lg font-bold tracking-wider">{c.code}</p>
                  <p className="text-xs text-slate-400">
                    {c.role === 'admin' ? 'أدمن فرعي' : 'طالب'}
                    {c.used_by ? ' — مستخدم' : ' — متاح'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {!c.used_by && (
                  <button onClick={() => copy(c.code)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="نسخ">
                    {copied === c.code ? <Check className="size-4 text-accent-500" /> : <Copy className="size-4" />}
                  </button>
                )}
                <button onClick={() => remove(c.id)} className="rounded-lg p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-950/40">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============ Subjects ============
function SubjectsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('subjects').select('*').order('year, semester, name');
    setSubjects((data as Subject[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم حذف كل محتواها.')) return;
    await supabase.from('subjects').delete().eq('id', id);
    load();
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-sm">
          <Plus className="size-4" />
          إضافة مادة
        </button>
      </div>

      {showForm && (
        <SubjectForm
          subject={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <Card key={s.id} className="flex items-start justify-between">
            <div>
              <h3 className="font-bold">{s.name}</h3>
              {s.doctor && <p className="text-sm text-slate-500">د. {s.doctor}</p>}
              <p className="mt-1 text-xs text-slate-400">{yearLabels[s.year]} — {semesterLabels[s.semester]}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(s); setShowForm(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Edit2 className="size-4" />
              </button>
              <button onClick={() => remove(s.id)} className="rounded-lg p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-950/40">
                <Trash2 className="size-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SubjectForm({ subject, onClose, onSaved }: { subject: Subject | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(subject?.name ?? '');
  const [doctor, setDoctor] = useState(subject?.doctor ?? '');
  const [year, setYear] = useState(subject?.year ?? 1);
  const [semester, setSemester] = useState(subject?.semester ?? 1);
  const [description, setDescription] = useState(subject?.description ?? '');
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (subject) {
      await supabase.from('subjects').update({ name, doctor, year, semester, description }).eq('id', subject.id);
    } else {
      await supabase.from('subjects').insert({ name, doctor, year, semester, description });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Card className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">{subject ? 'تعديل مادة' : 'إضافة مادة'}</h3>
        <button onClick={onClose}><X className="size-5 text-slate-400" /></button>
      </div>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="اسم المادة" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input" placeholder="اسم الدكتور" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
        <select className="input" value={year} onChange={(e) => setYear(+e.target.value)}>
          {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{yearLabels[y]}</option>)}
        </select>
        <select className="input" value={semester} onChange={(e) => setSemester(+e.target.value)}>
          <option value={1}>{semesterLabels[1]}</option>
          <option value={2}>{semesterLabels[2]}</option>
        </select>
        <textarea className="input sm:col-span-2" placeholder="وصف المادة" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <button type="submit" disabled={saving} className="btn-primary sm:col-span-2">
          {saving ? <Spinner className="size-5" /> : 'حفظ'}
        </button>
      </form>
    </Card>
  );
}

// ============ Materials ============
function MaterialsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [table, setTable] = useState<'materials' | 'sessions' | 'summaries' | 'exams'>('materials');
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.from('subjects').select('*').order('name').then(({ data }) => setSubjects((data as Subject[]) ?? []));
  }, []);

  useEffect(() => {
    if (subjectId) {
      supabase.from(table).select('*').eq('subject_id', subjectId).order('created_at', { ascending: false }).then(({ data }) => setItems(data ?? []));
    } else setItems([]);
  }, [subjectId, table]);

  const remove = async (id: string) => {
    if (!confirm('حذف هذا الملف؟')) return;
    await supabase.from(table).delete().eq('id', id);
    if (subjectId) supabase.from(table).select('*').eq('subject_id', subjectId).then(({ data }) => setItems(data ?? []));
  };

  const tableLabels: Record<string, string> = { materials: 'محاضرات', sessions: 'سكاشن', summaries: 'ملخصات', exams: 'امتحانات' };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <select className="input max-w-xs" value={table} onChange={(e) => setTable(e.target.value as any)}>
          {Object.entries(tableLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input max-w-xs" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">اختر مادة</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={() => setShowForm(true)} disabled={!subjectId} className="btn-primary text-sm">
          <Plus className="size-4" />
          إضافة ملف
        </button>
      </div>

      {showForm && subjectId && (
        <MaterialForm table={table} subjectId={subjectId} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); supabase.from(table).select('*').eq('subject_id', subjectId).then(({ data }) => setItems(data ?? [])); }} />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.file_type} — {item.downloads} تحميل</p>
            </div>
            <button onClick={() => remove(item.id)} className="rounded-lg p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-950/40">
              <Trash2 className="size-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MaterialForm({ table, subjectId, onClose, onSaved }: { table: string; subjectId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const hasCategory = table === 'summaries' || table === 'exams';
  const categories = table === 'summaries' ? summaryCategoryLabels : table === 'exams' ? examCategoryLabels : {};

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = { subject_id: subjectId, title, file_type: fileType, file_url: fileUrl, description };
    if (hasCategory && category) payload.category = category;
    await supabase.from(table).insert(payload);
    setSaving(false);
    onSaved();
  };

  return (
    <Card className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">إضافة ملف</h3>
        <button onClick={onClose}><X className="size-5 text-slate-400" /></button>
      </div>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        <input className="input sm:col-span-2" placeholder="عنوان الملف" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select className="input" value={fileType} onChange={(e) => setFileType(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="pptx">PowerPoint</option>
          <option value="video">فيديو</option>
          <option value="audio">صوت</option>
          <option value="image">صورة</option>
          <option value="link">رابط</option>
        </select>
        {hasCategory && (
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">اختر التصنيف</option>
            {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
        <input className="input sm:col-span-2" placeholder="رابط الملف (URL)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required />
        <textarea className="input sm:col-span-2" placeholder="وصف" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <button type="submit" disabled={saving} className="btn-primary sm:col-span-2">
          {saving ? <Spinner className="size-5" /> : <><Upload className="size-4" /> رفع</>}
        </button>
      </form>
    </Card>
  );
}

// ============ Questions ============
function QuestionsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.from('subjects').select('*').order('name').then(({ data }) => setSubjects((data as Subject[]) ?? []));
  }, []);

  useEffect(() => {
    if (subjectId) {
      supabase.from('questions').select('*').eq('subject_id', subjectId).order('created_at', { ascending: false }).then(({ data }) => setQuestions(data ?? []));
    } else setQuestions([]);
  }, [subjectId]);

  const remove = async (id: string) => {
    if (!confirm('حذف هذا السؤال؟')) return;
    await supabase.from('questions').delete().eq('id', id);
    supabase.from('questions').select('*').eq('subject_id', subjectId).then(({ data }) => setQuestions(data ?? []));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <select className="input max-w-xs" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">اختر مادة</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={() => setShowForm(true)} disabled={!subjectId} className="btn-primary text-sm">
          <Plus className="size-4" />
          إضافة سؤال
        </button>
      </div>

      {showForm && subjectId && (
        <QuestionForm subjectId={subjectId} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); supabase.from('questions').select('*').eq('subject_id', subjectId).then(({ data }) => setQuestions(data ?? [])); }} />
      )}

      <div className="space-y-3">
        {questions.map((q) => (
          <Card key={q.id} className="flex items-start justify-between">
            <div>
              <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">{questionTypeLabels[q.question_type]}</span>
              <p className="mt-2 font-medium">{q.question_text}</p>
              <p className="mt-1 text-sm text-accent-600 dark:text-accent-400">الإجابة: {q.correct_answer}</p>
            </div>
            <button onClick={() => remove(q.id)} className="rounded-lg p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-950/40">
              <Trash2 className="size-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuestionForm({ subjectId, onClose, onSaved }: { subjectId: string; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<QuestionType>('mcq');
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState('');
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const opts = type === 'mcq' ? options.filter((o) => o.trim()) : type === 'true_false' ? ['صح', 'خطأ'] : [];
    await supabase.from('questions').insert({
      subject_id: subjectId,
      question_type: type,
      question_text: text,
      options: opts,
      correct_answer: correct,
      explanation,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <Card className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">إضافة سؤال</h3>
        <button onClick={onClose}><X className="size-5 text-slate-400" /></button>
      </div>
      <form onSubmit={save} className="grid gap-3">
        <select className="input" value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
          {Object.entries(questionTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <textarea className="input" placeholder="نص السؤال" value={text} onChange={(e) => setText(e.target.value)} required rows={2} />
        {type === 'mcq' && (
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt, i) => (
              <input key={i} className="input" placeholder={`خيار ${i + 1}`} value={opt} onChange={(e) => setOptions((prev) => prev.map((p, j) => j === i ? e.target.value : p))} />
            ))}
          </div>
        )}
        {type === 'true_false' && (
          <select className="input" value={correct} onChange={(e) => setCorrect(e.target.value)} required>
            <option value="">الإجابة الصحيحة</option>
            <option value="صح">صح</option>
            <option value="خطأ">خطأ</option>
          </select>
        )}
        <input className="input" placeholder="الإجابة الصحيحة" value={correct} onChange={(e) => setCorrect(e.target.value)} required={type !== 'true_false'} />
        <textarea className="input" placeholder="شرح الإجابة (اختياري)" value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner className="size-5" /> : 'حفظ'}
        </button>
      </form>
    </Card>
  );
}

// ============ Users ============
function UsersManager() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleBan = async (u: Profile) => {
    await supabase.from('profiles').update({ banned: !u.banned }).eq('id', u.id);
    load();
  };

  const setRole = async (u: Profile, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', u.id);
    load();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{u.full_name || u.email}</p>
            <p className="text-sm text-slate-500">{u.email}</p>
            <span className={`badge mt-1 ${u.banned ? 'bg-error-100 text-error-700 dark:bg-error-950/40 dark:text-error-300' : 'bg-accent-100 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300'}`}>
              {u.banned ? 'محظور' : 'نشط'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="input max-w-[140px] py-1.5 text-sm" value={u.role} onChange={(e) => setRole(u, e.target.value)}>
              <option value="student">طالب</option>
              <option value="admin">أدمن</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <button onClick={() => toggleBan(u)} className={`btn text-sm ${u.banned ? 'btn-accent' : 'btn-ghost'}`}>
              {u.banned ? <><CheckCircle2 className="size-4" /> إلغاء الحظر</> : <><Ban className="size-4" /> حظر</>}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============ Announcements ============
function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await supabase.from('announcements').insert({ title, body });
    setTitle('');
    setBody('');
    setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    load();
  };

  const broadcast = async () => {
    if (!confirm('إرسال إشعار لكل الطلاب؟')) return;
    const { data: students } = await supabase.from('profiles').select('id').eq('role', 'student');
    if (students && students.length > 0) {
      const rows = students.map((s: any) => ({ user_id: s.id, title: title || 'إشعار جديد', body }));
      await supabase.from('notifications').insert(rows);
      alert('تم إرسال الإشعار لكل الطلاب.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="mb-4 font-bold">إضافة إعلان</h3>
        <form onSubmit={add} className="space-y-3">
          <input className="input" placeholder="عنوان الإعلان" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="input" placeholder="نص الإعلان" value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner className="size-5" /> : 'نشر'}
            </button>
            <button type="button" onClick={broadcast} className="btn-accent">
              <Megaphone className="size-4" />
              إشعار للكل
            </button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id} className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{a.title}</h3>
              {a.body && <p className="text-sm text-slate-500">{a.body}</p>}
            </div>
            <button onClick={() => remove(a.id)} className="rounded-lg p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-950/40">
              <Trash2 className="size-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ Stats ============
function StatsPanel() {
  const [stats, setStats] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [subs, mats, sess, sums, exs, qs, users, visits] = await Promise.all([
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('materials').select('*', { count: 'exact', head: true }),
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        supabase.from('summaries').select('*', { count: 'exact', head: true }),
        supabase.from('exams').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }),
      ]);
      setStats([
        { label: 'المواد', value: subs.count ?? 0 },
        { label: 'المحاضرات', value: mats.count ?? 0 },
        { label: 'السكاشن', value: sess.count ?? 0 },
        { label: 'الملخصات', value: sums.count ?? 0 },
        { label: 'الامتحانات', value: exs.count ?? 0 },
        { label: 'الأسئلة', value: qs.count ?? 0 },
        { label: 'المستخدمون', value: users.count ?? 0 },
        { label: 'الزيارات', value: visits.count ?? 0 },
      ]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="text-center">
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{s.value}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}
