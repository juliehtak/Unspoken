import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Shield, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Post } from '../types';
import { Avatar } from '../components/Avatar';
import { formatDistanceToNow } from 'date-fns';

const Landing: React.FC = () => {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/posts?filter=Trending&limit=3')
      .then(res => res.json())
      .then(data => setTrendingPosts(data.slice(0, 3)));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      {/* Hero Section */}
      <div className="text-center mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender/10 border border-lavender/20 text-lavender mb-8"
        >
          <Sparkles size={16} />
          <span className="text-sm font-semibold uppercase tracking-wider">Your safe space for expression</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
        >
          Speak freely. <br />
          <span className="text-lavender">Stay unseen.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-soft-white/60 max-w-2xl mx-auto mb-12"
        >
          A modern anonymous community for emotional support and mental wellness. 
          Share your thoughts, find support, and connect with others without the pressure of identity.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/create-persona" 
            className="w-full sm:w-auto px-8 py-4 bg-lavender text-navy-900 rounded-2xl font-bold text-lg hover:bg-lavender/90 transition-all flex items-center justify-center gap-2 group"
          >
            Join Anonymously
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/home" 
            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
          >
            Explore Community
          </Link>
        </motion.div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-32">
        <FeatureCard 
          icon={<Shield className="text-lavender" size={32} />}
          title="Total Anonymity"
          description="No real names, no profiles linked to social media. Just your anonymous persona."
        />
        <FeatureCard 
          icon={<Heart className="text-muted-pink" size={32} />}
          title="Supportive Community"
          description="A space built on empathy. Respond with supportive reactions and kind words."
        />
        <FeatureCard 
          icon={<Users className="text-lavender" size={32} />}
          title="Shared Experiences"
          description="Connect with others going through similar struggles in focused categories."
        />
      </div>

      {/* Trending Posts Preview */}
      <div className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">Trending Conversations</h2>
          <Link to="/home" className="text-lavender hover:underline flex items-center gap-1">
            View all feed <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {trendingPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="glass p-6 rounded-3xl card-hover border border-white/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar user={post} size="sm" />
                <div>
                  <div className="font-semibold text-sm">{post.username}</div>
                  <div className="text-xs text-soft-white/40">{formatDistanceToNow(new Date(post.created_at))} ago</div>
                </div>
              </div>
              <h3 className="font-bold mb-2 line-clamp-1">{post.title}</h3>
              <p className="text-soft-white/60 text-sm line-clamp-3 mb-4">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-soft-white/40">
                <span className="px-2 py-1 rounded-md bg-white/5 uppercase tracking-wider font-bold">{post.category}</span>
                <span>{post.reaction_count} reactions</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer-like CTA */}
      <div className="glass p-12 rounded-[3rem] text-center border border-white/10">
        <h2 className="text-4xl font-bold mb-6">Ready to find your community?</h2>
        <p className="text-soft-white/60 mb-10 max-w-xl mx-auto">
          Join thousands of others who are sharing their journey anonymously. 
          Your voice matters, even if it's unspoken.
        </p>
        <Link 
          to="/create-persona" 
          className="inline-flex px-10 py-5 bg-lavender text-navy-900 rounded-2xl font-bold text-xl hover:bg-lavender/90 transition-all"
        >
          Create Your Persona
        </Link>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="glass p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
    <div className="mb-6">{icon}</div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-soft-white/60 leading-relaxed">{description}</p>
  </div>
);

export default Landing;
