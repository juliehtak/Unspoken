import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Send, ArrowLeft, ShieldAlert, Share2 } from 'lucide-react';
import { Post, Comment, Reaction } from '../types';
import { Avatar } from '../components/Avatar';
import { formatShortDate } from '../utils/dateUtils';
import { useAuth } from '../App';

const reactionTypes = [
  { type: 'Support', emoji: '❤️' },
  { type: 'I relate', emoji: '🤝' },
  { type: 'Stay strong', emoji: '🌱' },
];

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<(Post & { comments: Comment[]; reactions: Reaction[] }) | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPost = () => {
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPost(data);
        } else {
          console.error('Failed to fetch post:', data);
          setPost(null);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return navigate('/create-persona');
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: id,
          user_id: currentUser.id,
          content: newComment,
        }),
      });
      if (res.ok) {
        setNewComment('');
        fetchPost();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (type: string) => {
    if (!currentUser) return navigate('/create-persona');
    
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: id,
          user_id: currentUser.id,
          type,
        }),
      });
      if (res.ok) {
        fetchPost();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-8 animate-pulse"><div className="glass h-96 rounded-3xl" /></div>;
  if (!post) return <div className="text-center py-24">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-soft-white/60 hover:text-soft-white mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to feed
      </button>

      {/* Main Post */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[2.5rem] border border-white/5 mb-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar user={post} size="lg" />
            <div>
              <div className="text-xl font-bold">{post.username}</div>
              <div className="text-sm text-soft-white/40 flex items-center gap-2">
                <span>{formatShortDate(post.created_at)}</span>
                <span>•</span>
                <span className="text-lavender font-bold uppercase tracking-wider">{post.category}</span>
              </div>
            </div>
          </div>
          {post.looking_for_advice && (
            <div className="px-4 py-2 bg-muted-pink/10 text-muted-pink text-xs font-bold uppercase tracking-widest rounded-full border border-muted-pink/20">
              Advice Requested
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
        <p className="text-lg text-soft-white/80 leading-relaxed mb-10 whitespace-pre-wrap">{post.content}</p>

        {/* Reactions */}
        <div className="border-t border-white/5 pt-8">
          <h3 className="text-sm font-bold text-soft-white/40 uppercase tracking-widest mb-4">Supportive Reactions</h3>
          <div className="flex flex-wrap gap-3">
            {reactionTypes.map(rt => {
              const count = post.reactions.find(r => r.type === rt.type)?.count || 0;
              return (
                <button
                  key={rt.type}
                  onClick={() => handleReaction(rt.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
                    count > 0 ? 'bg-lavender/10 border-lavender/30 text-lavender' : 'bg-white/5 border-transparent text-soft-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{rt.emoji}</span>
                  <span className="text-sm font-bold">{rt.type}</span>
                  <span className="ml-1 px-2 py-0.5 bg-white/5 rounded-full text-xs font-medium">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Comment Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="text-lavender" />
            Supportive Comments
          </h2>
          <span className="text-soft-white/40 text-sm">{post.comments.length} comments</span>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleComment} className="glass p-6 rounded-3xl border border-white/10">
          <div className="flex gap-4">
            <Avatar user={currentUser || {}} size="sm" />
            <div className="flex-grow space-y-4">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={currentUser ? "Share some support or advice..." : "Join the community to comment..."}
                disabled={!currentUser || isSubmitting}
                className="w-full bg-navy-900 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-lavender transition-colors h-24 resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-soft-white/40">
                  <ShieldAlert size={14} />
                  Keep it kind and anonymous
                </div>
                <button
                  type="submit"
                  disabled={!currentUser || isSubmitting || !newComment.trim()}
                  className="px-6 py-2 bg-lavender text-navy-900 rounded-xl font-bold hover:bg-lavender/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={18} />
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {post.comments.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4"
            >
              <Avatar user={comment} size="sm" className="flex-shrink-0" />
              <div className="flex-grow glass p-6 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{comment.username}</span>
                  <span className="text-[10px] text-soft-white/40 uppercase tracking-wider">{formatShortDate(comment.created_at)}</span>
                </div>
                <p className="text-soft-white/80 text-sm leading-relaxed">{comment.content}</p>
                <div className="mt-4 flex items-center gap-4">
                  <button className="text-[10px] font-bold text-soft-white/40 hover:text-lavender uppercase tracking-widest flex items-center gap-1 transition-colors">
                    <Heart size={12} />
                    Helpful
                  </button>
                  <button className="text-[10px] font-bold text-soft-white/40 hover:text-lavender uppercase tracking-widest flex items-center gap-1 transition-colors">
                    <Share2 size={12} />
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {post.comments.length === 0 && (
            <div className="text-center py-12 text-soft-white/20 italic">
              No comments yet. Be the first to offer support.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
