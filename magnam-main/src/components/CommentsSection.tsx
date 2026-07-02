import { useEffect, useState } from 'react';
import { Star, Send, Trash2 } from 'lucide-react';
import { supabase, type Comment } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { Alert } from './Alert';
import { formatDate } from '../lib/helpers';

export function CommentsSection({ materialId }: { materialId: string }) {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey(full_name)')
      .eq('material_id', materialId)
      .order('created_at', { ascending: false });
    setComments((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [materialId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      navigate('/login');
      return;
    }
    if (!body.trim() && rating === 0) return;
    setError(null);
    const { error } = await supabase.from('comments').insert({
      material_id: materialId,
      user_id: profile.id,
      body: body.trim(),
      rating,
    });
    if (error) setError(error.message);
    else {
      setBody('');
      setRating(0);
      load();
    }
  };

  const remove = async (id: string) => {
    await supabase.from('comments').delete().eq('id', id);
    load();
  };

  return (
    <div>
      {error && <div className="mb-3"><Alert variant="error">{error}</Alert></div>}

      <form onSubmit={submit} className="mb-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
        <div className="mb-3 flex items-center gap-1">
          <span className="ml-2 text-sm font-medium">تقييمك:</span>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
            >
              <Star className={`size-5 ${(hover || rating) >= s ? 'fill-warning-400 text-warning-400' : 'text-slate-300 dark:text-slate-600'}`} />
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="اكتب تعليقك..."
          rows={2}
          className="input mb-2"
        />
        <button type="submit" className="btn-primary text-sm">
          <Send className="size-4" />
          إرسال
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">جارٍ التحميل...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c: any) => (
            <div key={c.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{c.profiles?.full_name || 'طالب'}</span>
                  {c.rating > 0 && (
                    <div className="flex">
                      {Array.from({ length: c.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-warning-400 text-warning-400" />
                      ))}
                    </div>
                  )}
                </div>
                {profile?.id === c.user_id && (
                  <button onClick={() => remove(c.id)} className="text-slate-400 hover:text-error-500">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              {c.body && <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{c.body}</p>}
              <p className="mt-1 text-xs text-slate-400">{formatDate(c.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
