# Liquid Glass for Blink'em: The Ultimate Guide

This guide adds an Apple-style "Liquid Glass" look to the Blink'em frontend (React 18, Vite, Tailwind CSS v3). It combines two layers:

1. **CSS layer:** frosted blur, saturation, and edge highlights. Works everywhere and is the fallback.
2. **WebGL layer:** a small shader that draws a glowing rim and a specular highlight that follows the cursor.

---

## 0. What You Can and Can't Get

| Effect | Achievable on the web? | How |
|---|---|---|
| Frosted blur of what's behind | Yes | `backdrop-filter` (CSS) |
| Edge highlights and depth | Yes | `box-shadow` inset + borders |
| Cursor-reactive light sheen | Yes | WebGL shader |
| Real refraction (bending the background like a lens) | Partly | Chromium-only SVG filter, or a heavier capture pipeline |
| Pixel-identical to iOS 26 / macOS Tahoe | No | Apple uses native Metal rendering and system-level compositing |

The goal is "looks like Liquid Glass to a user," not an exact copy.

---

## 1. Prerequisites

- Node.js 18+ and the existing `frontend/` setup (`npm install`, `npm run dev`)
- Tailwind CSS **v3** (your repo uses v3, so the arbitrary values in this guide work)
- The glass needs something behind it to look good: a map, a gradient, or an image

Check your Tailwind version:

```bash
cd frontend
npm ls tailwindcss
```

---

## 2. Step 1: Add the CSS Layer

Open `frontend/src/index.css` (or whichever global stylesheet you import in `main.jsx`) and add this at the bottom:

```css
/* Liquid Glass base layer */
.liquid-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

/* Fallback for browsers without backdrop-filter:
   use a more opaque surface so text stays readable */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .liquid-glass {
    background: rgba(255, 255, 255, 0.85);
  }
}

/* Dark theme variant (adjust the selector to match how Blink'em
   applies its theme, e.g. .dark or [data-theme="dark"]) */
.dark .liquid-glass {
  background: rgba(20, 22, 30, 0.35);
}
```

---

## 3. Step 2: Create the Component

Create the file `frontend/src/components/LiquidGlass.jsx`:

```jsx
import { useEffect, useRef } from "react";

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

export default function LiquidGlass({ children, className = "", radius = 28, glow = 1 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return; // No WebGL: the CSS glass still renders

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uRadius = gl.getUniformLocation(prog, "uRadius");
    const uGlow = gl.getUniformLocation(prog, "uGlow");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let mouse = { x: -1e4, y: -1e4 };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      mouse = { x: (e.clientX - r.left) * dpr, y: (r.height - (e.clientY - r.top)) * dpr };
    };
    if (!reduceMotion) window.addEventListener("pointermove", onMove);

    let raf;
    const draw = () => {
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

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [radius, glow]);

  return (
    <div
      ref={wrapRef}
      style={{ borderRadius: radius }}
      className={`liquid-glass relative isolate overflow-hidden border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_8px_32px_rgba(0,0,0,0.15)] ${className}`}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

---

## 4. Step 3: Use It

```jsx
import LiquidGlass from "../components/LiquidGlass";

<LiquidGlass className="p-4 max-w-sm" radius={24}>
  <h3 className="font-semibold">Plumber · T. Nagar</h3>
  <p className="text-sm">Quote ₹350 · ETA 8 min</p>
</LiquidGlass>
```

### Good places in Blink'em

| Location | Suggested radius | Notes |
|---|---|---|
| Bottom navigation bar (mobile) | 999 (pill) or 32 | Fixed to the bottom, glass over content |
| Offer cards on the Offers page | 24 | Overlapping the map gives the best effect |
| Floating panel over the Leaflet radar map | 28 | The map tiles give the blur something to work with |
| Voice sheet / Request Console | 32 | Top corners only if it's a bottom sheet |
| Worker "Online" toggle card | 20 | Small, high-contrast text |

For the bottom nav, make the wrapper fixed:

```jsx
<div className="fixed inset-x-4 bottom-4 z-50">
  <LiquidGlass radius={999} className="px-6 py-3">
    {/* nav icons */}
  </LiquidGlass>
</div>
```

---

## 5. Step 4: Give the Glass Something to Look Good Over

Glass without a background looks like a flat grey box. Add a colourful backdrop to the page, for example in `index.css`:

```css
body {
  background:
    radial-gradient(circle at 15% 20%, #a7f3d0 0%, transparent 40%),
    radial-gradient(circle at 85% 30%, #bfdbfe 0%, transparent 45%),
    radial-gradient(circle at 50% 90%, #fde68a 0%, transparent 40%),
    #f1f5f9;
  min-height: 100vh;
}
```

Use the same idea over the map: place the glass panel over the Leaflet container, not beside it.

---

## 6. Step 5: Readability

Liquid glass can hurt readability, especially with very transparent surfaces over busy images. Follow these rules:

- Keep body text at 4.5:1 contrast or higher against the glass. Use `text-slate-900` in light mode and `text-white` in dark mode.
- Raise the opacity if the text is hard to read: swap `.liquid-glass { background: rgba(255,255,255,0.15) }` for `0.35` on dense screens.
- Avoid placing small text over bright, detailed parts of the map.
- Respect `prefers-reduced-motion`. The component already skips cursor tracking when it's set.

---

## 7. Step 6: Performance Rules

Each `LiquidGlass` runs its own WebGL context. Browsers cap these (roughly 8 to 16), so keep the count low.

- **Do:** use it for a handful of key surfaces (nav, one or two cards at a time, floating panels).
- **Don't:** wrap every list item. Use plain `.liquid-glass` CSS (no canvas) for list items instead:

```jsx
<div className="liquid-glass rounded-2xl border border-white/30 p-3">
  {/* list item */}
</div>
```

- **Mobile:** the component caps device pixel ratio at 2. Keep it that way.
- **Stacked glass is expensive:** avoid putting one glass panel inside another.

---

## 8. Optional: Refraction Filter (Chromium Only)

For a bit of lens-style bending, add an SVG filter once in your app shell:

```jsx
<svg width="0" height="0" className="absolute">
  <filter id="lens">
    <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" />
  </filter>
</svg>
```

Then apply it to a class:

```css
.liquid-glass-refract {
  backdrop-filter: url(#lens) blur(12px) saturate(180%);
}
```

Caveats:
- Works in Chrome and Edge. Safari and Firefox ignore `url()` in `backdrop-filter`, so they fall back to plain blur.
- It's GPU-heavy. Use it on one or two elements at most.
- Test on a real mid-range Android phone before shipping.

---

## 9. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| No blur visible | Nothing behind the element | Add a background or place it over the map |
| Canvas glow not visible | Canvas has zero size | Make sure the parent has a real width and height |
| Blank white glass on Android WebView | `backdrop-filter` unsupported | The `@supports` fallback handles it; check it's in `index.css` |
| Glow is lopsided | `radius` doesn't match the CSS `borderRadius` | Pass the same `radius` prop to both (the component does this) |
| Choppy on low-end phones | Too many WebGL instances | Reduce instances, lower `glow`, or drop to CSS-only |
| Text unreadable | Glass too transparent | Raise background opacity (Section 6) |
| Tailwind classes don't apply | Tailwind v4 syntax or missing content path | Confirm v3 and that `src/**/*.jsx` is in `tailwind.config.js` `content` |
| Glow doesn't follow cursor on touch | Touch doesn't fire `pointermove` the same way | Also listen to `pointerdown` if you need touch tracking |

---

## 10. Quick Checklist

- [ ] `.liquid-glass` CSS added to `index.css`, including the `@supports` fallback
- [ ] `LiquidGlass.jsx` created in `frontend/src/components/`
- [ ] Colourful background behind the glass
- [ ] Glass used on fewer than ~6 elements at once with WebGL
- [ ] Text contrast checked in light and dark themes
- [ ] Tested on Chrome desktop, Safari iOS, and a mid-range Android phone

---

## 11. Honest Limits

- This is an approximation of Apple's Liquid Glass, not a copy. Apple's version uses system rendering that the web can't access.
- Real refraction of live DOM text requires capturing the background first, which is out of scope for this guide.
- Apple has not published a "Liquid Glass 2.0" spec. Everything here is based on the WWDC 2025 design language.
