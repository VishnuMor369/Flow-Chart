"use client";

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import * as THREE from 'three';

export const WovenLightHero = () => {
  const textControls = useAnimation();
  const buttonControls = useAnimation();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    textControls.start(i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1 + 0.5,
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }));
    buttonControls.start({
      opacity: 1,
      transition: { delay: 1, duration: 1 }
    });

    return () => {
      document.head.removeChild(link);
    }
  }, [textControls, buttonControls]);

  const headline = "Developer Roadmaps";

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0f0f0f]">
      <WovenCanvas />

      <div className="relative z-10 text-center px-4 pt-16">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          {headline.split(" ").map((word, i) => (
            <span key={i} className="inline-block">
              {word.split("").map((char, j) => (
                <motion.span key={j} custom={i * 5 + j} initial={{ opacity: 0, y: 30 }} animate={textControls} style={{ display: 'inline-block' }}>
                  {char}
                </motion.span>
              ))}
              {i < headline.split(" ").length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </h1>
        <motion.p
          custom={headline.length}
          initial={{ opacity: 0, y: 20 }}
          animate={textControls}
          className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-gray-400"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Routiq is a community effort to create roadmaps, guides and other educational content to help guide developers in picking up a path and guide their learnings.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={buttonControls} className="mt-10 flex gap-4 justify-center flex-wrap">
          <button className="rounded-md bg-[#8bc34a] px-8 py-3.5 font-bold text-black transition-all hover:bg-[#8bc34a]/90 hover:scale-105 active:scale-95" style={{ fontFamily: "'Inter', sans-serif" }}>
            Role-based Roadmaps
          </button>
          <button className="rounded-md border border-white/20 bg-white/5 px-8 py-3.5 font-bold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95" style={{ fontFamily: "'Inter', sans-serif" }}>
            Skill-based Roadmaps
          </button>
        </motion.div>
      </div>
    </div>
  );
};

// --- Three.js Canvas Component ---
const WovenCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    const particleCount = 20000;
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const geometry = new THREE.BufferGeometry();
    const torusKnot = new THREE.TorusKnotGeometry(2, 0.8, 150, 24);

    for (let i = 0; i < particleCount; i++) {
      const vertexIndex = i % torusKnot.attributes.position.count;
      const x = torusKnot.attributes.position.getX(vertexIndex);
      const y = torusKnot.attributes.position.getY(vertexIndex);
      const z = torusKnot.attributes.position.getZ(vertexIndex);

      positions[i * 3] = x * 1.5;
      positions[i * 3 + 1] = y * 1.5;
      positions[i * 3 + 2] = z * 1.5;
      originalPositions[i * 3] = x * 1.5;
      originalPositions[i * 3 + 1] = y * 1.5;
      originalPositions[i * 3 + 2] = z * 1.5;

      const color = new THREE.Color();
      // Theme color (yellow-green #8bc34a) variations
      color.setHSL(0.24 + Math.random() * 0.05, 0.5, 0.2 + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.6,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      const mouseWorld = new THREE.Vector3(mouse.x * 4, mouse.y * 4, 0);

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const currentPos = new THREE.Vector3(positions[ix], positions[iy], positions[iz]);
        const originalPos = new THREE.Vector3(originalPositions[ix], originalPositions[iy], originalPositions[iz]);
        const velocity = new THREE.Vector3(velocities[ix], velocities[iy], velocities[iz]);

        const dist = currentPos.distanceTo(mouseWorld);
        if (dist < 2.0) {
          const force = (2.0 - dist) * 0.01;
          const direction = new THREE.Vector3().subVectors(currentPos, mouseWorld).normalize();
          velocity.add(direction.multiplyScalar(force));
        }

        const returnForce = new THREE.Vector3().subVectors(originalPos, currentPos).multiplyScalar(0.005);
        velocity.add(returnForce);

        velocity.multiplyScalar(0.92);

        positions[ix] += velocity.x;
        positions[iy] += velocity.y;
        positions[iz] += velocity.z;

        velocities[ix] = velocity.x;
        velocities[iy] = velocity.y;
        velocities[iz] = velocity.z;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = elapsedTime * 0.03;
      points.rotation.x = elapsedTime * 0.02;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 opacity-40 mix-blend-screen" />;
};
