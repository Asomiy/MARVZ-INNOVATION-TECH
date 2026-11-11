import * as THREE from 'three';
import { createCircuitGridShader, createCyberShieldShader, createParticleTexture } from './shaders';

// --- Reusable Materials ---
export const createTechMaterials = () => {
  const particleTex = createParticleTexture();

  return {
    carbonFiber: new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.35,
      metalness: 0.85,
    }),
    titaniumSilver: new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    }),
    deepRedGlow: new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.5,
    }),
    pureWhiteGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    }),
    hologramGlass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
    }),
    laserRed: new THREE.MeshBasicMaterial({
      color: 0xff0033,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    }),
    particleMat: new THREE.PointsMaterial({
      size: 0.25,
      map: particleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xff4444,
    }),
  };
};

// 1. CHAPTER 1: AI NEURAL NETWORK SCENE
export interface NeuralNetworkGroup extends THREE.Group {
  update: (time: number) => void;
}

export const createNeuralNetworkModel = (): NeuralNetworkGroup => {
  const group = new THREE.Group() as NeuralNetworkGroup;
  const materials = createTechMaterials();

  const nodeCount = 48;
  const nodes: THREE.Vector3[] = [];
  const nodeMeshes: THREE.Mesh[] = [];

  // Generate nodes in an intelligent layered neural sphere/volume
  const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;
    const r = 2.4 + Math.sin(i * 3.5) * 0.6;
    const pos = new THREE.Vector3(
      r * Math.cos(theta) * Math.sin(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(phi)
    );
    nodes.push(pos);

    const isCore = i % 5 === 0;
    const mesh = new THREE.Mesh(nodeGeo, isCore ? materials.pureWhiteGlow : materials.deepRedGlow);
    mesh.position.copy(pos);
    mesh.scale.setScalar(isCore ? 1.4 : 0.9);
    group.add(mesh);
    nodeMeshes.push(mesh);
  }

  // Interconnecting synaptic lines
  const linePositions: number[] = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dist = nodes[i].distanceTo(nodes[j]);
      if (dist < 1.7) {
        linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
        linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  // Orbiting synaptic data pulse packets
  const packetGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const packetMesh = new THREE.InstancedMesh(packetGeo, materials.pureWhiteGlow, 20);
  const dummy = new THREE.Object3D();
  group.add(packetMesh);

  // Concentric holographic matrix rings
  const ringGeo = new THREE.RingGeometry(3.2, 3.24, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xdc2626,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  group.update = (time: number) => {
    group.rotation.y = time * 0.25;
    group.rotation.x = Math.sin(time * 0.15) * 0.12;

    // Pulse node scales
    nodeMeshes.forEach((m, idx) => {
      const s = 1.0 + Math.sin(time * 3.0 + idx) * 0.25;
      m.scale.setScalar(s);
    });

    // Animate data packets traversing lines
    for (let k = 0; k < 20; k++) {
      const pIdx = (k * 2) % nodes.length;
      const targetIdx = (pIdx + 3) % nodes.length;
      const progress = (time * 0.8 + k * 0.1) % 1.0;
      dummy.position.lerpVectors(nodes[pIdx], nodes[targetIdx], progress);
      dummy.scale.setScalar(1.2 - Math.abs(progress - 0.5) * 0.8);
      dummy.updateMatrix();
      packetMesh.setMatrixAt(k, dummy.matrix);
    }
    packetMesh.instanceMatrix.needsUpdate = true;
  };

  return group;
};

// 2. CHAPTER 2: CYBERSECURITY ENCRYPTED SHIELD SCENE
export interface CyberShieldGroup extends THREE.Group {
  update: (time: number) => void;
}

export const createCyberShieldModel = (): CyberShieldGroup => {
  const group = new THREE.Group() as CyberShieldGroup;
  const materials = createTechMaterials();

  // 3D Hexagonal Defense Shield
  const shieldGeo = new THREE.IcosahedronGeometry(2.2, 3);
  const shieldMat = createCyberShieldShader();
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  group.add(shieldMesh);

  // Encrypted Rotating Defense Rings
  const ringGeo1 = new THREE.TorusGeometry(3.0, 0.04, 16, 100);
  const ring1 = new THREE.Mesh(ringGeo1, materials.deepRedGlow);
  group.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(3.4, 0.03, 16, 100);
  const ring2 = new THREE.Mesh(ringGeo2, materials.titaniumSilver);
  group.add(ring2);

  // Encrypted Floating Data Bit Cubes
  const cubeCount = 24;
  const cubeGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  const cubeInstanced = new THREE.InstancedMesh(cubeGeo, materials.titaniumSilver, cubeCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < cubeCount; i++) {
    const angle = (i / cubeCount) * Math.PI * 2;
    const radius = 2.6 + Math.sin(i) * 0.3;
    dummy.position.set(Math.cos(angle) * radius, (Math.sin(i * 2) * 0.8), Math.sin(angle) * radius);
    dummy.rotation.set(i, i * 2, 0);
    dummy.updateMatrix();
    cubeInstanced.setMatrixAt(i, dummy.matrix);
  }
  group.add(cubeInstanced);

  // Central Cryptographic Core
  const coreGeo = new THREE.OctahedronGeometry(0.8, 0);
  const core = new THREE.Mesh(coreGeo, materials.pureWhiteGlow);
  group.add(core);

  group.update = (time: number) => {
    (shieldMat.uniforms.uTime as { value: number }).value = time;
    shieldMesh.rotation.y = time * 0.2;
    shieldMesh.rotation.x = Math.cos(time * 0.25) * 0.1;

    ring1.rotation.x = time * 0.6;
    ring1.rotation.y = time * 0.4;

    ring2.rotation.y = -time * 0.5;
    ring2.rotation.z = time * 0.3;

    core.rotation.x = time * 1.2;
    core.rotation.y = time * 1.5;
    const pulse = 1.0 + Math.sin(time * 4.0) * 0.15;
    core.scale.setScalar(pulse);

    // Orbiting data blocks
    for (let i = 0; i < cubeCount; i++) {
      const angle = (i / cubeCount) * Math.PI * 2 + time * 0.5;
      const radius = 2.6 + Math.sin(i + time) * 0.2;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(i * 2 + time * 2) * 0.8, Math.sin(angle) * radius);
      dummy.rotation.x = time * 2 + i;
      dummy.rotation.y = time * 1.5 + i;
      dummy.updateMatrix();
      cubeInstanced.setMatrixAt(i, dummy.matrix);
    }
    cubeInstanced.instanceMatrix.needsUpdate = true;
  };

  return group;
};

// 3. CHAPTER 3: AUTONOMOUS DRONE FLIGHT SCENE
export interface DroneGroup extends THREE.Group {
  update: (time: number) => void;
}

export const createDroneModel = (): DroneGroup => {
  const group = new THREE.Group() as DroneGroup;
  const materials = createTechMaterials();

  // 1. Central Aerodynamic Carbon-Fiber Fuselage
  const bodyGeo = new THREE.BoxGeometry(0.8, 0.28, 1.2);
  const body = new THREE.Mesh(bodyGeo, materials.carbonFiber);
  group.add(body);

  // Top canopy with silver titanium finish
  const canopyGeo = new THREE.ConeGeometry(0.35, 0.8, 4);
  const canopy = new THREE.Mesh(canopyGeo, materials.titaniumSilver);
  canopy.rotation.x = Math.PI / 2;
  canopy.position.set(0, 0.18, -0.1);
  group.add(canopy);

  // 2. Diagonal Boom Arms (4 arms)
  const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
  const arm1 = new THREE.Mesh(armGeo, materials.carbonFiber);
  arm1.rotation.z = Math.PI / 2;
  arm1.rotation.y = Math.PI / 4;
  group.add(arm1);

  const arm2 = new THREE.Mesh(armGeo, materials.carbonFiber);
  arm2.rotation.z = Math.PI / 2;
  arm2.rotation.y = -Math.PI / 4;
  group.add(arm2);

  // 3. Four Brushless Motor Pods & Spinning Propellers
  const propGroups: THREE.Group[] = [];
  const motorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16);
  const bladeGeo = new THREE.BoxGeometry(1.2, 0.02, 0.08);

  const motorPositions = [
    new THREE.Vector3(0.9, 0.1, 0.9),
    new THREE.Vector3(-0.9, 0.1, 0.9),
    new THREE.Vector3(0.9, 0.1, -0.9),
    new THREE.Vector3(-0.9, 0.1, -0.9),
  ];

  motorPositions.forEach((pos, i) => {
    // Motor housing
    const motor = new THREE.Mesh(motorGeo, materials.titaniumSilver);
    motor.position.copy(pos);
    group.add(motor);

    // Glowing LED beacon under motor
    const ledGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const led = new THREE.Mesh(ledGeo, i % 2 === 0 ? materials.deepRedGlow : materials.pureWhiteGlow);
    led.position.set(pos.x, pos.y - 0.12, pos.z);
    group.add(led);

    // Propeller assembly
    const propGroup = new THREE.Group();
    propGroup.position.set(pos.x, pos.y + 0.12, pos.z);
    const blade1 = new THREE.Mesh(bladeGeo, materials.carbonFiber);
    propGroup.add(blade1);
    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI / 2;
    propGroup.add(blade2);

    group.add(propGroup);
    propGroups.push(propGroup);
  });

  // 4. Gimbal Optical Sensor & LiDAR Scanning Beam
  const gimbalGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const gimbal = new THREE.Mesh(gimbalGeo, materials.titaniumSilver);
  gimbal.position.set(0, -0.22, 0.45);
  group.add(gimbal);

  // Projected LiDAR cone
  const coneGeo = new THREE.ConeGeometry(1.6, 3.2, 16, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const lidarCone = new THREE.Mesh(coneGeo, coneMat);
  lidarCone.position.set(0, -1.8, 0.45);
  lidarCone.rotation.x = Math.PI;
  group.add(lidarCone);

  group.update = (time: number) => {
    // High-speed propeller rotation
    propGroups.forEach((pg, idx) => {
      pg.rotation.y += (idx % 2 === 0 ? 0.8 : -0.8);
    });

    // Cinematic flight hover with pitch & roll dynamics
    group.position.y = Math.sin(time * 2.5) * 0.15;
    group.position.x = Math.sin(time * 1.2) * 0.35;
    group.rotation.z = Math.sin(time * 1.5) * 0.08;
    group.rotation.x = Math.cos(time * 1.8) * 0.06;
    group.rotation.y = Math.sin(time * 0.8) * 0.2;

    // LiDAR cone pulse
    lidarCone.scale.set(
      1.0 + Math.sin(time * 6.0) * 0.08,
      1.0,
      1.0 + Math.sin(time * 6.0) * 0.08
    );
  };

  return group;
};

// 4. CHAPTER 4: ADVANCED INDUSTRIAL ROBOTICS ARM SCENE
export interface RoboticsGroup extends THREE.Group {
  update: (time: number) => void;
}

export const createRoboticsModel = (): RoboticsGroup => {
  const group = new THREE.Group() as RoboticsGroup;
  const materials = createTechMaterials();

  // Base platform
  const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.35, 32);
  const base = new THREE.Mesh(baseGeo, materials.carbonFiber);
  group.add(base);

  // Rotating shoulder pedestal
  const shoulderPedestal = new THREE.Group();
  shoulderPedestal.position.y = 0.25;
  group.add(shoulderPedestal);

  const turretGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 24);
  const turret = new THREE.Mesh(turretGeo, materials.titaniumSilver);
  shoulderPedestal.add(turret);

  // Upper Arm Link
  const upperArmGroup = new THREE.Group();
  upperArmGroup.position.set(0, 0.35, 0);
  shoulderPedestal.add(upperArmGroup);

  const upperArmGeo = new THREE.BoxGeometry(0.35, 1.8, 0.4);
  const upperArm = new THREE.Mesh(upperArmGeo, materials.carbonFiber);
  upperArm.position.y = 0.9;
  upperArmGroup.add(upperArm);

  // Forearm Joint & Elbow
  const elbowGroup = new THREE.Group();
  elbowGroup.position.set(0, 1.8, 0);
  upperArmGroup.add(elbowGroup);

  const elbowPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 16), materials.titaniumSilver);
  elbowPivot.rotation.z = Math.PI / 2;
  elbowGroup.add(elbowPivot);

  const forearmGeo = new THREE.BoxGeometry(0.28, 1.5, 0.3);
  const forearm = new THREE.Mesh(forearmGeo, materials.titaniumSilver);
  forearm.position.y = 0.75;
  elbowGroup.add(forearm);

  // Wrist & Two-Finger Pneumatic Gripper
  const wristGroup = new THREE.Group();
  wristGroup.position.set(0, 1.5, 0);
  elbowGroup.add(wristGroup);

  const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), materials.deepRedGlow);
  wristGroup.add(wrist);

  const fingerGeo = new THREE.BoxGeometry(0.08, 0.4, 0.12);
  const finger1 = new THREE.Mesh(fingerGeo, materials.titaniumSilver);
  finger1.position.set(0.12, 0.25, 0);
  wristGroup.add(finger1);

  const finger2 = new THREE.Mesh(fingerGeo, materials.titaniumSilver);
  finger2.position.set(-0.12, 0.25, 0);
  wristGroup.add(finger2);

  // Precision Laser Alignment Beam
  const beamGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.5, 8);
  const laserBeam = new THREE.Mesh(beamGeo, materials.laserRed);
  laserBeam.position.y = 2.0;
  wristGroup.add(laserBeam);

  group.update = (time: number) => {
    // Realistic kinematic articulation cycles
    shoulderPedestal.rotation.y = Math.sin(time * 0.8) * 0.6;
    upperArmGroup.rotation.z = Math.sin(time * 1.2) * 0.35 + 0.15;
    elbowGroup.rotation.z = -Math.cos(time * 1.2) * 0.5 - 0.2;
    wristGroup.rotation.z = Math.sin(time * 1.5) * 0.4;
    wristGroup.rotation.y = time * 1.5;

    // Gripper clamping pulsation
    const grip = 0.1 + Math.sin(time * 3.0) * 0.04;
    finger1.position.x = grip;
    finger2.position.x = -grip;
  };

  return group;
};

// 5. CHAPTER 5: SOFTWARE & CODE TO ARCHITECTURE SCENE
export interface SoftwareCodeGroup extends THREE.Group {
  update: (time: number) => void;
}

export const createSoftwareCodeModel = (): SoftwareCodeGroup => {
  const group = new THREE.Group() as SoftwareCodeGroup;
  const materials = createTechMaterials();

  // Floating Holographic Terminal Windows
  const winGeo = new THREE.PlaneGeometry(2.4, 1.4);
  const windows: THREE.Mesh[] = [];

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const mesh = new THREE.Mesh(winGeo, materials.hologramGlass);
    mesh.position.set(Math.cos(angle) * 2.2, (i - 1.5) * 0.5, Math.sin(angle) * 2.2);
    mesh.lookAt(0, mesh.position.y, 0);
    group.add(mesh);
    windows.push(mesh);
  }

  // Floating Monospace Syntax Cubes (Simulating lines of code synthesizing into 3D app blocks)
  const codeCount = 60;
  const codeGeo = new THREE.BoxGeometry(0.25, 0.04, 0.06);
  const codeInstanced = new THREE.InstancedMesh(codeGeo, materials.deepRedGlow, codeCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < codeCount; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 3.5,
      (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 3.5
    );
    dummy.scale.set(Math.random() * 2 + 1, 1, 1);
    dummy.updateMatrix();
    codeInstanced.setMatrixAt(i, dummy.matrix);
  }
  group.add(codeInstanced);

  // Central Holographic App Cube
  const appWireGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const appWire = new THREE.Mesh(appWireGeo, wireframeMat);
  group.add(appWire);

  group.update = (time: number) => {
    group.rotation.y = time * 0.2;
    appWire.rotation.x = time * 0.4;
    appWire.rotation.y = time * 0.6;

    // Windows hover breathing
    windows.forEach((w, i) => {
      w.position.y += Math.sin(time * 2.0 + i) * 0.002;
    });
  };

  return group;
};

// 6. CHAPTER 6: GRAND FINALE - 3D MARVZ LOGO REVEAL & TAGLINE SCENE
export interface LogoFinaleGroup extends THREE.Group {
  update: (time: number) => void;
}

export const createLogoFinaleModel = (): LogoFinaleGroup => {
  const group = new THREE.Group() as LogoFinaleGroup;
  const materials = createTechMaterials();

  // Central Emblem Backing
  const emblemGroup = new THREE.Group();
  group.add(emblemGroup);

  // 1. Load the official logo as high-res texture on the central pedestal
  const textureLoader = new THREE.TextureLoader();
  const logoTexture = textureLoader.load('/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG');
  logoTexture.colorSpace = THREE.SRGBColorSpace;

  const plaqueGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.12, 64);
  const plaqueMat = new THREE.MeshStandardMaterial({
    color: 0x081426,
    metalness: 0.9,
    roughness: 0.2,
  });
  const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaque.rotation.x = Math.PI / 2;
  emblemGroup.add(plaque);

  // Logo Face Plane with official emblem
  const faceGeo = new THREE.CircleGeometry(1.55, 64);
  const faceMat = new THREE.MeshBasicMaterial({
    map: logoTexture,
    transparent: true,
  });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.z = 0.07;
  emblemGroup.add(face);

  // 2. 3D Titanium Outer Ring with Glowing Crimson Red Trajectory
  const orbitTorusGeo = new THREE.TorusGeometry(2.1, 0.05, 16, 120);
  const orbitRing = new THREE.Mesh(orbitTorusGeo, materials.deepRedGlow);
  orbitRing.rotation.x = Math.PI / 3;
  orbitRing.rotation.y = Math.PI / 6;
  emblemGroup.add(orbitRing);

  // Secondary Pure White Precision Bevel Ring
  const outerRingGeo = new THREE.TorusGeometry(1.7, 0.04, 16, 100);
  const outerRing = new THREE.Mesh(outerRingGeo, materials.titaniumSilver);
  emblemGroup.add(outerRing);

  // 3. Volumetric Light Shaft Rays
  const rayCount = 12;
  const rayGeo = new THREE.ConeGeometry(0.12, 5.0, 8, 1, true);
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const raysGroup = new THREE.Group();
  for (let r = 0; r < rayCount; r++) {
    const angle = (r / rayCount) * Math.PI * 2;
    const ray = new THREE.Mesh(rayGeo, rayMat);
    ray.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, -1.0);
    ray.rotation.z = angle + Math.PI / 2;
    ray.rotation.x = Math.PI / 2;
    raysGroup.add(ray);
  }
  emblemGroup.add(raysGroup);

  // 4. Converging Circuit Lines along Floor
  const circuitFloor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), createCircuitGridShader());
  circuitFloor.rotation.x = -Math.PI / 2;
  circuitFloor.position.y = -2.5;
  group.add(circuitFloor);

  group.update = (time: number) => {
    // Majestic logo breathing & slow tilt
    emblemGroup.rotation.y = Math.sin(time * 0.4) * 0.15;
    emblemGroup.rotation.x = Math.cos(time * 0.3) * 0.08;

    orbitRing.rotation.z = time * 0.8;
    raysGroup.rotation.z = -time * 0.3;

    // Pulse red glow intensity
    const pulse = 1.8 + Math.sin(time * 3.0) * 0.6;
    materials.deepRedGlow.emissiveIntensity = pulse;
  };

  return group;
};
