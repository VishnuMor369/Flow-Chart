'use client'

import { useRef } from "react"
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from "lucide-react"

export const ParallaxScrollFeatureSection = () => {
    const sections = [
        {
            id: 1,
            title: "Frontend Roadmap",
            description: "Step by step guide to becoming a modern frontend developer. Learn HTML, CSS, JavaScript, Frameworks, and best practices.",
            imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
            reverse: false
        },
        {
            id: 2,
            title: "Backend Roadmap",
            description: "Master server-side programming. Explore databases, APIs, scaling, architecture, and security concepts in depth.",
            imageUrl: 'https://media.geeksforgeeks.org/wp-content/uploads/20240529152324/Backend-Developer-Roadmap-copy.webp',
            reverse: true
        },
        {
            id: 3,
            title: "DevOps Roadmap",
            description: "Automate and streamline the development lifecycle. Master CI/CD, containerization, cloud providers, and monitoring.",
            imageUrl: 'https://www.jeeviacademy.com/wp-content/uploads/2026/01/Screenshot-2026-01-21-172934.png',
            reverse: false
        }
    ]

    const sectionRefs = sections.map(() => useRef(null));
    
    const scrollYProgress = sections.map((_, index) => {
        return useScroll({
            target: sectionRefs[index],
            offset: ["start end", "center start"]
        }).scrollYProgress;
    });

    const opacityContents = scrollYProgress.map(progress => 
        useTransform(progress, [0, 0.7], [0, 1])
    );
    
    const clipProgresses = scrollYProgress.map(progress => 
        useTransform(progress, [0, 0.7], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"])
    );
    
    const translateContents = scrollYProgress.map(progress => 
        useTransform(progress, [0, 1], [-50, 0])
    );

  return (
    <div className="bg-[#0f0f0f] py-20 overflow-hidden">
      <div className='w-full flex flex-col items-center justify-center pb-32'>
        <h1 className='text-4xl md:text-5xl font-bold max-w-2xl text-center text-white'>Role-Based Roadmaps</h1>
        <p className='mt-10 flex items-center gap-1.5 text-sm text-[#8bc34a] font-medium tracking-widest uppercase'>Explore <ArrowDown size={15} className="animate-bounce" /></p>
      </div>
      
       <div className="flex flex-col md:px-0 px-6 max-w-6xl mx-auto">
            {sections.map((section, index) => (
                <div 
                    key={section.id}
                    ref={sectionRefs[index]} 
                    className={`min-h-[70vh] flex flex-col md:flex-row items-center justify-center md:gap-20 gap-10 ${section.reverse ? 'md:flex-row-reverse' : ''}`}
                >
                    <motion.div style={{ y: translateContents[index] }} className="flex-1">
                        <div className="text-4xl md:text-5xl font-bold text-white max-w-md leading-tight">{section.title}</div>
                        <motion.p 
                            style={{ y: translateContents[index] }} 
                            className="text-gray-400 max-w-md mt-6 text-lg"
                        >
                            {section.description}
                        </motion.p>
                        <button className="mt-8 text-[#8bc34a] hover:text-white font-semibold flex items-center gap-2 transition-colors">
                            View Roadmap &rarr;
                        </button>
                    </motion.div>
                    <motion.div 
                        style={{ 
                            opacity: opacityContents[index],
                            clipPath: clipProgresses[index],
                        }}
                        className="relative flex-1 w-full aspect-square md:aspect-video rounded-xl overflow-hidden"
                    >
                        <img 
                            src={section.imageUrl} 
                            className="w-full h-full object-cover rounded-xl" 
                            alt={`Section ${section.id}` }
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
                    </motion.div>
                </div>
            ))}
        </div>
    </div>
  );
};
