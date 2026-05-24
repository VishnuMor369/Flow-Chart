import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/ui/header-3';
import { WovenLightHero } from '@/components/ui/woven-light-hero';
import { ParallaxScrollFeatureSection } from '@/components/ui/parallax-scroll-feature-section';
import TeamShowcase from '@/components/ui/team-showcase';
import { PricingSection } from '@/components/ui/pricing';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { AnimatedForm } from '@/components/ui/modern-animated-sign-in';
import HoverFooter from '@/components/ui/hover-footer';
import ConcentricLoader from '@/components/ui/loader';
import RoadmapPage from '@/pages/RoadmapPage';
import { AiTutorChat } from '@/components/ui/ai-tutor-chat';
import BestPractices from '@/pages/BestPractices';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const PLANS = [
  {
    name: 'Community',
    info: 'Everything you need to learn and grow.',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      { text: 'All Interactive Roadmaps' },
      { text: 'Track your progress' },
      { text: 'Project ideas & guides' },
      { text: 'Access to Discord community' },
    ],
    btn: {
      text: 'Get Started for Free',
      href: '#',
    },
  },
  {
    highlighted: true,
    name: 'SQL Mastery',
    info: 'Our new premium course.',
    price: {
      monthly: 49,
      yearly: 49,
    },
    features: [
      { text: 'Comprehensive SQL curriculum' },
      { text: 'Interactive practice exercises' },
      { text: 'Real-world database projects' },
      { text: 'Certificate of completion' },
    ],
    btn: {
      text: 'Enroll Now',
      href: '#',
    },
  },
];

function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = async () => {
    setFormError('');
    setFormSuccess('');

    if (!formEmail.trim() || !formPassword.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (formPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setFormLoading(true);
    const { error } = await signUp(formEmail, formPassword);
    if (error) {
      // If user already exists, try sign in
      if (error.includes('already registered') || error.includes('already exists')) {
        const { error: signInErr } = await signIn(formEmail, formPassword);
        if (signInErr) {
          setFormError(signInErr);
        } else {
          setFormSuccess('Signed in successfully! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1000);
        }
      } else {
        setFormError(error);
      }
    } else {
      setFormSuccess('Account created! Check your email to verify your account.');
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {loading && <ConcentricLoader />}

      {!loading && (
        <>
          <AiTutorChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

          <main>
            <section id="hero">
              <WovenLightHero />
            </section>

            <section id="features">
              <ParallaxScrollFeatureSection />
            </section>

            <section id="shaders" className="relative w-full h-[60vh] flex flex-col items-center justify-center overflow-hidden border-y border-border/50 bg-black">
              <WebGLShader />
              <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4">
                <h2 className="mb-4 text-foreground text-5xl md:text-7xl font-black tracking-tighter">Commit to Your Growth</h2>
                <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto">Create an account to track your progress, save your favorite roadmaps, and join a community of developers.</p>

                <div className="flex justify-center">
                  <LiquidButton className="text-black border border-[#8bc34a]/30" size="xl">
                    <span className="font-bold text-lg">Start Learning Today</span>
                  </LiquidButton>
                </div>
              </div>
            </section>

            <section id="team">
              <TeamShowcase />
            </section>

            <section id="pricing">
              <PricingSection
                plans={PLANS}
                heading="Simple Pricing"
                description="All our core roadmaps and guides are completely free and open source. Check out our premium courses to deep dive into specific topics."
              />
            </section>

            <section id="signin" className="py-24 relative overflow-hidden bg-background">
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(139,195,74,0.05)_0%,transparent_70%)]"></div>

              {user ? (
                <div className="relative z-10 max-w-md mx-auto text-center p-8 bg-neutral-900/50 backdrop-blur-md border border-border/50 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8bc34a] to-[#689f38] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#8bc34a]/20">
                    <span className="text-2xl font-bold text-black">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Signed in as <span className="text-[#8bc34a]">{user.email}</span>
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-[#8bc34a] text-black rounded-lg px-8 py-3 font-bold hover:bg-[#9ccc65] transition-colors"
                  >
                    Go to Dashboard →
                  </button>
                </div>
              ) : (
                <div className="relative z-10">
                  {formError && (
                    <div className="max-w-md mx-auto mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="max-w-md mx-auto mb-4 px-4 py-3 rounded-xl bg-[#8bc34a]/10 border border-[#8bc34a]/20 text-[#8bc34a] text-sm text-center">
                      {formSuccess}
                    </div>
                  )}
                  <AnimatedForm
                    header="Join Routiq"
                    subHeader="Create an account to track your progress across all roadmaps."
                    fields={[
                      {
                        label: 'Email Address',
                        required: true,
                        type: 'email',
                        placeholder: 'Enter your email',
                        onChange: (e) => setFormEmail(e.target.value),
                      },
                      {
                        label: 'Password',
                        required: true,
                        type: 'password',
                        placeholder: 'Create a password (min 6 chars)',
                        onChange: (e) => setFormPassword(e.target.value),
                      },
                    ]}
                    submitButton={formLoading ? 'Creating...' : 'Create Account'}
                    googleLogin="Continue with GitHub"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleFormSubmit();
                    }}
                  />
                  <p className="text-center text-gray-500 text-xs mt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-[#8bc34a] hover:underline">Sign in here</a>
                  </p>
                </div>
              )}
            </section>
          </main>

          <HoverFooter />
        </>
      )}
    </div>
  );
}

function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <AuthProvider>
      <Header onAiTutorClick={() => setChatOpen(true)} />
      <AiTutorChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/roadmap/:id" element={
          <ProtectedRoute><RoadmapPage /></ProtectedRoute>
        } />
        <Route path="/best-practices" element={
          <ProtectedRoute>
            <><BestPractices /><HoverFooter /></>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;

