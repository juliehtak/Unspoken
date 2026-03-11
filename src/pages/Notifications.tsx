import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, MessageCircle, Heart, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Notification } from '../types';
import { formatShortDate } from '../utils/dateUtils';
import { useAuth } from '../App';

const Notifications: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    if (!currentUser) return;
    setLoading(true);
    fetch(`/api/users/${currentUser.id}/notifications`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Notifications</h1>
        <p className="text-soft-white/60 mb-8">Please create a persona to view your notifications.</p>
        <Link to="/create-persona" className="px-8 py-3 bg-lavender text-navy-900 rounded-2xl font-bold hover:bg-lavender/90 transition-all">
          Create Persona
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-soft-white/40">Stay connected with the support you receive.</p>
        </div>
        <div className="glass px-4 py-2 rounded-2xl border border-white/5 text-sm font-medium flex items-center gap-2">
          <Bell size={16} className="text-lavender" />
          {notifications.filter(n => !n.is_read).length} Unread
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass h-24 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification, i) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => markAsRead(notification.id)}
              className={`glass p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                notification.is_read 
                  ? 'border-white/5 opacity-60' 
                  : 'border-lavender/30 bg-lavender/5 shadow-lg shadow-lavender/5'
              }`}
            >
              {!notification.is_read && (
                <div className="absolute top-0 left-0 w-1 h-full bg-lavender" />
              )}
              
              <Link to={`/post/${notification.post_id}`} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  notification.type === 'comment' ? 'bg-lavender/20 text-lavender' : 'bg-muted-pink/20 text-muted-pink'
                }`}>
                  {notification.type === 'comment' ? <MessageCircle size={24} /> : <Heart size={24} />}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-soft-white">
                      <span className="text-lavender">{notification.actor_username}</span> {notification.message}
                    </p>
                    <span className="text-[10px] text-soft-white/40 uppercase tracking-wider whitespace-nowrap ml-4">
                      {formatShortDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-soft-white/40 truncate italic">
                    "{notification.post_title}"
                  </p>
                </div>

                <ChevronRight size={20} className="text-soft-white/20 group-hover:text-lavender transition-colors flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass p-12 rounded-3xl text-center border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-soft-white/20" />
          </div>
          <h3 className="text-xl font-bold mb-2">All caught up</h3>
          <p className="text-soft-white/40">No new notifications at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
