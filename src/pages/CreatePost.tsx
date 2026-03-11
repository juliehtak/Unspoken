import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Send, Shield, AlertCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../App';
import { Category } from '../types';

const categories: { id: Category; label: string }[] = [
  { id: 'stress', label: 'Stress' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'burnout', label: 'Burnout' },
  { id: 'loneliness', label: 'Loneliness' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'family', label: 'Family' },
  { id: 'self-esteem', label: 'Self-Esteem' },
  { id: 'school/work', label: 'School/Work' },
];

const CreatePost: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'stress' as Category,
    looking_for_advice: false,
  });

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="glass p-12 rounded-[3rem] border border-white/10">
          <Shield size={64} className="text-lavender mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Identity Required</h2>
          <p className="text-soft-white/60 mb-8">You need to create an anonymous persona before you can post in the community.</p>
          <button 
            onClick={() => navigate('/create-persona')}
            className="px-8 py-4 bg-lavender text-navy-900 rounded-2xl font-bold text-lg hover:bg-lavender/90 transition-all"
          >
            Create Persona
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return setError('Please fill in all fields');
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: currentUser.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        navigate(`/post/${data.id}`);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Share Your Thoughts</h1>
        <p className="text-soft-white/60">Your post will be shared anonymously under your persona: <span className="text-lavender font-bold">{currentUser.username}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <div>
            <label className="block text-sm font-bold text-soft-white/40 uppercase tracking-widest mb-2">Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your post a clear title..."
              className="w-full bg-navy-900 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-lavender transition-colors text-xl font-bold"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-soft-white/40 uppercase tracking-widest mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    formData.category === cat.id 
                      ? 'bg-lavender text-navy-900 border-lavender' 
                      : 'bg-white/5 text-soft-white/60 border-transparent hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-soft-white/40 uppercase tracking-widest mb-2">Content</label>
            <textarea 
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="What's on your mind? Feel free to speak your truth..."
              className="w-full bg-navy-900 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-lavender transition-colors h-64 resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted-pink/10 rounded-xl flex items-center justify-center text-muted-pink">
                <HelpCircle size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Looking for advice?</div>
                <div className="text-xs text-soft-white/40">Let others know you'd like guidance.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, looking_for_advice: !formData.looking_for_advice })}
              className={`w-14 h-8 rounded-full transition-all relative ${formData.looking_for_advice ? 'bg-lavender' : 'bg-navy-700'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.looking_for_advice ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 bg-lavender text-navy-900 rounded-2xl font-bold text-lg hover:bg-lavender/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : (
              <>
                <Send size={20} />
                Post Anonymously
              </>
            )}
          </button>
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
