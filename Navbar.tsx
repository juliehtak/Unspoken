import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Home, BookOpen, PlusCircle, Bell, User as UserIcon, Layout } from 'lucide-react';
import { useAuth } from '../App';
import { Avatar } from './Avatar';

export const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (!currentUser) return;

    const fetchUnread = () => {
      fetch(`/api/users/${currentUser.id}/notifications/unread-count`)
        .then(res => res.json())
        .then(data => setUnreadCount(data.count || 0))
        .catch(err => console.error(err));
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [currentUser, location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 px-4 md:px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Heart className="text-navy-900 fill-navy-900" size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-soft-white hidden sm:block">Unspoken</span>
      </Link>

      <div className="flex items-center gap-1 md:gap-2">
        <NavLink to="/home" icon={<Home size={20} />} label="Feed" active={isActive('/home')} />
        
        {currentUser && (
          <>
            <NavLink to="/my-posts" icon={<Layout size={20} />} label="My Posts" active={isActive('/my-posts')} />
            <NavLink 
              to="/notifications" 
              icon={
                <div className="relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-muted-pink text-white text-[10px] flex items-center justify-center rounded-full font-bold border border-navy-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              } 
              label="Notifications" 
              active={isActive('/notifications')} 
            />
          </>
        )}
        
        <NavLink to="/resources" icon={<BookOpen size={20} />} label="Resources" active={isActive('/resources')} />
        
        {currentUser ? (
          <>
            <Link 
              to="/create-post" 
              className="flex items-center gap-2 px-4 py-2 bg-lavender text-navy-900 rounded-full font-semibold hover:bg-lavender/90 transition-colors ml-2"
            >
              <PlusCircle size={20} />
              <span className="hidden md:block">Post</span>
            </Link>
            <Link to="/home" className="ml-2">
              <Avatar user={currentUser} size="sm" />
            </Link>
          </>
        ) : (
          <Link 
            to="/create-persona" 
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-semibold transition-colors ml-2"
          >
            Join Anonymously
          </Link>
        )}
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
      active ? 'text-lavender bg-lavender/10' : 'text-soft-white/60 hover:text-soft-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="text-sm font-medium hidden lg:block">{label}</span>
  </Link>
);
