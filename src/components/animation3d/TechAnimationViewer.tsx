import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  createNeuralNetworkModel,
  createCyberShieldModel,
  createDroneModel,
  createRoboticsModel,
  createSoftwareCodeModel,
  createLogoFinaleModel,
  NeuralNetworkGroup,
  CyberShieldGroup,
  DroneGroup,
  RoboticsGroup,
  SoftwareCodeGroup,
  LogoFinaleGroup,
} from './models';
import { soundFx } from './audioEngine';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, ChevronDown, ChevronUp, Sparkles, Shield, Cpu, Bot, Plane, Code, ArrowRight } from 'lucide-react';

export interface ChapterInfo {
  id: number;
  title: string;
  subtitle: string;
  domain: string;
  duration: number; // in seconds
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export const CHAPTERS: ChapterInfo[] = [
  {
    id: 0,
    title: 'AI Neural Networks',
    subtitle: 'Deep Cognitive Synaptic Architecture & Generative Models',
    domain: 'Artificial Intelligence',
    duration: 5.5,
    cameraPos: [0, 1.2, 5.8],
    cameraTarget: [0, 0, 0],
  },
  {
    id: 1,
    title: 'Cybersecurity Shield',
    subtitle: 'Zero-Trust Protocol Sandboxing & Encrypted Defenses',
    domain: 'Digital Defense',
    duration: 5.5,
    cameraPos: [0, 0.8, 6.2],
    cameraTarget: [0, 0, 0],
  },
  {
    id: 2,
    title: 'Autonomous Drone Flight',
    subtitle: 'Multi-Rotor Flight Avionics & LiDAR Terrain Scanning',
    domain: 'UAV Engineering',
    duration: 5.5,
    cameraPos: [2.5, 1.8, 4.2],
    cameraTarget: [0, 0.2, 0],
  },
  {
    id: 3,
    title: 'Articulated Robotics',
    subtitle: '6-DOF Precision Mechatronics & Laser Alignment Kinematics',
    domain: 'Robotics & Automation',
    duration: 5.5,
    cameraPos: [3.2, 2.2, 5.0],
    cameraTarget: [0, 1.5, 0],
  },
  {
    id: 4,
    title: 'Software & Code Systems',
    subtitle: 'High-Concurrency Distributed Cloud Architecture',
    domain: 'Software Engineering',
    duration: 5.5,
    cameraPos: [0, 0.5, 5.5],
    cameraTarget: [0, 0, 0],
  },
  {
    id: 5,
    title: 'MARVZ & INNOVATION TECH',
    subtitle: 'Innovating Technology, Empowering the Future.',
    domain: 'Grand Brand Finale',
    duration: 7.0,
    cameraPos: [0, 0.2, 4.6],
    cameraTarget: [0, 0, 0],
  },
];

const TOTAL_ANIMATION_TIME = CHAPTERS.reduce((acc, c) => acc + c.duration, 0);

interface TechAnimationViewerProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export const TechAnimationViewer: React.FC<TechAnimationViewerProps> = ({
  onClose,
  isStandalone = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mutable refs for Three.js render loop to avoid GC
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const animationFrameRef = useRef<number>(0);
  const isPlayingRef = useRef(true);
  const currentTimeRef = useRef(0);
  const currentChapterRef = useRef(0);

  // Group references
  const groupsRef = useRef<{
    neural?: NeuralNetworkGroup;
    cyber?: CyberShieldGroup;
    drone?: DroneGroup;
    robotics?: RoboticsGroup;
    software?: SoftwareCodeGroup;
    logo?: LogoFinaleGroup;
  }>({});

  // Interaction & mouse look
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  isPlayingRef.current = isPlaying;

  // Jump to specific chapter
  const seekToChapter = useCallback((index: number) => {
    let t = 0;
    for (let i = 0; i < index; i++) {
      t += CHAPTERS[i].duration;
    }
    currentTimeRef.current = t + 0.05;
    currentChapterRef.current = index;
    setCurrentTime(t);
    setActiveChapterIndex(index);

    soundFx.playWhoosh(1.2);
    if (index === 5) {
      soundFx.playFinaleChime();
    } else {
      soundFx.playSubBass();
    }
  }, []);

  const toggleAudio = () => {
    const newState = soundFx.toggle();
    setIsMuted(!newState);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // --- THREE.JS INITIALIZATION & 60 FPS RENDER LOOP ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Software-WebGL Probe
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.065);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.8);
    cameraRef.current = camera;

    // 3. Renderer with ACESFilmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Studio Lighting Rig (Warm Key Light + Cool Ambient + Deep Red Rim)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xdc2626, 4.0, 15);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const topWhiteLight = new THREE.PointLight(0xffffff, 2.5, 12);
    topWhiteLight.position.set(0, 5, 2);
    scene.add(topWhiteLight);

    // 5. Ambient 3D Particle Cloud (1,000 glowing particles)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      particlePos[p * 3] = (Math.random() - 0.5) * 20;
      particlePos[p * 3 + 1] = (Math.random() - 0.5) * 14;
      particlePos[p * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xef4444,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // 6. Instantiate 6 Technology Chapter Models
    const neuralGroup = createNeuralNetworkModel();
    const cyberGroup = createCyberShieldModel();
    const droneGroup = createDroneModel();
    const roboticsGroup = createRoboticsModel();
    const softwareGroup = createSoftwareCodeModel();
    const logoGroup = createLogoFinaleModel();

    scene.add(neuralGroup);
    scene.add(cyberGroup);
    scene.add(droneGroup);
    scene.add(roboticsGroup);
    scene.add(softwareGroup);
    scene.add(logoGroup);

    groupsRef.current = {
      neural: neuralGroup,
      cyber: cyberGroup,
      drone: droneGroup,
      robotics: roboticsGroup,
      software: softwareGroup,
      logo: logoGroup,
    };

    // Camera target vector
    const currentTarget = new THREE.Vector3(0, 0, 0);

    // Mouse interaction listener
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = nx * 0.4;
      mouseRef.current.targetY = ny * 0.3;
    };
    container.addEventListener('mousemove', handlePointerMove);

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Initial audio cue
    soundFx.playSubBass();

    // 7. 60 FPS Render Loop
    clockRef.current.start();

    const animate = () => {
      const delta = Math.min(clockRef.current.getDelta(), 0.1);
      const elapsedTime = clockRef.current.getElapsedTime();

      // Advance timeline if playing
      if (isPlayingRef.current) {
        currentTimeRef.current += delta;
        if (currentTimeRef.current >= TOTAL_ANIMATION_TIME) {
          currentTimeRef.current = 0; // Seamless loop or restart
          soundFx.playWhoosh(1.0);
        }
        setCurrentTime(currentTimeRef.current);
      }

      // Determine active chapter based on time
      let accumulated = 0;
      let chapterIdx = 0;
      for (let c = 0; c < CHAPTERS.length; c++) {
        if (currentTimeRef.current >= accumulated && currentTimeRef.current < accumulated + CHAPTERS[c].duration) {
          chapterIdx = c;
          break;
        }
        accumulated += CHAPTERS[c].duration;
      }

      // Sound triggers on chapter transition
      if (chapterIdx !== currentChapterRef.current) {
        currentChapterRef.current = chapterIdx;
        setActiveChapterIndex(chapterIdx);
        soundFx.playWhoosh(1.0);
        if (chapterIdx === 5) {
          soundFx.playFinaleChime();
        } else {
          soundFx.playDataPulse();
        }
      }

      // Smooth camera interpolation toward active chapter camera position
      const activeChapter = CHAPTERS[chapterIdx];
      const targetCameraPos = activeChapter.cameraPos;
      const targetLook = activeChapter.cameraTarget;

      // Mouse parallax lag
      mouseRef.current.x = THREE.MathUtils.damp(mouseRef.current.x, mouseRef.current.targetX, 4, delta);
      mouseRef.current.y = THREE.MathUtils.damp(mouseRef.current.y, mouseRef.current.targetY, 4, delta);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCameraPos[0] + mouseRef.current.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCameraPos[1] + mouseRef.current.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraPos[2], 3.5, delta);

      currentTarget.x = THREE.MathUtils.damp(currentTarget.x, targetLook[0], 4, delta);
      currentTarget.y = THREE.MathUtils.damp(currentTarget.y, targetLook[1], 4, delta);
      currentTarget.z = THREE.MathUtils.damp(currentTarget.z, targetLook[2], 4, delta);
      camera.lookAt(currentTarget);

      // Visibility & model updates
      const allGroups = [neuralGroup, cyberGroup, droneGroup, roboticsGroup, softwareGroup, logoGroup];
      allGroups.forEach((grp, idx) => {
        const isCurrent = idx === chapterIdx;
        const targetScale = isCurrent ? 1.0 : 0.0001;
        grp.scale.x = THREE.MathUtils.damp(grp.scale.x, targetScale, 6, delta);
        grp.scale.y = THREE.MathUtils.damp(grp.scale.y, targetScale, 6, delta);
        grp.scale.z = THREE.MathUtils.damp(grp.scale.z, targetScale, 6, delta);
        grp.visible = grp.scale.x > 0.01;
      });

      // Update individual 3D model physics/rotations
      neuralGroup.update(elapsedTime);
      cyberGroup.update(elapsedTime);
      droneGroup.update(elapsedTime);
      roboticsGroup.update(elapsedTime);
      softwareGroup.update(elapsedTime);
      logoGroup.update(elapsedTime);

      // Rotate particle atmosphere
      particleField.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      container.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  const progressPercent = (currentTime / TOTAL_ANIMATION_TIME) * 100;
  const currentChapter = CHAPTERS[activeChapterIndex];

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        isStandalone ? 'h-screen' : 'h-[620px] sm:h-[720px]'
      } bg-[#050508] overflow-hidden select-none font-sans`}
    >
      {/* 1. TOP OVERLAY: BRAND MARK & CURRENT DOMAIN BADGE */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        
        {/* Brand Lockup */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#081426] border border-red-500/50 shadow-lg shadow-red-600/20 p-0.5 shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
              alt="MARVZ Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-white block">
              MARVZ & INNOVATION TECH
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-red-500 block">
              3D Cinematic Motion Commercial
            </span>
          </div>
        </div>

        {/* Top-Right Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors ${
              !isMuted
                ? 'bg-red-600/20 border-red-500 text-red-400'
                : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Enable 3D Sound Effects' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-black/60 border border-slate-800 text-slate-400 hover:text-white backdrop-blur-md transition-colors"
            title="Fullscreen Mode"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button if provided */}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              Back to Site
            </button>
          )}
        </div>
      </div>

      {/* 2. CENTER HOLOGRAPHIC MOTION TYPOGRAPHY */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
        {activeChapterIndex === 5 ? (
          // FINALE: Grand Logo Reveal & Tagline
          <div className="animate-in fade-in zoom-in-95 duration-1000 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 font-mono text-xs uppercase tracking-widest mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Brand Reveal</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase">
              MARVZ & INNOVATION TECH
            </h2>

            <div className="mt-4 text-lg sm:text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-400">
              "Innovating Technology, Empowering the Future."
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-mono">
              Artificial Intelligence · Cybersecurity · Drone Engineering · Robotics · Scalable Cloud
            </p>
          </div>
        ) : (
          // CHAPTER PRESENTATION
          <div className="animate-in fade-in duration-500 max-w-xl">
            <div className="text-xs font-mono tracking-widest uppercase text-red-500 mb-1">
              Chapter 0{currentChapter.id + 1} // {currentChapter.domain}
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              {currentChapter.title}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed drop-shadow">
              {currentChapter.subtitle}
            </p>
          </div>
        )}
      </div>

      {/* 3. COLLAPSIBLE BOTTOM CONTROL DOCK (Zero Viewport Occlusion) */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl transition-all duration-300 ${
          isControlsCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Tab */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="flex items-center gap-1.5 px-4 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 hover:text-white bg-[#0B0F19]/90 border-t border-x border-slate-800 rounded-t-lg backdrop-blur-md shadow-md"
            aria-label="Toggle Control Dock"
          >
            {isControlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-red-500" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Surface */}
        <div className="p-4 rounded-2xl bg-[#080C14]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
          
          {/* Progress Timeline Scrubber */}
          <div className="relative w-full h-1.5 bg-slate-900 rounded-full overflow-hidden cursor-pointer mb-3 group">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Play / Pause & Restart */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
                title={isPlaying ? 'Pause Animation' : 'Play Animation'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => seekToChapter(0)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="Restart Animation"
                aria-label="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="text-xs font-mono text-slate-400 tabular-nums ml-2">
                {currentTime.toFixed(1)}s / {TOTAL_ANIMATION_TIME.toFixed(1)}s
              </div>
            </div>

            {/* Chapter Pill Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {CHAPTERS.map((chap, idx) => (
                <button
                  key={chap.id}
                  onClick={() => seekToChapter(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeChapterIndex === idx
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  0{idx + 1}. {chap.title.split(' ')[0]}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
