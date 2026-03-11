import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageCircle, Heart, ChevronRight, Clock, Award, Trash2 } from 'lucide-react';
import { Post } from '../types';
import { formatShortDate } from '../utils/dateUtils';
import { useAuth } from '../App';

const MyPosts: React.FC = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchPosts = () => {
    if (!currentUser) return;
    setLoading(true);
    fetch(`/api/users/${currentUser.id}/posts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, [currentUser]);

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return;
    
    setIsDeleting(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">My Posts</h1>
        <p className="text-soft-white/60 mb-8">Please create a persona to view your post history.</p>
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
          <h1 className="text-3xl font-bold mb-2">My Posts</h1>
          <p className="text-soft-white/40">A history of your shared thoughts and journeys.</p>
        </div>
        <div className="glass px-4 py-2 rounded-2xl border border-white/5 text-sm font-medium">
          {posts.length} Posts
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass h-48 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-3xl border border-white/5 card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs text-soft-white/40">
                  <Clock size={14} />
                  <span>{formatShortDate(post.created_at)}</span>
                  <span>•</span>
                  <span className="uppercase tracking-wider font-bold text-lavender/80">{post.category}</span>
                </div>
                {post.looking_for_advice && (
                  <span className="px-3 py-1 bg-muted-pink/10 text-muted-pink text-[10px] font-bold uppercase tracking-widest rounded-full border border-muted-pink/20">
                    Advice Requested
                  </span>
                )}
              </div>

              <Link to={`/post/${post.id}`} className="block group">
                <h2 className="text-xl font-bold mb-3 group-hover:text-lavender transition-colors">{post.title}</h2>
                <p className="text-soft-white/60 text-sm leading-relaxed mb-6 line-clamp-2">{post.content}</p>
              </Link>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-soft-white/40 text-sm">
                    <Heart size={18} className="text-muted-pink" />
                    <span>{post.reaction_count} reactions</span>
                  </div>
                  <div className="flex items-center gap-2 text-soft-white/40 text-sm">
                    <MessageCircle size={18} className="text-lavender" />
                    <span>{post.comment_count} comments</span>
                  </div>
                </div>
                
                <Link 
                  to={`/post/${post.id}`} 
                  className="text-lavender text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  View Post
                  <ChevronRight size={16} />
                </Link>

                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={isDeleting === post.id}
                  className="p-2 text-soft-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                  title="Delete Post"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass p-12 rounded-3xl text-center border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award size={32} className="text-soft-white/20" />
          </div>
          <h3 className="text-xl font-bold mb-2">No posts yet</h3>
          <p className="text-soft-white/40 mb-8">You haven't shared any thoughts with the community yet.</p>
          <Link to="/create-post" className="px-8 py-3 bg-lavender text-navy-900 rounded-2xl font-bold hover:bg-lavender/90 transition-all">
            Share Your First Thought
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
