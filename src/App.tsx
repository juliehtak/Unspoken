import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User } from './types';
import Landing from './pages/Landing';
import Home from './pages/Home';
import PersonaCreation from './pages/PersonaCreation';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Resources from './pages/Resources';
import MyPosts from './pages/MyPosts';
import Notifications from './pages/Notifications';
import { Navbar } from './components/Navbar';
import { motion, AnimatePresence } from 'motion/react';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('unspoken_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Verify user exists in DB
        fetch(`/api/users/${parsed.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.id) {
              setCurrentUser(data);
            } else {
              localStorage.removeItem('unspoken_user');
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      } catch (e) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleSetUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('unspoken_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('unspoken_user');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-16">
            <PageWrapper>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Home />} />
                <Route path="/create-persona" element={<PersonaCreation />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/my-posts" element={<MyPosts />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </PageWrapper>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
