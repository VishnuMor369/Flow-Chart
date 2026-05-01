import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-x-hidden">
      {loading && <ConcentricLoader />}

      {!loading && (
        <>
          <Header onAiTutorClick={() => setChatOpen(true)} />
          <AiTutorChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

          <main>
            <section id="hero">
              <WovenLightHero />
            </section>

            <section id="features">
              <ParallaxScrollFeatureSection />
            </section>

            <section id="shaders" className="relative w-full h-[60vh] flex flex-col items-center justify-center overflow-hidden border-y border-white/5 bg-black">
              <WebGLShader />
              <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4">
                <h2 className="mb-4 text-white text-5xl md:text-7xl font-black tracking-tighter">Commit to Your Growth</h2>
                <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">Create an account to track your progress, save your favorite roadmaps, and join a community of developers.</p>

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

            <section id="signin" className="py-24 relative overflow-hidden bg-[#0f0f0f]">
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(139,195,74,0.05)_0%,transparent_70%)]"></div>
              <AnimatedForm
                header="Join Routiq"
                subHeader="Create an account to track your progress across all roadmaps."
                fields={[
                  {
                    label: 'Email Address',
                    required: true,
                    type: 'email',
                    placeholder: 'Enter your email',
                    onChange: () => { },
                  },
                  {
                    label: 'Password',
                    required: true,
                    type: 'password',
                    placeholder: 'Create a password',
                    onChange: () => { },
                  },
                ]}
                submitButton="Create Account"
                googleLogin="Continue with GitHub"
                onSubmit={() => console.log('Submitted')}
              />
            </section>
          </main>

          <HoverFooter />
        </>
      )}
    </div>
  );
}

import BestPractices from '@/pages/BestPractices';

function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <AiTutorChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/roadmap/:id" element={<RoadmapPage />} />
        <Route path="/best-practices" element={<><Header onAiTutorClick={() => setChatOpen(true)} /><BestPractices /><HoverFooter /></>} />
      </Routes>
    </>
  );
}

export default App;
