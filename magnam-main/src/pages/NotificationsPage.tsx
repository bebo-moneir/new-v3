import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../lib/notifications';
import { Card, PageLoader } from '../components/ui';
import { formatDate } from '../lib/helpers';

export function NotificationsPage() {
  const { notifications, markAllRead } = useNotifications();

  if (notifications.length === 0 && !notifications) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="btn-ghost text-sm">
            <CheckCheck className="size-4" />
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center text-slate-400">
          <Bell className="mx-auto mb-2 size-8 text-slate-300" />
          لا توجد إشعارات.
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={`flex items-start gap-3 ${!n.read ? 'border-r-4 border-r-primary-500' : ''}`}>
              <div className={`mt-1 size-2.5 shrink-0 rounded-full ${!n.read ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <div className="flex-1">
                <h3 className="font-semibold">{n.title}</h3>
                {n.body && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{n.body}</p>}
                <p className="mt-1.5 text-xs text-slate-400">{formatDate(n.created_at)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
