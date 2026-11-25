import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const BLUE = 0x2f2fff, YELLOW = 0xffc928, CYAN = 0x5ef2ff, WHITE = 0xf5f7ff, NAVY = 0x14143c;

function mat(color, o = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: o.rough ?? 0.32, metalness: o.metal ?? 0.0,
    clearcoat: o.clear ?? 0.7, clearcoatRoughness: 0.18,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    transparent: o.opacity !== undefined, opacity: o.opacity ?? 1,
    sheen: o.sheen ?? 0, sheenColor: new THREE.Color(0xffffff),
  });
}
const glow = (c, i = 2.2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4 });
function M(geo, m, shadow = true) { const x = new THREE.Mesh(geo, m); x.castShadow = shadow; x.receiveShadow = shadow; return x; }
const rbox = (w, h, d, r = 0.12) => new RoundedBoxGeometry(w, h, d, 5, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

/* ─────────────────────────  Mascot robot  ───────────────────────── */
function makeBot() {
  const root = new THREE.Group();
  const rig = new THREE.Group(); root.add(rig);
  const white = mat(WHITE, { rough: 0.28, clear: 1, sheen: 0.3 });
  const blue = mat(BLUE, { rough: 0.25, clear: 1 });
  const black = mat(0x0b0b1e, { rough: 0.08, clear: 1 });
  const eyeM = glow(CYAN, 2.6), bulbM = glow(YELLOW, 2.4);

  // hover ring + jet glow
  const ring = M(new THREE.TorusGeometry(0.42, 0.07, 16, 48), glow(CYAN, 1.8), false);
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.42; rig.add(ring);
  const jet = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
  jet.rotation.x = Math.PI; jet.position.y = 0.18; rig.add(jet);

  // body
  const body = M(new THREE.CapsuleGeometry(0.62, 0.42, 10, 32), blue); body.position.y = 1.12; rig.add(body);
  const belly = M(new THREE.SphereGeometry(0.5, 32, 24), white); belly.scale.set(0.85, 0.85, 0.55); belly.position.set(0, 1.05, 0.32); rig.add(belly);
  const chest = M(rbox(0.46, 0.26, 0.08, 0.06), black); chest.position.set(0, 1.12, 0.6); rig.add(chest);
  const heart = M(new THREE.SphereGeometry(0.06, 16, 12), glow(YELLOW, 2.5), false); heart.position.set(0, 1.12, 0.65); rig.add(heart);

  // head
  const head = new THREE.Group(); head.position.y = 2.22; rig.add(head);
  head.add(M(rbox(1.56, 1.18, 1.18, 0.4), white));
  const visor = M(rbox(1.22, 0.76, 0.14, 0.22), black); visor.position.z = 0.55; head.add(visor);
  const eyes = [];
  for (const sx of [-1, 1]) {
    const e = M(new THREE.SphereGeometry(0.13, 24, 16), eyeM, false); e.scale.set(1, 1.35, 0.45); e.position.set(0.27 * sx, 0.06, 0.63); head.add(e); eyes.push(e);
    const cheek = M(new THREE.SphereGeometry(0.07, 16, 12), glow(0xff7aa8, 1.2), false); cheek.scale.set(1.3, 0.8, 0.4); cheek.position.set(0.45 * sx, -0.17, 0.62); head.add(cheek);
    const ear = M(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 32), blue); ear.rotation.z = Math.PI / 2; ear.position.x = 0.82 * sx; head.add(ear);
    const earGlow = M(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 24), glow(CYAN, 1.5), false); earGlow.rotation.z = Math.PI / 2; earGlow.position.x = 0.84 * sx; head.add(earGlow);
  }
  const smile = M(new THREE.TorusGeometry(0.13, 0.026, 10, 32, Math.PI), eyeM, false); smile.rotation.z = Math.PI; smile.position.set(0, -0.15, 0.63); head.add(smile);
  const stick = M(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 12), blue); stick.position.y = 0.74; head.add(stick);
  const bulb = M(new THREE.SphereGeometry(0.11, 24, 16), bulbM, false); bulb.position.y = 0.94; head.add(bulb);

  // arms (pivot at shoulder)
  const arms = {};
  for (const [k, sx] of [['R', -1], ['L', 1]]) {
    const piv = new THREE.Group(); piv.position.set(0.66 * sx, 1.42, 0); rig.add(piv);
    const a = M(new THREE.CapsuleGeometry(0.12, 0.36, 8, 16), white); a.position.y = -0.3; piv.add(a);
    const h = M(new THREE.SphereGeometry(0.17, 24, 16), blue); h.position.y = -0.62; piv.add(h);
    arms[k] = piv;
  }
  root.traverse(o => { if (o.isMesh && o.material === eyeM) o.castShadow = false; });

  const st = { pose: 'idle', blinkT: 2, x: 3, y: 0, s: 1, ry: 0, tx: 3, ty: 0, ts: 1, tilt: 0 };
  const cur = { Rz: -0.25, Rx: 0, Lz: 0.25, Lx: 0, hz: 0, hx: 0, hy: 0, jump: 0 };
  function poseTarget(t) {
    const P = { Rz: -0.22, Rx: 0, Lz: 0.22, Lx: 0, hz: 0, hx: 0, hy: 0, jump: 0 };
    switch (st.pose) {
      case 'wave': P.Lz = 2.55 + Math.sin(t * 7) * 0.35; P.hz = -0.08; break;
      case 'point': P.Rz = -1.5; P.Rx = -0.25; P.hy = -0.25; P.hz = 0.05; break;
      case 'think': P.Rz = -0.35; P.Rx = -2.25; P.hz = 0.16 + Math.sin(t * 1.3) * 0.04; P.hx = -0.06; P.Lz = 0.15; break;
      case 'cheer': P.Rz = -2.65 + Math.sin(t * 9) * 0.15; P.Lz = 2.65 - Math.sin(t * 9) * 0.15; P.jump = Math.abs(Math.sin(t * 4.5)) * 0.35; break;
      case 'type': P.Rx = -1.35 + Math.sin(t * 14) * 0.12; P.Lx = -1.35 - Math.sin(t * 14) * 0.12; P.Rz = -0.15; P.Lz = 0.15; P.hx = 0.18; break;
      case 'shield': P.Lx = -1.25; P.Lz = 0.35; P.Rz = -0.35; P.hy = 0.1; break;
      case 'present': P.Rz = -1.05; P.Rx = -0.5; P.Lz = 0.3; P.hy = -0.18; break;
      case 'peek': P.Lz = 1.2 + Math.sin(t * 6) * 0.25; P.hz = -0.12; P.hy = -0.35; break;
    }
    return P;
  }
  function update(t, dt) {
    const P = poseTarget(t);
    for (const k in cur) cur[k] = damp(cur[k], P[k], 7, dt);
    arms.R.rotation.set(cur.Rx, 0, cur.Rz); arms.L.rotation.set(cur.Lx, 0, cur.Lz);
    head.rotation.set(cur.hx + Math.sin(t * 0.9) * 0.03, cur.hy + Math.sin(t * 0.6) * 0.08, cur.hz);
    st.x = damp(st.x, st.tx, 3.2, dt); st.y = damp(st.y, st.ty, 3.2, dt); st.s = damp(st.s, st.ts, 3.2, dt);
    const moving = Math.abs(st.tx - st.x);
    root.position.set(st.x, st.y + Math.sin(t * 2.2) * 0.07 + cur.jump, 0);
    root.scale.setScalar(st.s);
    root.rotation.y = damp(root.rotation.y, (st.ry || 0) + Math.sign(st.tx - st.x) * Math.min(moving, 1) * 0.6, 5, dt);
    rig.rotation.z = Math.sin(t * 1.7) * 0.03 - (st.tx - st.x) * 0.06;
    // blink
    st.blinkT -= dt; let sy = 1.35;
    if (st.blinkT < 0.12) sy = 0.15; if (st.blinkT < 0) st.blinkT = 2.5 + Math.random() * 2.5;
    eyes.forEach(e => e.scale.y = damp(e.scale.y, sy, 30, dt));
    bulbM.emissiveIntensity = 1.8 + Math.sin(t * 4) * 0.9;
    ring.material.emissiveIntensity = 1.4 + Math.sin(t * 6) * 0.5;
    jet.scale.y = 1 + Math.sin(t * 20) * 0.12;
  }
  return { root, st, update };
}

/* ─────────────────────────  Props  ───────────────────────── */
const P = {};
P.panels = () => {
  const g = new THREE.Group();
  const pm = new THREE.MeshPhysicalMaterial({ color: 0xbfd0ff, emissive: 0x5b6bff, emissiveIntensity: 0.35, transparent: true, opacity: 0.42, roughness: 0.1, clearcoat: 1, depthWrite: false });
  const line = glow(0xffffff, 1.4), acc = glow(YELLOW, 1.6);
  const cfg = [[-1.6, 2.6, -0.6, 0.35], [1.7, 3.1, -1.0, -0.3], [-0.2, 4.1, -1.6, 0.1]];
  cfg.forEach(([x, y, z, ry], i) => {
    const p = new THREE.Group(); p.position.set(x, y, z); p.rotation.y = ry;
    p.add(M(rbox(1.7, 1.05, 0.04, 0.08), pm, false));
    for (let j = 0; j < 3; j++) { const l = M(rbox(1.1 - j * 0.25, 0.06, 0.02, 0.02), j === 0 ? acc : line, false); l.position.set(-0.2 + j * 0.12, 0.25 - j * 0.2, 0.04); p.add(l); }
    const dot = M(new THREE.SphereGeometry(0.1, 16, 12), acc, false); dot.position.set(0.6, -0.3, 0.05); p.add(dot);
    p.userData.phase = i * 1.7; g.add(p);
  });
  return { g, update: t => g.children.forEach(p => { p.position.y += Math.sin(t * 1.4 + p.userData.phase) * 0.0025; p.rotation.x = Math.sin(t + p.userData.phase) * 0.05; }) };
};
P.stairs = () => {
  const g = new THREE.Group(); const cols = [0x6a6aff, BLUE, YELLOW];
  [0.5, 1.0, 1.5].forEach((h, i) => { const b = M(rbox(1.25, h, 1.4, 0.12), mat(cols[i], { rough: 0.3 })); b.position.set(i * 1.3, h / 2, 0); g.add(b);
    const tag = M(rbox(0.5, 0.12, 0.06, 0.03), glow(i === 2 ? NAVY : WHITE, i === 2 ? 0.2 : 1.2), false); tag.position.set(i * 1.3, h - 0.25, 0.71); g.add(tag); });
  return { g };
};
P.docs = () => {
  const g = new THREE.Group(); const wm = mat(0xffffff, { rough: 0.6, clear: 0.2 }); const lm = glow(0x8f9bff, 0.6);
  for (let i = 0; i < 9; i++) { const d = M(rbox(1.0, 0.05, 1.3, 0.02), wm); d.position.set(Math.sin(i * 2.1) * 0.06, 0.03 + i * 0.06, Math.cos(i * 1.7) * 0.06); d.rotation.y = Math.sin(i * 3.3) * 0.12; g.add(d); }
  const flying = [];
  for (let i = 0; i < 3; i++) { const s = new THREE.Group(); s.add(M(rbox(0.8, 1.0, 0.02, 0.02), wm)); for (let j = 0; j < 4; j++) { const l = M(rbox(0.5, 0.05, 0.01, 0.01), lm, false); l.position.set(0, 0.3 - j * 0.18, 0.02); s.add(l); }
    s.position.set(-0.8 + i * 0.8, 1.6 + i * 0.5, 0.2); s.userData.p = i * 2; g.add(s); flying.push(s); }
  return { g, update: t => flying.forEach(s => { s.rotation.z = Math.sin(t * 1.2 + s.userData.p) * 0.25; s.rotation.y = Math.sin(t * 0.8 + s.userData.p) * 0.4; s.position.y += Math.sin(t * 1.5 + s.userData.p) * 0.003; }) };
};
P.clock = () => {
  const g = new THREE.Group(); const f = new THREE.Group(); g.add(f);
  const face = M(new THREE.CylinderGeometry(0.95, 0.95, 0.18, 64), mat(0xffffff, { rough: 0.4 })); face.rotation.x = Math.PI / 2; f.add(face);
  const rim = M(new THREE.TorusGeometry(0.97, 0.11, 20, 64), mat(YELLOW, { rough: 0.25 })); f.add(rim);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const tk = M(rbox(0.05, i % 3 ? 0.1 : 0.2, 0.04, 0.01), mat(NAVY), false); tk.position.set(Math.sin(a) * 0.78, Math.cos(a) * 0.78, 0.11); tk.rotation.z = -a; f.add(tk); }
  const hh = M(rbox(0.08, 0.45, 0.05, 0.02), mat(NAVY), false); hh.geometry.translate(0, 0.2, 0); hh.position.z = 0.13; hh.rotation.z = -Math.PI / 2; f.add(hh);
  const mh = M(rbox(0.06, 0.65, 0.05, 0.02), mat(BLUE), false); mh.geometry.translate(0, 0.3, 0); mh.position.z = 0.16; f.add(mh);
  const c = M(new THREE.SphereGeometry(0.08, 16, 12), glow(YELLOW, 1.5), false); c.position.z = 0.18; f.add(c);
  f.position.y = 1.2;
  return { g, update: t => { f.rotation.z = Math.sin(t * 2.4) * 0.06; f.position.y = 1.2 + Math.sin(t * 1.8) * 0.08; } };
};
P.chart = (o = {}) => {
  const g = new THREE.Group(); const hs = o.heights || [1.2, 2, 1.5, 2.8]; const cols = o.colors || [0x8b8bff, BLUE, 0x8b8bff, YELLOW];
  const base = M(rbox(hs.length * 0.9 + 0.4, 0.15, 1.1, 0.06), mat(0xffffff, { rough: 0.5 })); base.position.y = 0.075; g.add(base);
  const bars = hs.map((h, i) => { const b = M(rbox(0.62, 1, 0.62, 0.1), mat(cols[i % cols.length], { rough: 0.25 })); b.position.set((i - (hs.length - 1) / 2) * 0.9, 0.15, 0); b.userData.h = h; b.scale.y = 0.001; g.add(b); return b; });
  let t0 = null;
  return { g, enter: () => { t0 = null; bars.forEach(b => b.scale.y = 0.001); }, update: t => { if (t0 === null) t0 = t; bars.forEach((b, i) => { const k = Math.min(1, Math.max(0, (t - t0 - 0.3 - i * 0.15) / 1.1)); const h = b.userData.h * easeOutBack(k); b.scale.y = Math.max(0.001, h); b.position.y = 0.15 + h / 2; }); } };
};
P.bubbles = () => {
  const g = new THREE.Group(); const list = [];
  [[0, 0, 0xffffff, NAVY], [1.3, 1.1, BLUE, 0xffffff]].forEach(([x, y, c, dc], i) => {
    const b = new THREE.Group(); b.add(M(rbox(1.35, 0.8, 0.32, 0.3), mat(c, { rough: 0.3 })));
    const tail = M(new THREE.ConeGeometry(0.16, 0.35, 16), mat(c)); tail.position.set(i ? 0.4 : -0.4, -0.48, 0); tail.rotation.z = i ? -0.5 : 0.5; tail.rotation.x = Math.PI; b.add(tail);
    const dots = [-0.32, 0, 0.32].map(dx => { const d = M(new THREE.SphereGeometry(0.09, 16, 12), glow(i ? YELLOW : dc, i ? 1.5 : 0.1), false); d.position.set(dx, 0, 0.18); b.add(d); return d; });
    b.position.set(x, y, 0); b.userData = { dots, p: i * 1.3 }; g.add(b); list.push(b);
  });
  return { g, update: t => list.forEach(b => { b.position.y += Math.sin(t * 1.6 + b.userData.p) * 0.003; b.userData.dots.forEach((d, j) => d.position.y = Math.max(0, Math.sin(t * 6 - j * 0.8)) * 0.12); }) };
};
P.shield = () => {
  const g = new THREE.Group(); const s = new THREE.Shape();
  s.moveTo(0, 1.1); s.bezierCurveTo(0.45, 0.95, 0.75, 0.95, 0.9, 0.9); s.bezierCurveTo(0.9, 0.1, 0.6, -0.55, 0, -0.95); s.bezierCurveTo(-0.6, -0.55, -0.9, 0.1, -0.9, 0.9); s.bezierCurveTo(-0.75, 0.95, -0.45, 0.95, 0, 1.1);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 6, curveSegments: 32 });
  const sh = M(geo, mat(YELLOW, { rough: 0.22, metal: 0.1 })); g.add(sh);
  const inner = M(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 32 }), mat(BLUE)); inner.scale.setScalar(0.72); inner.position.set(0, 0.05, 0.3); g.add(inner);
  const c1 = M(rbox(0.16, 0.42, 0.1, 0.05), glow(0xffffff, 1.2), false); c1.position.set(-0.15, -0.02, 0.4); c1.rotation.z = 0.75; g.add(c1);
  const c2 = M(rbox(0.16, 0.75, 0.1, 0.05), glow(0xffffff, 1.2), false); c2.position.set(0.15, 0.12, 0.4); c2.rotation.z = -0.6; g.add(c2);
  g.position.y = 1.3;
  return { g, update: t => { g.rotation.y = Math.sin(t * 1.1) * 0.35; g.position.y = 1.3 + Math.sin(t * 1.7) * 0.08; } };
};
function gearShape(r, teeth) {
  const s = new THREE.Shape(); const n = teeth * 4;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; const rr = (i % 4 < 2) ? r : r * 0.8; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  const h = new THREE.Path(); h.absarc(0, 0, r * 0.3, 0, Math.PI * 2, true); s.holes.push(h); return s;
}
P.gears = () => {
  const g = new THREE.Group(); const opt = { depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3 };
  const a = M(new THREE.ExtrudeGeometry(gearShape(0.8, 10), opt), mat(YELLOW, { rough: 0.25, metal: 0.2 })); a.position.set(0, 2.2, -0.4);
  const b = M(new THREE.ExtrudeGeometry(gearShape(0.55, 7), opt), mat(0x8b8bff, { rough: 0.25, metal: 0.2 })); b.position.set(1.22, 1.35, -0.4);
  g.add(a, b);
  return { g, update: t => { a.rotation.z = t * 0.6; b.rotation.z = -t * 0.6 * 10 / 7 + 0.2; } };
};
P.people = (o = {}) => {
  const g = new THREE.Group(); const n = o.n || 3; const shirts = [0xff8a5c, 0x45c49c, 0x8b6bff, 0xff5c8a, 0x3fb6ff];
  const skins = [0xf2c9a0, 0xd9a37a, 0xe8b88f, 0xc68c64]; const hair = mat(0x2a1d16, { rough: 0.5 });
  const figs = [];
  for (let i = 0; i < n; i++) {
    const f = new THREE.Group();
    const body = M(new THREE.CapsuleGeometry(0.3, 0.45, 8, 20), mat(shirts[i % shirts.length], { rough: 0.45 })); body.position.y = 0.6; f.add(body);
    const head = M(new THREE.SphereGeometry(0.3, 32, 24), mat(skins[i % skins.length], { rough: 0.5, clear: 0.2 })); head.position.y = 1.32; f.add(head);
    const hr = M(new THREE.SphereGeometry(0.315, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hair); hr.position.y = 1.36; hr.rotation.x = -0.25; f.add(hr);
    for (const sx of [-1, 1]) { const e = M(new THREE.SphereGeometry(0.045, 12, 10), mat(0x111122, { rough: 0.1 }), false); e.position.set(0.1 * sx, 1.33, 0.27); f.add(e); }
    const sm = M(new THREE.TorusGeometry(0.06, 0.015, 8, 16, Math.PI), mat(0x7a2a2a), false); sm.rotation.z = Math.PI; sm.position.set(0, 1.22, 0.285); f.add(sm);
    f.position.set((i - (n - 1) / 2) * 0.85, 0, (i % 2) * -0.35); f.userData.p = i * 1.1; g.add(f); figs.push(f);
  }
  if (o.bulb) { const bb = P.bulb(); bb.g.scale.setScalar(0.55); bb.g.position.set(figs[0].position.x, 1.35, 0); g.add(bb.g); g.userData.bulb = bb; }
  return { g, update: t => { figs.forEach(f => { f.position.y = Math.abs(Math.sin(t * 2.5 + f.userData.p)) * 0.05; f.rotation.z = Math.sin(t * 1.5 + f.userData.p) * 0.05; }); g.userData.bulb && g.userData.bulb.update(t); } };
};
P.bulb = () => {
  const g = new THREE.Group(); const m = new THREE.MeshPhysicalMaterial({ color: 0xfff1b0, emissive: YELLOW, emissiveIntensity: 1.6, roughness: 0.15, clearcoat: 1, transmission: 0 });
  const b = M(new THREE.SphereGeometry(0.5, 32, 24), m, false); b.position.y = 1.5; g.add(b);
  const neck = M(new THREE.CylinderGeometry(0.22, 0.25, 0.35, 24), mat(0xb8bccc, { metal: 0.6, rough: 0.3 })); neck.position.y = 0.95; g.add(neck);
  for (let i = 0; i < 6; i++) { const ray = M(rbox(0.06, 0.3, 0.06, 0.02), glow(YELLOW, 2), false); const a = i / 6 * Math.PI * 2; ray.position.set(Math.cos(a) * 0.85, 1.5 + Math.sin(a) * 0.85, 0); ray.rotation.z = a - Math.PI / 2; g.add(ray); }
  return { g, update: t => { m.emissiveIntensity = 1.3 + Math.sin(t * 3) * 0.5; g.rotation.y = Math.sin(t) * 0.2; } };
};
P.envelope = () => {
  const g = new THREE.Group(); const e = new THREE.Group(); g.add(e);
  e.add(M(rbox(1.5, 0.95, 0.14, 0.06), mat(0xffffff, { rough: 0.5 })));
  const s = new THREE.Shape(); s.moveTo(-0.72, 0.45); s.lineTo(0.72, 0.45); s.lineTo(0, -0.12); s.lineTo(-0.72, 0.45);
  const flap = M(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }), mat(YELLOW)); flap.position.z = 0.08; e.add(flap);
  const seal = M(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 24), glow(BLUE, 0.4)); seal.rotation.x = Math.PI / 2; seal.position.set(0, -0.08, 0.13); e.add(seal);
  e.position.y = 1.4;
  return { g, update: t => { e.position.y = 1.4 + Math.sin(t * 2) * 0.12; e.rotation.z = Math.sin(t * 1.3) * 0.12; e.rotation.y = Math.sin(t * 0.9) * 0.3; } };
};
P.magnifier = () => {
  const g = new THREE.Group(); const m = new THREE.Group(); g.add(m);
  m.add(M(new THREE.TorusGeometry(0.5, 0.09, 20, 48), mat(BLUE, { rough: 0.2 })));
  const glass = M(new THREE.CircleGeometry(0.5, 48), new THREE.MeshPhysicalMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.35, roughness: 0.05, clearcoat: 1 }), false); m.add(glass);
  const h = M(new THREE.CapsuleGeometry(0.09, 0.6, 8, 16), mat(YELLOW)); h.position.set(0.55, -0.55, 0); h.rotation.z = Math.PI / 4; m.add(h);
  m.position.y = 1.6;
  return { g, update: t => { m.position.x = Math.sin(t * 1.2) * 0.25; m.rotation.z = Math.sin(t * 1.2) * 0.15; } };
};
P.confetti = () => {
  const n = 110; const geo = new THREE.BoxGeometry(0.09, 0.14, 0.02);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.5 }), n);
  const cols = [YELLOW, BLUE, 0xff5c8a, 0x45c49c, 0xffffff, 0x8b6bff].map(c => new THREE.Color(c));
  const d = []; const dummy = new THREE.Object3D();
  for (let i = 0; i < n; i++) { d.push({ x: (Math.random() - 0.5) * 12, y: Math.random() * 7, z: -1.5 - Math.random() * 3, s: 0.6 + Math.random(), r: Math.random() * 6 }); mesh.setColorAt(i, cols[i % cols.length]); }
  const g = new THREE.Group(); g.add(mesh);
  return { g, update: (t, dt) => { d.forEach((p, i) => { p.y -= dt * p.s * 0.9; if (p.y < -1) p.y = 7; dummy.position.set(p.x + Math.sin(t + p.r) * 0.3, p.y, p.z); dummy.rotation.set(t * p.s * 2 + p.r, t * p.s + p.r, 0); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); }); mesh.instanceMatrix.needsUpdate = true; } };
};
P.sparkles = () => {
  const n = 70; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 12; pos[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1; }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,230,150,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const m = new THREE.PointsMaterial({ size: 0.22, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, m); const g = new THREE.Group(); g.add(pts);
  return { g, update: t => { m.opacity = 0.6 + Math.sin(t * 2) * 0.3; pts.rotation.y = t * 0.03; } };
};

/* ─────────────────────────  World  ───────────────────────── */
export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 100);
  camera.position.set(0, 2.5, 11.5); const look = new THREE.Vector3(0, 1.65, 0); camera.lookAt(look);

  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x4a3b8a, 0.9));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4); key.position.set(4, 8, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -4, near: 1, far: 30 }); key.shadow.radius = 6; key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fd8ff, 1.6); rim.position.set(-6, 4, -5); scene.add(rim);
  const fill = new THREE.PointLight(0xffc928, 12, 14); fill.position.set(-3, 3, 4); scene.add(fill);

  const groundMat = new THREE.ShadowMaterial({ opacity: 0.22 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), groundMat); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const bot = makeBot(); scene.add(bot.root);
  const live = new Map(); // key -> {prop, cfg, state}
  let lastProps = [];

  function setScene(cfg) {
    const b = cfg.bot || {};
    if (b.hide) { bot.st.ts = 0.0001; } else { bot.st.tx = b.x ?? 3.2; bot.st.ty = b.y ?? 0; bot.st.ts = b.s ?? 1; }
    bot.st.pose = b.pose || 'idle'; bot.st.ry = b.ry || 0;
    groundMat.opacity = cfg.dark ? 0.32 : 0.2;
    const want = new Set();
    (cfg.props || []).forEach((pc, i) => {
      const k = pc.type + ':' + (pc.id || i) + ':' + JSON.stringify(pc.o || {});
      want.add(k);
      let L = live.get(k);
      if (!L) { const prop = P[pc.type](pc.o || {}); scene.add(prop.g); prop.g.traverse(o => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; }); L = { prop, k: 0, target: 1, cfg: pc }; live.set(k, L); prop.g.scale.setScalar(0.0001); }
      L.cfg = pc; L.target = 1; L.prop.enter && L.prop.enter();
      L.prop.g.position.set(pc.x ?? 0, pc.y ?? 0, pc.z ?? 0); L.prop.g.rotation.y = pc.ry ?? 0;
    });
    for (const [k, L] of live) if (!want.has(k)) L.target = 0;
  }
  function resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  const clock = new THREE.Clock();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    bot.update(t, dt);
    for (const [k, L] of live) {
      L.k = damp(L.k, L.target, L.target ? 3.2 : 6, dt);
      const s = (L.cfg.s ?? 1) * (L.target ? easeOutBack(Math.min(1, L.k * 1.02)) : L.k);
      L.prop.g.scale.setScalar(Math.max(0.0001, s));
      L.prop.update && L.prop.update(t, dt);
      if (!L.target && L.k < 0.01) { scene.remove(L.prop.g); live.delete(k); }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { setScene, resize };
}
export { P, makeBot };
