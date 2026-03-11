import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Anchor, Phone, Heart, Info, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

const Resources: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Wellness Resources</h1>
        <p className="text-soft-white/60 max-w-2xl mx-auto">
          Tools and techniques to help you manage difficult moments and find your center.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-24">
        {/* Breathing Exercise */}
        <div className="glass p-10 rounded-[3rem] border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-lavender/20 rounded-2xl flex items-center justify-center text-lavender">
              <Wind size={24} />
            </div>
            <h2 className="text-2xl font-bold">Box Breathing</h2>
          </div>
          <BreathingExercise />
        </div>

        {/* Grounding Technique */}
        <div className="glass p-10 rounded-[3rem] border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-muted-pink/20 rounded-2xl flex items-center justify-center text-muted-pink">
              <Anchor size={24} />
            </div>
            <h2 className="text-2xl font-bold">5-4-3-2-1 Technique</h2>
          </div>
          <GroundingTechnique />
        </div>
      </div>

      {/* Support Cards */}
      <h2 className="text-3xl font-bold mb-8 text-center">Support Information</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <SupportCard 
          title="Crisis Text Line"
          description="Text HOME to 741741 to connect with a Crisis Counselor."
          link="https://www.crisistextline.org"
          icon={<Phone size={24} />}
        />
        <SupportCard 
          title="Mental Health America"
          description="Resources for mental health screening and education."
          link="https://www.mhanational.org"
          icon={<Heart size={24} />}
        />
        <SupportCard 
          title="Self-Care Guide"
          description="A collection of small habits for better mental wellness."
          link="#"
          icon={<Info size={24} />}
        />
      </div>
    </div>
  );
};

const BreathingExercise: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Wait'>('Inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setPhase(current => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              if (current === 'Exhale') return 'Wait';
              return 'Inhale';
            });
            return 0;
          }
          return prev + 1;
        });
      }, 40); // 4 seconds per phase (100 * 40ms)
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <motion.div 
          animate={{ 
            scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : phase === 'Hold' ? 1.5 : 1,
            opacity: isActive ? 1 : 0.3
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute w-32 h-32 bg-lavender/30 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ 
            scale: phase === 'Inhale' ? 1.2 : phase === 'Exhale' ? 0.8 : phase === 'Hold' ? 1.2 : 0.8,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-40 h-40 border-4 border-lavender rounded-full flex items-center justify-center"
        >
          <div className="text-xl font-bold text-lavender">{isActive ? phase : 'Ready?'}</div>
        </motion.div>
        
        {/* Progress Ring */}
        <svg className="absolute w-64 h-64 -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(157, 141, 241, 0.1)"
            strokeWidth="4"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(157, 141, 241, 0.8)"
            strokeWidth="4"
            strokeDasharray={754}
            strokeDashoffset={754 - (754 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="px-8 py-3 bg-lavender text-navy-900 rounded-2xl font-bold flex items-center gap-2 hover:bg-lavender/90 transition-all"
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
          {isActive ? 'Pause' : 'Start Exercise'}
        </button>
        <button 
          onClick={() => { setIsActive(false); setProgress(0); setPhase('Inhale'); }}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

const GroundingTechnique: React.FC = () => {
  const steps = [
    { label: "5 things you can SEE", color: "text-lavender" },
    { label: "4 things you can TOUCH", color: "text-muted-pink" },
    { label: "3 things you can HEAR", color: "text-lavender" },
    { label: "2 things you can SMELL", color: "text-muted-pink" },
    { label: "1 thing you can TASTE", color: "text-lavender" },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5"
        >
          <div className={`text-2xl font-black ${step.color} w-8`}>{5-i}</div>
          <div className="font-bold text-soft-white/80">{step.label}</div>
        </motion.div>
      ))}
      <p className="text-xs text-soft-white/40 mt-6 italic text-center">
        Focus on each item slowly. Take your time to really notice the details.
      </p>
    </div>
  );
};

const SupportCard: React.FC<{ title: string; description: string; link: string; icon: React.ReactNode }> = ({ title, description, link, icon }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer"
    className="glass p-8 rounded-3xl border border-white/5 hover:border-lavender/30 transition-all group"
  >
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-lavender mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 flex items-center justify-between">
      {title}
      <ChevronRight size={18} className="text-soft-white/20 group-hover:text-lavender transition-colors" />
    </h3>
    <p className="text-soft-white/60 text-sm leading-relaxed">{description}</p>
  </a>
);

export default Resources;
