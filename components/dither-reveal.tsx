"use client";

import { useEffect, useRef, useState } from "react";

type DitherMode = "bayer" | "diagonal" | "noise";

type DitherRevealProps = {
  src: string;
  mode?: DitherMode;
  /** Size, in device pixels, of one dither cell. */
  dotSize?: number;
  /** Reveal radius, as a fraction of the shorter canvas edge. */
  radius?: number;
  /** 0 = hard cut, 1 = long soft gradient. */
  softness?: number;
  /** How fast the idle dither pattern ripples. */
  waveSpeed?: number;
  /** Strength of the idle ripple, 0 disables it entirely. */
  waveAmount?: number;
  fit?: "cover" | "contain";
  /** 0 = top of image anchored, 1 = bottom, for cropped cover fits. */
  yAnchor?: number;
  /** >1 crops in tighter, magnifying the subject. */
  zoom?: number;
  /** Render the revealed photo in grayscale instead of full color. */
  grayscale?: boolean;
  /** Set false for a purely decorative pattern with no cursor reveal. */
  interactive?: boolean;
  ditherColorA?: string;
  ditherColorB?: string;
  className?: string;
};

const VERTEX_SRC = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision mediump float;
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uUvScale;
uniform vec2 uUvOffset;
uniform vec2 uResolution;
uniform float uTime;
uniform float uWaveSpeed;
uniform float uWaveAmount;
uniform float uDotSize;
uniform int uMode;
uniform float uRadius;
uniform float uSoftness;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform bool uGrayscale;
uniform vec4 uTrail[8];

float bayer4x4(vec2 cell) {
  float x = mod(cell.x, 4.0);
  float y = mod(cell.y, 4.0);
  if (y < 1.0) {
    if (x < 1.0) return 0.0; if (x < 2.0) return 8.0;
    if (x < 3.0) return 2.0; return 10.0;
  } else if (y < 2.0) {
    if (x < 1.0) return 12.0; if (x < 2.0) return 4.0;
    if (x < 3.0) return 14.0; return 6.0;
  } else if (y < 3.0) {
    if (x < 1.0) return 3.0; if (x < 2.0) return 11.0;
    if (x < 3.0) return 1.0; return 9.0;
  } else {
    if (x < 1.0) return 15.0; if (x < 2.0) return 7.0;
    if (x < 3.0) return 13.0; return 5.0;
  }
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float ditherThreshold(vec2 fragCoord) {
  vec2 cell = floor(fragCoord / uDotSize);
  if (uMode == 0) {
    return (bayer4x4(cell) + 0.5) / 16.0;
  } else if (uMode == 1) {
    float d = mod((cell.x + cell.y), 8.0) / 8.0;
    return d;
  }
  return hash(cell);
}

void main() {
  vec2 uv = vUv * uUvScale + uUvOffset;
  vec4 tex = vec4(0.0);
  bool inBounds = uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0;
  if (inBounds) {
    tex = texture2D(uTex, uv);
  }

  float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));

  vec2 fragCoord = vUv * uResolution;
  float threshold = ditherThreshold(fragCoord);

  float wave = sin((vUv.x + vUv.y) * 9.0 + uTime * uWaveSpeed * 0.02) * uWaveAmount;
  threshold = clamp(threshold + wave, 0.0, 1.0);

  vec3 dithered = mix(uColorA, uColorB, step(threshold, luma));

  float aspect = uResolution.x / uResolution.y;
  vec2 puv = vec2(vUv.x * aspect, vUv.y);

  float reveal = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 t = uTrail[i];
    if (t.w <= 0.0) continue;
    vec2 tp = vec2(t.x * aspect, t.y);
    float dist = distance(puv, tp);
    float edge = uRadius * max(uSoftness, 0.001);
    float amt = 1.0 - smoothstep(uRadius - edge, uRadius, dist);
    reveal = max(reveal, amt * t.w);
  }
  reveal = clamp(reveal, 0.0, 1.0);

  vec3 revealColor = uGrayscale ? vec3(luma) : tex.rgb;
  vec3 finalColor = inBounds ? mix(dithered, revealColor, reveal) : uColorA;
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return [r, g, b];
}

const MODE_INDEX: Record<DitherMode, number> = {
  bayer: 0,
  diagonal: 1,
  noise: 2,
};

const TRAIL_SIZE = 8;
const TRAIL_LIFETIME_MS = 900;

export function DitherReveal({
  src,
  mode = "bayer",
  dotSize = 4,
  radius = 0.16,
  softness = 0.6,
  waveSpeed = 82,
  waveAmount = 0.12,
  fit = "cover",
  yAnchor = 0.5,
  zoom = 1,
  grayscale = false,
  interactive = true,
  ditherColorA = "#0e0e0e",
  ditherColorB = "#f95128",
  className,
}: DitherRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      setSupported(false);
      return;
    }

    function compile(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(shader));
      }
      return shader;
    }

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      setSupported(false);
      return;
    }
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      uTex: gl.getUniformLocation(program, "uTex"),
      uUvScale: gl.getUniformLocation(program, "uUvScale"),
      uUvOffset: gl.getUniformLocation(program, "uUvOffset"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uWaveSpeed: gl.getUniformLocation(program, "uWaveSpeed"),
      uWaveAmount: gl.getUniformLocation(program, "uWaveAmount"),
      uDotSize: gl.getUniformLocation(program, "uDotSize"),
      uMode: gl.getUniformLocation(program, "uMode"),
      uRadius: gl.getUniformLocation(program, "uRadius"),
      uSoftness: gl.getUniformLocation(program, "uSoftness"),
      uColorA: gl.getUniformLocation(program, "uColorA"),
      uColorB: gl.getUniformLocation(program, "uColorB"),
      uGrayscale: gl.getUniformLocation(program, "uGrayscale"),
      uTrail: gl.getUniformLocation(program, "uTrail"),
    };

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    let uvScale: [number, number] = [1, 1];
    let uvOffset: [number, number] = [0, 0];

    function applyFit(imgW: number, imgH: number) {
      const cw = canvas!.clientWidth || 1;
      const ch = canvas!.clientHeight || 1;
      const canvasAspect = cw / ch;
      const imgAspect = imgW / imgH;

      let scaleX: number;
      let scaleY: number;
      if (fit === "cover" ? canvasAspect > imgAspect : canvasAspect < imgAspect) {
        scaleX = 1;
        scaleY = imgAspect / canvasAspect;
      } else {
        scaleY = 1;
        scaleX = canvasAspect / imgAspect;
      }
      scaleX /= zoom;
      scaleY /= zoom;
      uvScale = [scaleX, scaleY];
      const offY =
        fit === "cover" ? (1 - scaleY) * (1 - yAnchor) : (1 - scaleY) / 2;
      uvOffset = [(1 - scaleX) / 2, offY];
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    let imageReady = false;
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Images upload with row 0 (the top) at texture v=0, which reads
      // upside down against our quad's v=0-at-bottom mapping — flip on
      // upload instead so uv can be used as-is.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      applyFit(img.naturalWidth, img.naturalHeight);
      imageReady = true;
    };
    img.src = src;

    const [ra, ga, ba] = hexToRgb(ditherColorA);
    const [rb, gb, bb] = hexToRgb(ditherColorB);

    type TrailPoint = { x: number; y: number; born: number };
    const trail: TrailPoint[] = [];

    function pushTrail(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      trail.push({ x, y, born: performance.now() });
      if (trail.length > TRAIL_SIZE) trail.shift();
    }

    function onPointerMove(e: PointerEvent) {
      pushTrail(e.clientX, e.clientY);
    }

    if (interactive) {
      canvas.addEventListener("pointermove", onPointerMove);
    }

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr));
      if (canvas!.width === w && canvas!.height === h) return;
      canvas!.width = w;
      canvas!.height = h;
      gl!.viewport(0, 0, w, h);
      if (imageReady) applyFit(img.naturalWidth, img.naturalHeight);
    }

    // Size synchronously on mount — don't rely solely on the observer's
    // first callback, which some environments delay or skip.
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      resize();
      const time = (now - start) / 1000;

      const trailData = new Float32Array(TRAIL_SIZE * 4);
      const stillLive: TrailPoint[] = [];
      for (const p of trail) {
        const age = 1 - (now - p.born) / TRAIL_LIFETIME_MS;
        if (age > 0) stillLive.push(p);
      }
      trail.length = 0;
      trail.push(...stillLive);
      for (let i = 0; i < TRAIL_SIZE; i++) {
        const p = trail[trail.length - TRAIL_SIZE + i];
        if (!p) continue;
        const age = Math.max(0, 1 - (now - p.born) / TRAIL_LIFETIME_MS);
        trailData[i * 4] = p.x;
        trailData[i * 4 + 1] = p.y;
        trailData[i * 4 + 2] = 0;
        trailData[i * 4 + 3] = age;
      }

      gl!.useProgram(program);
      gl!.uniform1i(uniforms.uTex, 0);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.uniform2f(uniforms.uUvScale, uvScale[0], uvScale[1]);
      gl!.uniform2f(uniforms.uUvOffset, uvOffset[0], uvOffset[1]);
      gl!.uniform2f(uniforms.uResolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uniforms.uTime, time);
      gl!.uniform1f(uniforms.uWaveSpeed, waveSpeed);
      gl!.uniform1f(uniforms.uWaveAmount, waveAmount);
      gl!.uniform1f(uniforms.uDotSize, dotSize * dpr);
      gl!.uniform1i(uniforms.uMode, MODE_INDEX[mode]);
      gl!.uniform1f(uniforms.uRadius, radius);
      gl!.uniform1f(uniforms.uSoftness, softness);
      gl!.uniform3f(uniforms.uColorA, ra, ga, ba);
      gl!.uniform3f(uniforms.uColorB, rb, gb, bb);
      gl!.uniform1i(uniforms.uGrayscale, grayscale ? 1 : 0);
      gl!.uniform4fv(uniforms.uTrail, trailData);

      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuffer);
      gl.deleteTexture(texture);
    };
  }, [
    src,
    mode,
    dotSize,
    radius,
    softness,
    waveSpeed,
    waveAmount,
    fit,
    yAnchor,
    zoom,
    grayscale,
    interactive,
    ditherColorA,
    ditherColorB,
  ]);

  if (!supported) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} />;
  }

  return <canvas ref={canvasRef} className={className} />;
}
