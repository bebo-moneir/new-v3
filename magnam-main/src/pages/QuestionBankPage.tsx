import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Trophy } from 'lucide-react';
import { supabase, type Subject, type Question } from '../lib/supabase';
import { Card, PageLoader } from '../components/ui';
import { yearLabels, semesterLabels, questionTypeLabels } from '../lib/helpers';

export function QuestionBankPage() {
  const [year, setYear] = useState<number | null>(null);
  const [semester, setSemester] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (year && semester) {
      setLoading(true);
      supabase
        .from('subjects')
        .select('*')
        .eq('year', year)
        .eq('semester', semester)
        .order('name')
        .then(({ data }) => {
          setSubjects((data as Subject[]) ?? []);
          setLoading(false);
        });
    } else {
      setSubjects([]);
    }
  }, [year, semester]);

  useEffect(() => {
    if (selectedSubject) {
      supabase
        .from('questions')
        .select('*')
        .eq('subject_id', selectedSubject.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setQuestions((data as Question[]) ?? []);
          setAnswers({});
          setSubmitted(false);
        });
    } else {
      setQuestions([]);
    }
  }, [selectedSubject]);

  const isCorrect = (q: Question) => {
    const ans = answers[q.id];
    if (!ans) return false;
    return ans.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
  };

  const submit = async () => {
    const correct = questions.filter(isCorrect).length;
    setScore(correct);
    setSubmitted(true);
    if (selectedSubject) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        for (const q of questions) {
          await supabase.from('question_attempts').insert({
            user_id: userData.user.id,
            question_id: q.id,
            user_answer: answers[q.id] ?? '',
            is_correct: isCorrect(q),
          });
        }
      }
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">بنك الأسئلة</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">اختر الفرقة</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((y) => (
              <button
                key={y}
                onClick={() => { setYear(y); setSemester(null); setSelectedSubject(null); }}
                className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-all ${
                  year === y ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
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
                    semester === s ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {semesterLabels[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {year && semester && (
        <>
          {subjects.length === 0 ? (
            <Card className="text-center text-slate-400">لا توجد مواد في هذا الترم.</Card>
          ) : (
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s)}
                  className={`card text-right transition-transform hover:-translate-y-0.5 ${selectedSubject?.id === s.id ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <h3 className="font-bold">{s.name}</h3>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {selectedSubject && (
        <div className="animate-slide-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{selectedSubject.name}</h2>
            {submitted && (
              <div className="flex items-center gap-2 rounded-xl bg-accent-50 px-4 py-2 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300">
                <Trophy className="size-5" />
                <span className="font-bold">{score} / {questions.length}</span>
              </div>
            )}
          </div>

          {questions.length === 0 ? (
            <Card className="text-center text-slate-400">لا توجد أسئلة في هذه المادة بعد.</Card>
          ) : (
            <>
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <Card key={q.id}>
                    <div className="mb-3 flex items-start gap-2">
                      <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                        {questionTypeLabels[q.question_type]}
                      </span>
                      {submitted && (
                        isCorrect(q)
                          ? <CheckCircle2 className="size-5 text-accent-500" />
                          : <XCircle className="size-5 text-error-500" />
                      )}
                    </div>
                    <p className="mb-3 font-medium">{idx + 1}. {q.question_text}</p>

                    {q.question_type === 'mcq' && q.options.length > 0 && (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <label
                            key={i}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors ${
                              answers[q.id] === opt
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                            } ${submitted && opt === q.correct_answer ? '!border-accent-500 !bg-accent-50 dark:!bg-accent-950/30' : ''}`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              disabled={submitted}
                              checked={answers[q.id] === opt}
                              onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                              className="accent-primary-600"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}

                    {q.question_type === 'true_false' && (
                      <div className="flex gap-2">
                        {['صح', 'خطأ'].map((opt) => (
                          <button
                            key={opt}
                            disabled={submitted}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                            className={`flex-1 rounded-lg border p-2.5 text-sm font-medium transition-colors ${
                              answers[q.id] === opt
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                            } ${submitted && opt === q.correct_answer ? '!border-accent-500 !bg-accent-50 dark:!bg-accent-950/30' : ''}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {(q.question_type === 'essay' || q.question_type === 'fill_blank' || q.question_type === 'reason') && (
                      <textarea
                        disabled={submitted}
                        value={answers[q.id] ?? ''}
                        onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                        placeholder="اكتب إجابتك..."
                        rows={3}
                        className="input"
                      />
                    )}

                    {submitted && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                        <p className="font-semibold text-accent-600 dark:text-accent-400">الإجابة الصحيحة: {q.correct_answer}</p>
                        {q.explanation && <p className="mt-1 text-slate-500 dark:text-slate-400">{q.explanation}</p>}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {!submitted ? (
                <button onClick={submit} className="btn-primary mt-6 w-full">
                  تسليم الإجابات
                </button>
              ) : (
                <button onClick={reset} className="btn-ghost mt-6 w-full">
                  <RefreshCw className="size-4" />
                  إعادة المحاولة
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
