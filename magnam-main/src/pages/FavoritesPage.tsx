import { useEffect, useState } from 'react';
import { Star, Eye } from 'lucide-react';
import { supabase, type Material } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { Card, PageLoader } from '../components/ui';
import { fileTypeMeta } from '../lib/helpers';

export function FavoritesPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [favorites, setFavorites] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      navigate('/login');
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('favorites')
        .select('material_id, materials!inner(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setFavorites((data?.map((d: any) => d.materials) as Material[]) ?? []);
      setLoading(false);
    })();
  }, [profile, navigate]);

  const remove = async (materialId: string) => {
    if (!profile) return;
    await supabase.from('favorites').delete().eq('user_id', profile.id).eq('material_id', materialId);
    setFavorites((prev) => prev.filter((f) => f.id !== materialId));
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">المفضلة</h1>

      {favorites.length === 0 ? (
        <Card className="text-center text-slate-400">
          لا توجد ملفات في المفضلة بعد. تصفّح المحاضرات وأضف ما تريد!
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((item) => {
            const meta = fileTypeMeta[item.file_type];
            const Icon = meta.icon;
            return (
              <Card key={item.id} className="flex items-center gap-3">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{item.title}</h3>
                </div>
                {item.file_url && (
                  <button onClick={() => window.open(item.file_url, '_blank')} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Eye className="size-4" />
                  </button>
                )}
                <button onClick={() => remove(item.id)} className="rounded-lg p-2 text-warning-500 hover:bg-warning-50 dark:hover:bg-warning-950/40">
                  <Star className="size-4 fill-warning-400" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
