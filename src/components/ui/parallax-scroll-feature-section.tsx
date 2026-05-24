'use client'

import { useRef } from "react"
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from "lucide-react"
import { useAuth } from '@/context/AuthContext'

export const ParallaxScrollFeatureSection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const sections = [
        {
            id: 1,
            route: '/roadmap/frontend',
            title: "Frontend Roadmap",
            description: "Step by step guide to becoming a modern frontend developer. Learn HTML, CSS, JavaScript, Frameworks, and best practices.",
            imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
            reverse: false
        },
        {
            id: 2,
            route: '/roadmap/backend',
            title: "Backend Roadmap",
            description: "Master server-side programming. Explore databases, APIs, scaling, architecture, and security concepts in depth.",
            imageUrl: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?q=80&w=2070&auto=format&fit=crop',
            reverse: true
        },
        {
            id: 3,
            route: '/roadmap/devops',
            title: "DevOps Roadmap",
            description: "Automate and streamline the development lifecycle. Master CI/CD, containerization, cloud providers, and monitoring.",
            imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop',
            reverse: false
        },
        {
            id: 4,
            route: '/roadmap/full-stack',
            title: "Full Stack Roadmap",
            description: "Become a complete developer by mastering both frontend and backend technologies, databases, and deployment.",
            imageUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?q=80&w=2070&auto=format&fit=crop',
            reverse: true
        },
        {
            id: 5,
            route: '/roadmap/machine-learning',
            title: "Machine Learning Roadmap",
            description: "Dive into data science, AI, deep learning, and MLOps. Learn Python, statistics, algorithms, and models.",
            imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
            reverse: false
        },
        {
            id: 6,
            route: '/roadmap/blockchain',
            title: "Blockchain Roadmap",
            description: "Build decentralized applications. Learn cryptography, Ethereum, smart contracts, Solidity, and Web3 integration.",
            imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
            reverse: true
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
        <div className="bg-background py-20 overflow-hidden">
            <div className='w-full flex flex-col items-center justify-center pb-32'>
                <h1 className='text-4xl md:text-5xl font-bold max-w-2xl text-center text-foreground'>Role-Based Roadmaps</h1>
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
                            <div className="text-4xl md:text-5xl font-bold text-foreground max-w-md leading-tight">{section.title}</div>
                            <motion.p
                                style={{ y: translateContents[index] }}
                                className="text-muted-foreground max-w-md mt-6 text-lg"
                            >
                                {section.description}
                            </motion.p>
                            <button
                                onClick={() => navigate(user ? section.route : '/login')}
                                className="mt-8 text-[#8bc34a] hover:text-foreground font-semibold flex items-center gap-2 transition-colors"
                            >
                                {user ? 'View Roadmap' : 'Sign in to View'} &rarr;
                            </button>
                        </motion.div>
                        <motion.div
                            style={{
                                opacity: opacityContents[index],
                                clipPath: clipProgresses[index],
                            }}
                            className="relative flex-1 w-full aspect-square md:aspect-video rounded-xl overflow-hidden"
                        >
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${section.imageUrl})` }}
                                role="img"
                                aria-label={section.title}
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
};
