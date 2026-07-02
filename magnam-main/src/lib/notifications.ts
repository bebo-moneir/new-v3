import { useEffect, useState, useCallback } from 'react';
import { supabase, type Notification } from './supabase';
import { useAuth } from './auth';

export function useNotifications() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) {
      setNotifications(data as Notification[]);
      setUnread(data.filter((n) => !n.read).length);
    }
  }, [session]);

  useEffect(() => {
    load();
    if (!session) return;
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, session]);

  const markAllRead = async () => {
    if (!session) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false);
    load();
  };

  return { notifications, unread, markAllRead, reload: load };
}
