import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageCircle, Heart, Share2, Filter, TrendingUp, Clock, Award, ChevronRight, Bell, Layout, PlusCircle, Home as HomeIcon, BookOpen, Users } from 'lucide-react';
import { Post, Category } from '../types';
import { Avatar } from '../components/Avatar';
import { formatShortDate } from '../utils/dateUtils';
import { useAuth } from '../App';

const categories: { id: Category | 'All'; label: string }[] = [
  { id: 'All', label: 'All Categories' },
  { id: 'stress', label: 'Stress' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'burnout', label: 'Burnout' },
  { id: 'loneliness', label: 'Loneliness' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'family', label: 'Family' },
  { id: 'self-esteem', label: 'Self-Esteem' },
  { id: 'school/work', label: 'School/Work' },
];

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'Latest' | 'Trending' | 'Most Supportive'>('Latest');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [stats, setStats] = useState<{ members: number; discussions: number; reactions: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      filter,
      category: selectedCategory,
    });
    fetch(`/api/posts?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error('Expected array of posts, got:', data);
          setPosts([]);
        }
        setLoading(false);
      });

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Stats error:', err));
  }, [filter, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Left Sidebar - Navigation & Categories */}
      <aside className="lg:w-64 flex-shrink-0 space-y-6">
        <div className="glass p-6 rounded-3xl border border-white/5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Layout size={20} className="text-lavender" />
            Navigation
          </h2>
          <div className="space-y-1">
            <SidebarLink to="/home" icon={<HomeIcon size={18} />} label="Home" active />
            <SidebarLink to="/home" icon={<TrendingUp size={18} />} label="Explore" />
            <SidebarLink to="/create-post" icon={<PlusCircle size={18} />} label="Create Post" />
            {currentUser && (
              <>
                <SidebarLink to="/my-posts" icon={<Layout size={18} />} label="My Posts" />
                <SidebarLink to="/notifications" icon={<Bell size={18} />} label="Notifications" />
              </>
            )}
            <SidebarLink to="/resources" icon={<BookOpen size={18} />} label="Resources" />
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Filter size={20} className="text-lavender" />
            Categories
          </h2>
          <div className="space-y-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-lavender text-navy-900' 
                    : 'text-soft-white/60 hover:bg-white/5 hover:text-soft-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5 hidden lg:block">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-soft-white/40">Guidelines</h3>
          <ul className="text-xs text-soft-white/40 space-y-3">
            <li>• Be kind and supportive</li>
            <li>• No hate speech or bullying</li>
            <li>• Respect anonymity</li>
            <li>• Share your journey safely</li>
          </ul>
        </div>
      </aside>

      {/* Main Feed */}
      <main className="flex-grow space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1 bg-navy-800 rounded-2xl w-fit border border-white/5">
          <FilterTab 
            active={filter === 'Latest'} 
            onClick={() => setFilter('Latest')} 
            icon={<Clock size={16} />} 
            label="Latest" 
          />
          <FilterTab 
            active={filter === 'Trending'} 
            onClick={() => setFilter('Trending')} 
            icon={<TrendingUp size={16} />} 
            label="Trending" 
          />
          <FilterTab 
            active={filter === 'Most Supportive'} 
            onClick={() => setFilter('Most Supportive')} 
            icon={<Award size={16} />} 
            label="Most Supportive" 
          />
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass h-64 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="glass p-12 rounded-3xl text-center border border-white/5">
            <p className="text-soft-white/40">No posts found in this category yet. Be the first to share?</p>
            <Link to="/create-post" className="mt-4 inline-block text-lavender hover:underline">Create a post</Link>
          </div>
        )}
      </main>

      {/* Right Sidebar - Trending/Support */}
      <aside className="lg:w-80 flex-shrink-0 space-y-6 hidden lg:block">
        {stats && (
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Users size={20} className="text-lavender" />
              Community Activity
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xl">👥</div>
                  <div className="text-sm font-medium text-soft-white/60">Members</div>
                </div>
                <div className="text-lg font-bold text-lavender">{stats.members}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xl">💬</div>
                  <div className="text-sm font-medium text-soft-white/60">Discussions</div>
                </div>
                <div className="text-lg font-bold text-lavender">{stats.discussions}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xl">❤️</div>
                  <div className="text-sm font-medium text-soft-white/60">Support Reactions</div>
                </div>
                <div className="text-lg font-bold text-lavender">{stats.reactions}</div>
              </div>
            </div>
          </div>
        )}

        <div className="glass p-6 rounded-3xl border border-white/5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-lavender" />
            Trending Now
          </h3>
          <div className="space-y-4">
            {posts.slice(0, 4).map(post => (
              <Link key={post.id} to={`/post/${post.id}`} className="block group">
                <p className="text-sm font-medium line-clamp-2 group-hover:text-lavender transition-colors mb-1">{post.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-soft-white/40 uppercase tracking-wider">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.reaction_count} reactions</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-lavender/20 bg-lavender/5">
          <h3 className="font-bold mb-2">Need immediate help?</h3>
          <p className="text-xs text-soft-white/60 mb-4">If you are in a crisis, please reach out to professional services.</p>
          <Link to="/resources" className="flex items-center justify-between w-full px-4 py-2 bg-lavender text-navy-900 rounded-xl text-sm font-bold hover:bg-lavender/90 transition-all">
            Support Resources
            <ChevronRight size={16} />
          </Link>
        </div>
      </aside>
    </div>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active?: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-lavender/10 text-lavender' 
        : 'text-soft-white/60 hover:bg-white/5 hover:text-soft-white'
    }`}
  >
    {icon}
    {label}
  </Link>
);

const FilterTab: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
      active ? 'bg-navy-700 text-lavender shadow-lg' : 'text-soft-white/40 hover:text-soft-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [localReactions, setLocalReactions] = useState<Record<string, number>>(post.reactions || {});

  const handleReaction = async (type: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return navigate('/create-persona');
    
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          user_id: currentUser.id,
          type,
        }),
      });
      if (res.ok) {
        setLocalReactions(prev => ({
          ...prev,
          [type]: (prev[type] || 0) + 1
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reactionOptions = [
    { type: 'Support', emoji: '❤️' },
    { type: 'I relate', emoji: '🤝' },
    { type: 'Stay strong', emoji: '🌱' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-3xl border border-white/5 card-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar user={post} size="md" />
          <div>
            <div className="font-bold text-soft-white">{post.username}</div>
            <div className="text-xs text-soft-white/40 flex items-center gap-2">
              <span>{formatShortDate(post.created_at)} ago</span>
              <span>•</span>
              <span className="uppercase tracking-wider font-bold text-lavender/80">{post.category}</span>
            </div>
          </div>
        </div>
        {post.looking_for_advice && (
          <span className="px-3 py-1 bg-muted-pink/10 text-muted-pink text-[10px] font-bold uppercase tracking-widest rounded-full border border-muted-pink/20">
            Advice Requested
          </span>
        )}
      </div>

      <Link to={`/post/${post.id}`} className="block group">
        <h2 className="text-xl font-bold mb-3 group-hover:text-lavender transition-colors">{post.title}</h2>
        <p className="text-soft-white/70 leading-relaxed mb-6 line-clamp-3">{post.content}</p>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          {reactionOptions.map(rt => (
            <button
              key={rt.type}
              onClick={(e) => handleReaction(rt.type, e)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-soft-white/60 hover:text-soft-white transition-all border border-transparent hover:border-white/10"
            >
              <span>{rt.emoji}</span>
              <span>{rt.type}</span>
              <span className="text-lavender">{localReactions[rt.type] || 0}</span>
            </button>
          ))}
          <Link 
            to={`/post/${post.id}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-soft-white/60 hover:text-soft-white transition-all"
          >
            <MessageCircle size={14} className="text-lavender" />
            <span>Replies</span>
            <span className="text-lavender">{post.comment_count}</span>
          </Link>
        </div>
        
        <Link 
          to={`/post/${post.id}`} 
          className="text-lavender text-xs font-bold flex items-center gap-1 hover:underline"
        >
          View Post
          <ChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

export default Home;
