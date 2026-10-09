// The Current: a river of liquid metal behind the home hero, with a GPU ripple
// simulation so the surface bends, refracts and splits colour under the
// pointer. Three passes in ogl: liquid base -> ripple sim (ping-pong) ->
// composite with refraction, chromatic aberration and specular. One static
// frame under reduced motion, paused when off screen or the tab is hidden.
// Mounts after load, during idle time. A software GL context never starts
// the loop (the CSS backdrop stays). If frames stay slower than about 50ms,
// drop to dpr 1 and then hold the last frame.
import { Renderer, Program, Mesh, Triangle, RenderTarget, Vec2 } from 'ogl';

const quad = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const noise = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.05 + 7.3; a *= 0.5; }
    return v;
  }
`;

// Pass 1: the liquid. A winding band of molten copper in a black bed, shaded
// like metal: domain-warped noise for the surface, hard specular, soft rim.
const liquidFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  varying vec2 vUv;
  ${noise}
  float band(vec2 p, float t) {
    float c = 0.5 + 0.16 * sin(p.x * 2.4 + t * 0.25) + 0.07 * sin(p.x * 5.3 - t * 0.18 + 1.2);
    return p.y - c;
  }
  float height(vec2 p, float t) {
    vec2 flow = vec2(t * 0.09, 0.0);
    vec2 q = vec2(fbm(p * 1.6 + flow), fbm(p * 1.6 + vec2(5.2, 1.3) - flow * 0.7));
    vec2 w = p + 0.9 * q;
    return fbm(w * 2.2 + flow * 1.6) * 0.75 + fbm(w * 6.0 - flow) * 0.25;
  }
  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(vUv.x * aspect, vUv.y);
    float t = uTime;
    float d = band(p, t);
    float inside = 1.0 - smoothstep(0.10, 0.30, abs(d));
    float core = 1.0 - smoothstep(0.0, 0.12, abs(d));

    float e = 0.0025;
    float h = height(p, t);
    float hx = height(p + vec2(e, 0.0), t) - h;
    float hy = height(p + vec2(0.0, e), t) - h;
    vec3 n = normalize(vec3(-hx, -hy, e * 1.2));
    vec3 L = normalize(vec3(-0.45, 0.6, 0.65));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);
    float diff = max(dot(n, L), 0.0);
    float spec = pow(max(dot(n, H), 0.0), 48.0);
    float spec2 = pow(max(dot(n, H), 0.0), 8.0);
    float rim = pow(1.0 - max(dot(n, V), 0.0), 2.2);

    vec3 bed = vec3(0.012, 0.011, 0.012);
    vec3 copper = vec3(0.78, 0.42, 0.22);
    vec3 ember = vec3(1.0, 0.70, 0.46);
    vec3 shadow = vec3(0.16, 0.1, 0.07);

    vec3 metal = mix(copper * 0.35, copper, diff);
    metal += ember * spec * 1.4 + ember * spec2 * 0.25;
    metal += shadow * rim * 0.9;
    metal *= 0.55 + 0.45 * core;

    // Dark liquid outside the band still catches a little light.
    vec3 outer = bed + shadow * rim * 0.45 + vec3(0.6, 0.5, 0.42) * spec * 0.25;
    vec3 col = mix(outer, metal, inside);

    float vig = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(1.1, 1.4)));
    col *= 0.55 + 0.45 * vig;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Variant: the signal field. A floor of research signals receding to a
// horizon, lighting up as intent fires, for the Demand Intelligence hero.
const signalFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  varying vec2 vUv;
  ${noise}
  void main() {
    float aspect = uRes.x / uRes.y;
    vec3 bed = vec3(0.012, 0.011, 0.012);
    vec3 copper = vec3(0.78, 0.42, 0.22);
    vec3 ember = vec3(1.0, 0.70, 0.46);
    vec3 col = bed;
    float hz = 0.64;
    float fy = hz - vUv.y;
    if (fy > 0.002) {
      float depth = 0.05 / fy;
      vec2 g = vec2((vUv.x - 0.5) * aspect * depth * 2.4, depth * 1.6 + uTime * 0.25);
      vec2 cell = floor(g);
      vec2 f = fract(g) - 0.5;
      float r = length(f);
      float sig = fbm(cell * 0.3 + uTime * 0.04);
      float seed = hash(cell);
      float pulse = pow(max(0.0, sin(uTime * 1.3 + seed * 6.283)), 8.0) * step(0.82, hash(cell + 3.1));
      float dot = smoothstep(0.14 + sig * 0.08, 0.0, r);
      float fog = exp(-depth * 0.16);
      vec3 c = mix(copper * 0.5, ember, sig) * (0.2 + 0.8 * sig) + ember * pulse * 1.8;
      col += c * dot * fog;
      float gl = smoothstep(0.02, 0.0, min(abs(f.x), abs(f.y))) * 0.05 * fog;
      col += copper * gl;
    }
    col += copper * exp(-abs(vUv.y - hz) * 26.0) * 0.22;
    col += ember * exp(-abs(vUv.y - hz) * 90.0) * 0.28;
    float vig = smoothstep(1.3, 0.4, length((vUv - 0.5) * vec2(1.1, 1.3)));
    col *= 0.6 + 0.4 * vig;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Pass 2: wave equation on a small float texture. R = height, G = previous.
const simFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D tPrev;
  uniform vec2 uTexel;
  uniform vec2 uMouse;
  uniform vec2 uVel;
  uniform float uRadius;
  uniform float uAspect;
  varying vec2 vUv;
  void main() {
    vec2 c = texture2D(tPrev, vUv).rg;
    float sum = texture2D(tPrev, vUv + vec2(uTexel.x, 0.0)).r
              + texture2D(tPrev, vUv - vec2(uTexel.x, 0.0)).r
              + texture2D(tPrev, vUv + vec2(0.0, uTexel.y)).r
              + texture2D(tPrev, vUv - vec2(0.0, uTexel.y)).r;
    float next = sum * 0.5 - c.g;
    next *= 0.985;
    vec2 dm = (vUv - uMouse) * vec2(uAspect, 1.0);
    float drop = exp(-dot(dm, dm) / (uRadius * uRadius));
    next += drop * min(length(uVel) * 60.0, 1.0);
    next = clamp(next, -1.0, 1.0);
    gl_FragColor = vec4(next, c.r, 0.0, 1.0);
  }
`;

// Pass 3: refract the liquid through the ripples.
const compFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D tBase;
  uniform sampler2D tSim;
  uniform vec2 uTexel;
  uniform float uRefr;
  uniform float uSpec;
  varying vec2 vUv;
  void main() {
    float hl = texture2D(tSim, vUv - vec2(uTexel.x, 0.0)).r;
    float hr = texture2D(tSim, vUv + vec2(uTexel.x, 0.0)).r;
    float hd = texture2D(tSim, vUv - vec2(0.0, uTexel.y)).r;
    float hu = texture2D(tSim, vUv + vec2(0.0, uTexel.y)).r;
    vec2 grad = vec2(hr - hl, hu - hd);
    float refr = uRefr;
    float ca = uRefr * 0.23;
    float r = texture2D(tBase, vUv + grad * (refr + ca)).r;
    float g = texture2D(tBase, vUv + grad * refr).g;
    float b = texture2D(tBase, vUv + grad * (refr - ca)).b;
    vec3 col = vec3(r, g, b);
    vec3 n = normalize(vec3(-grad * 40.0, 1.0));
    vec3 L = normalize(vec3(-0.4, 0.7, 0.6));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(n, H), 0.0), 90.0);
    col += vec3(1.0, 0.93, 0.85) * spec * uSpec;
    col -= (hr + hl + hu + hd) * 0.02;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const FRAME_BUDGET = 50;

// SwiftShader, llvmpipe and the Windows basic renderer are software GL.
// Same outcome for every visitor: no loop, CSS hero stays.
function softwareGl(gl) {
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  if (!ext) return false;
  const info = `${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || ''}`;
  return /swiftshader|llvmpipe|softpipe|lavapipe|basic render/i.test(info);
}

function mountRiverNow(host, { variant = 'liquid' } = {}) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const powerPreference = 'default';
  const canvas = document.createElement('canvas');
  const attributes = {
    alpha: false,
    antialias: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference,
    failIfMajorPerformanceCaveat: true,
  };
  const probe =
    canvas.getContext('webgl2', attributes) || canvas.getContext('webgl', attributes);
  if (!probe || softwareGl(probe)) return;

  const renderer = new Renderer({
    canvas,
    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    alpha: false,
    antialias: false,
    powerPreference,
  });
  const gl = renderer.gl;
  if (!gl) return;
  const floatOk = !!(
    gl.getExtension('EXT_color_buffer_float') ||
    gl.getExtension('EXT_color_buffer_half_float')
  );

  const geometry = new Triangle(gl);
  const res = new Vec2(1, 1);
  const liquid = new Mesh(gl, {
    geometry,
    program: new Program(gl, {
      vertex: quad,
      fragment: variant === 'signals' ? signalFrag : liquidFrag,
      uniforms: { uTime: { value: 0 }, uRes: { value: res } },
    }),
  });

  let base, simA, simB, sim, comp, simTexel, compTexel;
  const mouse = new Vec2(-10, -10);
  const vel = new Vec2(0, 0);
  const last = new Vec2(-10, -10);

  const makeTargets = () => {
    const w = gl.canvas.width,
      h = gl.canvas.height;
    base = new RenderTarget(gl, {
      width: w,
      height: h,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });
    if (!floatOk) return;
    const sw = Math.min(512, w),
      sh = Math.round((sw * h) / w) || 1;
    const opts = {
      width: sw,
      height: sh,
      type: gl.HALF_FLOAT,
      internalFormat: gl.RGBA16F,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      depth: false,
    };
    simA = new RenderTarget(gl, opts);
    simB = new RenderTarget(gl, opts);
    simTexel = new Vec2(1 / sw, 1 / sh);
    compTexel = new Vec2(1 / sw, 1 / sh);
    sim = new Mesh(gl, {
      geometry,
      program: new Program(gl, {
        vertex: quad,
        fragment: simFrag,
        uniforms: {
          tPrev: { value: simA.texture },
          uTexel: { value: simTexel },
          uMouse: { value: mouse },
          uVel: { value: vel },
          uRadius: { value: 0.045 },
          uAspect: { value: w / h },
        },
      }),
    });
    comp = new Mesh(gl, {
      geometry,
      program: new Program(gl, {
        vertex: quad,
        fragment: compFrag,
        uniforms: {
          tBase: { value: base.texture },
          tSim: { value: simA.texture },
          uTexel: { value: compTexel },
          uRefr: { value: variant === 'signals' ? 0.05 : 0.3 },
          uSpec: { value: variant === 'signals' ? 0.35 : 1.2 },
        },
      }),
    });
  };

  const resize = () => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    res.set(gl.canvas.width, gl.canvas.height);
    makeTargets();
  };
  window.addEventListener('resize', resize);
  resize();

  const area = host.parentElement;
  area.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    mouse.set(
      (e.clientX - r.left) / r.width,
      1 - (e.clientY - r.top) / r.height,
    );
  });
  area.addEventListener('pointerleave', () => mouse.set(-10, -10));
  // A tap or click drops a stone: the only way to touch the water on phones.
  area.addEventListener('pointerdown', (e) => {
    const r = host.getBoundingClientRect();
    mouse.set(
      (e.clientX - r.left) / r.width,
      1 - (e.clientY - r.top) / r.height,
    );
    last.set(mouse.x - 0.02, mouse.y - 0.02);
  });

  const present = () => {
    if (!host.contains(gl.canvas)) host.appendChild(gl.canvas);
  };
  const render = (t) => {
    const started = performance.now();
    const over = () => performance.now() - started > FRAME_BUDGET;
    liquid.program.uniforms.uTime.value = t / 1000;
    if (!floatOk) {
      renderer.render({ scene: liquid });
      present();
      return performance.now() - started;
    }
    renderer.render({ scene: liquid, target: base });
    if (over()) return performance.now() - started;
    vel.set(mouse.x - last.x, mouse.y - last.y);
    if (last.x < -1 || mouse.x < -1) vel.set(0, 0);
    last.copy(mouse);
    sim.program.uniforms.tPrev.value = simA.texture;
    renderer.render({ scene: sim, target: simB });
    if (over()) return performance.now() - started;
    [simA, simB] = [simB, simA];
    comp.program.uniforms.tSim.value = simA.texture;
    comp.program.uniforms.tBase.value = base.texture;
    renderer.render({ scene: comp });
    present();
    return performance.now() - started;
  };

  let frame = 0;
  let running = false;
  let frozen = false;
  let degraded = false;
  const costs = [];
  const stop = () => {
    cancelAnimationFrame(frame);
    running = false;
  };
  // 3 slow frames in the window, or a 10-frame average past the budget:
  // step down to dpr 1 once, then hold whatever frame is already on screen.
  const judge = (cost) => {
    costs.push(cost);
    if (costs.length > 10) costs.shift();
    const slow = costs.reduce((n, c) => n + (c > FRAME_BUDGET ? 1 : 0), 0);
    const avg = costs.reduce((n, c) => n + c, 0) / costs.length;
    if (slow < 3 && !(costs.length >= 10 && avg > FRAME_BUDGET)) return 'ok';
    costs.length = 0;
    if (!degraded && renderer.dpr > 1) {
      degraded = true;
      return 'degrade';
    }
    return 'freeze';
  };
  const loop = (t) => {
    if (!running || frozen) return;
    const action = judge(render(t));
    if (action === 'freeze') {
      frozen = true;
      running = false;
      return;
    }
    if (action === 'degrade') {
      frame = requestAnimationFrame((now) => {
        if (!running || frozen) return;
        renderer.dpr = 1;
        resize();
        loop(now);
      });
      return;
    }
    frame = requestAnimationFrame(loop);
  };
  let onScreen = false;
  let visible = !document.hidden;
  const start = () => {
    if (running || reduce || frozen || !onScreen || !visible) return;
    running = true;
    frame = requestAnimationFrame(loop);
  };
  if (reduce) {
    render(0);
    return;
  }
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) start();
    else stop();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) start();
    else stop();
  });
}

export function mountRiver(host, options) {
  const boot = () => {
    if (!host.isConnected) return;
    try {
      mountRiverNow(host, options);
    } catch {
      // A failed GL setup leaves the CSS backdrop in place.
    }
  };
  const idle = () => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(boot, { timeout: 2000 });
    else setTimeout(boot, 1);
  };
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}
