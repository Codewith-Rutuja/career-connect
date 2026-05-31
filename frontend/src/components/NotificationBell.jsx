import { Bell, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNotifications, markNotificationRead } from "../services/api";
import { useAuth } from "../context/AuthContext";

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await fetchNotifications();
      setNotifications(response.notifications || []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((current) => current.map((item) => (item._id === id ? { ...item, read: true } : item)));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-[32px] border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Notifications</p>
              <span className="text-xs text-slate-500">Updated every 30s</span>
            </div>
            {notifications.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                No recent notifications yet.
              </div>
            ) : (
              notifications.slice(0, 6).map((notification) => (
                <div key={notification._id} className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-white dark:border-white/10 dark:bg-slate-900 dark:hover:border-brand-500 dark:hover:bg-slate-950">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{notification.message}</p>
                    </div>
                    {!notification.read && <CheckCircle2 size={16} className="text-brand-500" />}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    <button type="button" onClick={() => handleMarkRead(notification._id)} className="font-semibold text-brand-500 hover:underline">
                      Mark read
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className="mt-2 text-center">
              <Link to="/applications" className="text-sm font-semibold text-brand-500 hover:underline">
                View all applications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
