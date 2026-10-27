import { useEffect, useRef } from 'react';

const VS = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FS = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uGlow;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = frag - uRes * 0.5;
  vec2 b = uRes * 0.5 - 1.0;

  float d = sdRoundBox(p, b, uRadius);
  float mask = smoothstep(0.7, -0.7, d);
  if (mask <= 0.0) { gl_FragColor = vec4(0.0); return; }

  float e = 1.0;
  vec2 n = normalize(vec2(
    sdRoundBox(p + vec2(e, 0.0), b, uRadius) - sdRoundBox(p - vec2(e, 0.0), b, uRadius),
    sdRoundBox(p + vec2(0.0, e), b, uRadius) - sdRoundBox(p - vec2(0.0, e), b, uRadius)
  ) + 1e-6);

  float rim = 1.0 - smoothstep(0.0, uRadius * 0.25, -d);
  vec2 toMouse = normalize(uMouse - frag + 1e-3);
  float spec = pow(max(dot(n, toMouse), 0.0), 6.0);
  float sheen = max(dot(n, normalize(vec2(-0.5, 0.85))), 0.0);

  float alpha = rim * (0.2 + 0.3 * sheen) + spec * rim * 0.6 * uGlow;
  gl_FragColor = vec4(1.0, 1.0, 1.0, clamp(alpha, 0.0, 1.0) * mask);
}
`;

export default function LiquidGlass({
  children,
  className = '',
  radius = 28,
  glow = 1,
  as: Component = 'div',
  ...props
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let gl;
    let buf;
    let prog;
    let ro;
    let raf;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onPointer = (e) => {
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      mouse = {
        x: (e.clientX - r.left) * dpr,
        y: (r.height - (e.clientY - r.top)) * dpr,
      };
    };

    const onTouch = (e) => {
      if (!wrap || !e.touches || !e.touches[0]) return;
      const t = e.touches[0];
      const r = wrap.getBoundingClientRect();
      mouse = {
        x: (t.clientX - r.left) * dpr,
        y: (r.height - (t.clientY - r.top)) * dpr,
      };
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let mouse = { x: -1e4, y: -1e4 };

    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
      if (!gl) return; // Fallback to CSS glass if WebGL unavailable

      const compile = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };

      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      const loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(prog, 'uRes');
      const uMouse = gl.getUniformLocation(prog, 'uMouse');
      const uRadius = gl.getUniformLocation(prog, 'uRadius');
      const uGlow = gl.getUniformLocation(prog, 'uGlow');

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const resize = () => {
        if (!wrap || !canvas) return;
        const r = wrap.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(r.width * dpr));
        canvas.height = Math.max(1, Math.round(r.height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
      };

      ro = new ResizeObserver(resize);
      ro.observe(wrap);
      resize();

      if (!reduceMotion) {
        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('pointerdown', onPointer, { passive: true });
        window.addEventListener('touchmove', onTouch, { passive: true });
        window.addEventListener('touchstart', onTouch, { passive: true });
      }

      const draw = () => {
        if (!gl || !canvas) return;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uRadius, radius * dpr);
        gl.uniform1f(uGlow, glow);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!reduceMotion) raf = requestAnimationFrame(draw);
      };
      draw();
    } catch (webglErr) {
      console.warn('LiquidGlass WebGL fallback to CSS:', webglErr);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (!reduceMotion) {
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('pointerdown', onPointer);
        window.removeEventListener('touchmove', onTouch);
        window.removeEventListener('touchstart', onTouch);
      }
      try {
        if (gl && buf) gl.deleteBuffer(buf);
        if (gl && prog) gl.deleteProgram(prog);
      } catch {
        // ignore cleanup errors
      }
    };
  }, [radius, glow]);

  return (
    <Component
      ref={wrapRef}
      style={{ borderRadius: radius }}
      className={`liquid-glass relative isolate overflow-hidden border border-white/35 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_8px_32px_rgba(0,0,0,0.12)] ${className}`}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative z-10 w-full">{children}</div>
    </Component>
  );
}
