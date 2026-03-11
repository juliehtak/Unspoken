import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Save, RefreshCw, Sparkles } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../App';

const PersonaCreation: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [persona, setPersona] = useState({
    username: '',
    avatar_skin: '#FFDBAC',
    avatar_hair: 'short',
    avatar_outfit: '#4B0082',
    avatar_accessory: 'none',
    avatar_mood: 'peaceful',
    bio: '',
  });

  const skins = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642'];
  const outfits = ['#4B0082', '#FF69B4', '#87CEEB', '#2E8B57', '#708090', '#FFD700', '#D8BFD8', '#FF4500'];
  const hairs = ['short', 'long', 'curly', 'bald', 'spiky', 'braids', 'wavy', 'ponytail', 'shaved', 'messy', 'undercut', 'bun', 'afro', 'buzz'];
  const accessories = ['none', 'glasses', 'headphones', 'scarf', 'earrings', 'flower', 'necklace', 'hat', 'piercing'];
  const moods = ['peaceful', 'thoughtful', 'dreamy', 'optimistic', 'melancholy', 'determined', 'warm', 'confused', 'courageous', 'zen', 'lonely', 'creative', 'relaxed', 'pensive', 'kind'];

  const handleRandomize = () => {
    setPersona({
      ...persona,
      avatar_skin: skins[Math.floor(Math.random() * skins.length)],
      avatar_hair: hairs[Math.floor(Math.random() * hairs.length)],
      avatar_outfit: outfits[Math.floor(Math.random() * outfits.length)],
      avatar_accessory: accessories[Math.floor(Math.random() * accessories.length)],
      avatar_mood: moods[Math.floor(Math.random() * moods.length)],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persona.username) return setError('Please choose a username');
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona),
      });
      
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
        navigate('/home');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Create Your Persona</h1>
        <p className="text-soft-white/60">Choose how you want to be seen in the community. Stay anonymous, stay safe.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Preview Section */}
        <div className="sticky top-24 flex flex-col items-center">
          <div className="glass p-12 rounded-[3rem] border border-white/10 w-full flex flex-col items-center">
            <Avatar user={persona} size="xl" className="mb-8" />
            <h2 className="text-2xl font-bold mb-2">{persona.username || 'Anonymous'}</h2>
            <p className="text-soft-white/40 text-sm mb-8">The {persona.avatar_mood} {
              persona.avatar_mood === 'peaceful' ? 'Lamb' :
              persona.avatar_mood === 'thoughtful' ? 'Fox' :
              persona.avatar_mood === 'dreamy' ? 'Unicorn' :
              persona.avatar_mood === 'optimistic' ? 'Chick' :
              persona.avatar_mood === 'melancholy' ? 'Koala' :
              persona.avatar_mood === 'determined' ? 'Tiger' :
              persona.avatar_mood === 'warm' ? 'Panda' :
              persona.avatar_mood === 'confused' ? 'Frog' :
              persona.avatar_mood === 'courageous' ? 'Lion' :
              persona.avatar_mood === 'zen' ? 'Turtle' :
              persona.avatar_mood === 'lonely' ? 'Bunny' :
              persona.avatar_mood === 'creative' ? 'Butterfly' :
              persona.avatar_mood === 'relaxed' ? 'Sloth' :
              persona.avatar_mood === 'pensive' ? 'Owl' :
              persona.avatar_mood === 'kind' ? 'Puppy' : 'Soul'
            }</p>
            
            <button 
              onClick={handleRandomize}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-sm font-semibold"
            >
              <RefreshCw size={18} />
              Randomize Look
            </button>
          </div>
        </div>

        {/* Customization Section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-soft-white/60 mb-2 uppercase tracking-wider">Anonymous Username</label>
              <input 
                type="text" 
                value={persona.username}
                onChange={e => setPersona({ ...persona, username: e.target.value })}
                placeholder="e.g. SilentEcho, CalmCloud..."
                className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-colors"
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-soft-white/60 mb-3 uppercase tracking-wider">Aura Color</label>
                <div className="flex flex-wrap gap-2">
                  {skins.map(skin => (
                    <button
                      key={skin}
                      type="button"
                      onClick={() => setPersona({ ...persona, avatar_skin: skin })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${persona.avatar_skin === skin ? 'border-lavender scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: skin }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-soft-white/60 mb-3 uppercase tracking-wider">Backdrop</label>
                <div className="flex flex-wrap gap-2">
                  {outfits.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setPersona({ ...persona, avatar_outfit: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${persona.avatar_outfit === color ? 'border-lavender scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-soft-white/60 mb-2 uppercase tracking-wider">Spirit Guide (Avatar)</label>
              <div className="grid grid-cols-5 gap-2">
                {moods.map(m => {
                  const emojis: Record<string, string> = {
                    peaceful: '🐑', thoughtful: '🦊', dreamy: '🦄', optimistic: '🐥', melancholy: '🐨',
                    determined: '🐯', warm: '🐼', confused: '🐸', courageous: '🦁', zen: '🐢',
                    lonely: '🐰', creative: '🦋', relaxed: '🦥', pensive: '🦉', kind: '🐶'
                  };
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPersona({ ...persona, avatar_mood: m })}
                      className={`aspect-square flex items-center justify-center text-2xl rounded-xl border-2 transition-all ${persona.avatar_mood === m ? 'border-lavender bg-lavender/10 scale-105' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                      title={m}
                    >
                      {emojis[m]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-soft-white/60 mb-2 uppercase tracking-wider">Short Bio (Optional)</label>
              <textarea 
                value={persona.bio}
                onChange={e => setPersona({ ...persona, bio: e.target.value })}
                placeholder="Tell us a little about your journey..."
                className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-colors h-24 resize-none"
                maxLength={100}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-lavender text-navy-900 rounded-2xl font-bold text-lg hover:bg-lavender/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Persona...' : (
              <>
                <Save size={20} />
                Save Persona
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonaCreation;
