"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Mail,
  MapPin,
  Globe,
} from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none cursor-pointer", className)}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#8bc34a" />
              <stop offset="50%" stopColor="#4caf50" />
              <stop offset="100%" stopColor="#8bc34a" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-800 font-sans text-6xl font-black tracking-tighter"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-[#8bc34a] font-sans text-6xl font-black tracking-tighter opacity-50"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        className="fill-transparent font-sans text-6xl font-black tracking-tighter"
      >
        {text}
      </text>
    </svg>
  );
};


export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(125% 125% at 50% 10%, #000000 50%, #8bc34a22 100%)",
      }}
    />
  );
};

export default function HoverFooter() {
  const footerLinks = [
    {
      title: "Roadmaps",
      links: [
        { label: "Frontend", href: "#" },
        { label: "Backend", href: "#" },
        { label: "DevOps", href: "#" },
        { label: "Full Stack", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Guides", href: "#" },
        { label: "Best Practices", href: "#" },
        { label: "Project Ideas", href: "#" },
        {
          label: "AI Tutor",
          href: "#",
          pulse: true,
        },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaTwitter size={20} />, label: "Twitter", href: "#" },
    { icon: <FaFacebook size={20} />, label: "Facebook", href: "#" },
    { icon: <Globe size={20} />, label: "Globe", href: "#" },
  ];

  return (
    <footer className="bg-[#050505] relative h-fit rounded-t-3xl overflow-hidden mt-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-10 py-16 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4 col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2">
              <span className="text-[#8bc34a] text-3xl font-extrabold">R</span>
              <span className="text-white text-3xl font-bold tracking-tight">outiq</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
              Community created roadmaps, best practices, projects, articles, resources and journeys to help you choose your path and grow in your career.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-lg font-bold mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative inline-block">
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#8bc34a] transition-colors"
                    >
                      {link.label}
                    </a>
                    {link.pulse && (
                      <span className="absolute top-1 -right-4 w-2 h-2 rounded-full bg-[#8bc34a] animate-pulse"></span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-t border-white/10 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0 text-gray-500">
          <div className="flex space-x-6">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="hover:text-[#8bc34a] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Routiq by @kamrify. All rights reserved.
          </p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-[30rem] -mt-52 -mb-20 pointer-events-none">
        <TextHoverEffect text="Routiq" className="z-50 pointer-events-auto" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
