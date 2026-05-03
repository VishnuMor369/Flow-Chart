import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/ui/header-3';
import HoverFooter from '@/components/ui/hover-footer';
import { LogOut, User, MapPin, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [roadmapStats, setRoadmapStats] = useState<{ id: string; name: string; completed: number; total: number }[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load roadmap progress from localStorage for display
  useEffect(() => {
    const roadmaps = [
      { id: 'frontend', name: 'Frontend Development' },
      { id: 'backend', name: 'Backend Development' },
      { id: 'full-stack', name: 'Full Stack' },
      { id: 'devops', name: 'DevOps' },
      { id: 'machine-learning', name: 'Machine Learning' },
      { id: 'blockchain', name: 'Blockchain' },
    ];

    const stats = roadmaps.map((r) => {
      const saved = localStorage.getItem(`roadmap_progress_${r.id}`);
      const completedNodes: string[] = saved ? JSON.parse(saved) : [];
      return { ...r, completed: completedNodes.length, total: 0 };
    }).filter((r) => r.completed > 0);

    setRoadmapStats(stats);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8bc34a] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Developer';
  const avatarUrl = user.user_metadata?.avatar_url;
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary border border-border rounded-2xl p-8 mb-8"
          >
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#8bc34a]/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8bc34a] to-[#689f38] flex items-center justify-center">
                    <User className="w-10 h-10 text-black" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#8bc34a] rounded-full border-2 border-[#151515]" />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    Joined {joinDate}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#8bc34a]">
                    <MapPin className="w-3.5 h-3.5" />
                    Developer
                  </span>
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Roadmap Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#8bc34a]" />
              Your Roadmap Progress
            </h2>

            {roadmapStats.length === 0 ? (
              <div className="bg-secondary border border-border rounded-2xl p-8 text-center">
                <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No progress yet. Start exploring roadmaps to track your journey!
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#8bc34a] text-black font-bold text-sm hover:bg-[#9ccc65] transition-colors"
                >
                  Explore Roadmaps
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {roadmapStats.map((stat, i) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => navigate(`/roadmap/${stat.id}`)}
                    className="bg-secondary border border-border rounded-xl p-5 flex items-center justify-between hover:border-[#8bc34a]/30 hover:bg-[#8bc34a]/5 transition-all cursor-pointer group"
                  >
                    <div>
                      <h3 className="font-semibold group-hover:text-[#8bc34a] transition-colors">
                        {stat.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.completed} topics completed
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[#8bc34a] font-bold">{stat.completed}</span>
                        <span className="text-gray-500 text-xs ml-1">nodes</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#8bc34a]/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-[#8bc34a]" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <HoverFooter />
    </div>
  );
}
