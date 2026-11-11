import * as THREE from 'three';

// 1. Glowing Red Digital Circuit Ground Grid
export const createCircuitGridShader = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xdc2626) }, // Deep red
      uColorHot: { value: new THREE.Color(0xffffff) }, // Pure white core
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uColorHot;
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      void main() {
        vec2 grid = abs(fract(vUv * 30.0 - 0.5) - 0.5) / fwidth(vUv * 30.0);
        float line = min(grid.x, grid.y);
        float c = 1.0 - min(line, 1.0);

        // Circuit pulses traveling along grid coordinates
        float pulseX = sin(vUv.x * 60.0 - uTime * 4.0);
        float pulseY = cos(vUv.y * 60.0 + uTime * 3.5);
        float pulse = clamp(pulseX * pulseY * 3.0, 0.0, 1.0);

        // Distance fade-off from center
        float dist = length(vUv - vec2(0.5));
        float fade = smoothstep(0.5, 0.05, dist);

        vec3 finalColor = mix(uColor * 0.7, uColorHot * 1.5, pulse);
        float alpha = (c * 0.4 + pulse * 0.6) * fade;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
};

// 2. Holographic Cyber Shield with Hexagonal Matrix & Fresnel Glow
export const createCyberShieldShader = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uShieldColor: { value: new THREE.Color(0xdc2626) }, // Deep red
      uEdgeColor: { value: new THREE.Color(0xff4444) },
      uCoreColor: { value: new THREE.Color(0xffffff) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vUv = uv;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uShieldColor;
      uniform vec3 uEdgeColor;
      uniform vec3 uCoreColor;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel edge glow
        float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
        fresnel = pow(fresnel, 2.5);

        // Hexagonal pattern approximation
        vec2 p = vUv * 18.0;
        float hex = abs(sin(p.x * 1.73205 + p.y) * sin(p.y * 2.0));
        float hexLine = smoothstep(0.2, 0.05, hex);

        // Scanline sweep
        float scanline = sin(vUv.y * 40.0 - uTime * 6.0) * 0.5 + 0.5;

        // Combined cyber shield alpha & color
        vec3 col = mix(uShieldColor, uEdgeColor, fresnel);
        col = mix(col, uCoreColor, hexLine * 0.8 + scanline * 0.3);

        float alpha = clamp(fresnel * 0.85 + hexLine * 0.4 + scanline * 0.15, 0.0, 0.95);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
};

// 3. Soft Glowing Red & White Particles Texture
export const createParticleTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(239, 68, 68, 0.85)');
  gradient.addColorStop(0.65, 'rgba(185, 28, 28, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};
