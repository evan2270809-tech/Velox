import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Simplified illustration of the fingertip sensor concept as a stack of four
 * layers. It shows the working principle only: proportions, counts and
 * materials are schematic and carry no design data.
 */

export type SensorMode = "normal" | "tangential";
export const SENSOR_LAYERS = ["shield", "top", "pillars", "bottom"] as const;
export type SensorLayer = (typeof SENSOR_LAYERS)[number];

const COLS = 4;
const ROWS = 5;
const PITCH = 2.1;
const W = COLS * PITCH + 1.2;
const D = ROWS * PITCH + 1.2;
const PILLAR_H = 1.0;

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

function roundedSlab(w: number, d: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -d / 2);
  s.lineTo(w / 2 - r, -d / 2);
  s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
  s.lineTo(w / 2, d / 2 - r);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
  s.lineTo(-w / 2 + r, d / 2);
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
  s.lineTo(-w / 2, -d / 2 + r);
  s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 12 });
  g.rotateX(-Math.PI / 2); // lie flat: thickness along +y
  return g;
}

export class SensorRig {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(28, 1, 1, 300);

  mode: SensorMode = "normal";
  exploded = true;
  /** Layer to emphasise; the others fade back. */
  focus: SensorLayer | null = null;
  rotation = { x: 0.62, y: -0.7 };
  still = false;

  private readonly root = new THREE.Group();
  private readonly layers = {} as Record<SensorLayer, THREE.Group>;
  private readonly materials = {} as Record<SensorLayer, THREE.MeshStandardMaterial[]>;
  private readonly baseOpacity = new Map<THREE.MeshStandardMaterial, number>();
  private readonly pillars: THREE.InstancedMesh;
  private readonly disposables: { dispose(): void }[] = [];
  private readonly clock = new THREE.Clock();
  private gap = 2.9;
  private press = 0;
  private slide = 0;
  private rot = { x: 0.62, y: -0.7 };
  private time = 0;
  private frame = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.82;
    this.renderer.setClearColor(0x000000, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = env.texture;
    this.scene.environmentIntensity = 0.7;
    this.disposables.push(env.texture, pmrem);
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(10, 30, 16);
    this.scene.add(key);

    this.camera.position.set(0, 0, 38);

    const mat = (layer: SensorLayer, color: string, opacity = 1, metalness = 0, roughness = 0.5) => {
      const m = new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness,
        transparent: true,
        opacity,
        depthWrite: opacity === 1,
      });
      (this.materials[layer] ??= []).push(m);
      this.baseOpacity.set(m, opacity);
      this.disposables.push(m);
      return m;
    };
    const geo = <T extends THREE.BufferGeometry>(g: T) => {
      this.disposables.push(g);
      return g;
    };
    SENSOR_LAYERS.forEach((name) => {
      this.layers[name] = new THREE.Group();
      this.root.add(this.layers[name]);
    });

    const film = "#d9a53a";
    const copper = "#a8521f";

    /* Bottom electrodes: film with column strips */
    {
      const g = this.layers.bottom;
      g.add(new THREE.Mesh(geo(roundedSlab(W, D, 0.22, 0.9)), mat("bottom", film, 1, 0, 0.6)));
      const strip = geo(new THREE.BoxGeometry(PITCH * 0.62, 0.06, D - 1.4));
      const m = mat("bottom", copper, 1, 0.7, 0.35);
      for (let c = 0; c < COLS; c++) {
        const s = new THREE.Mesh(strip, m);
        s.position.set((c - (COLS - 1) / 2) * PITCH, 0.25, 0);
        g.add(s);
      }
      const tail = new THREE.Mesh(geo(new THREE.BoxGeometry(2.4, 0.2, 3.2)), mat("bottom", film, 1, 0, 0.6));
      tail.position.set(0, 0.1, D / 2 + 1.4);
      g.add(tail);
    }

    /* Soft pillar layer */
    {
      const g = this.layers.pillars;
      const m = mat("pillars", "#5f85b3", 0.88, 0, 0.35);
      const box = geo(new THREE.BoxGeometry(PITCH * 0.56, PILLAR_H, PITCH * 0.56));
      box.translate(0, PILLAR_H / 2, 0);
      this.pillars = new THREE.InstancedMesh(box, m, COLS * ROWS);
      g.add(this.pillars);
    }

    /* Top electrodes: film with a pad per cell and row traces */
    {
      const g = this.layers.top;
      g.add(new THREE.Mesh(geo(roundedSlab(W, D, 0.22, 0.9)), mat("top", film, 0.92, 0, 0.6)));
      const pad = geo(new THREE.BoxGeometry(PITCH * 0.66, 0.06, PITCH * 0.66));
      const trace = geo(new THREE.BoxGeometry(W - 1.4, 0.05, 0.2));
      const m = mat("top", copper, 1, 0.7, 0.35);
      for (let r = 0; r < ROWS; r++) {
        const z = (r - (ROWS - 1) / 2) * PITCH;
        const t = new THREE.Mesh(trace, m);
        t.position.set(0, 0.25, z);
        g.add(t);
        for (let c = 0; c < COLS; c++) {
          const p = new THREE.Mesh(pad, m);
          p.position.set((c - (COLS - 1) / 2) * PITCH, 0.26, z);
          g.add(p);
        }
      }
      const tail = new THREE.Mesh(geo(new THREE.BoxGeometry(3.2, 0.2, 2.4)), mat("top", film, 0.92, 0, 0.6));
      tail.position.set(W / 2 + 1.4, 0.1, 0);
      g.add(tail);
    }

    /* Shield */
    this.layers.shield.add(
      new THREE.Mesh(geo(roundedSlab(W + 0.6, D + 0.6, 0.16, 1.2)), mat("shield", "#1d1f23", 0.78, 0.2, 0.45)),
    );

    this.scene.add(this.root);
  }

  resize(width: number, height: number) {
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // Keep the whole stack in view on narrow canvases.
    this.camera.position.z = width / height < 1.1 ? 44 / (width / height) ** 0.7 : 38;
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render(0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.getDelta();
    const loop = () => {
      if (!this.running) return;
      this.render(Math.min(this.clock.getDelta(), 0.05));
      this.frame = requestAnimationFrame(loop);
    };
    this.frame = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private readonly _m = new THREE.Matrix4();

  render(dt: number) {
    const step = dt || 1;
    const k = dt === 0 ? 1e6 : 6;
    if (!this.still) this.time += dt;
    this.gap = damp(this.gap, this.exploded ? 2.9 : 0, k, step);
    this.rot.x = damp(this.rot.x, this.rotation.x, 8, step);
    this.rot.y = damp(this.rot.y, this.rotation.y, 8, step);

    const beat = this.still ? 0.6 : 0.5 + 0.5 * Math.sin(this.time * 2.2);
    const sway = this.still ? 0.7 : Math.sin(this.time * 1.8);
    this.press = damp(this.press, this.mode === "normal" ? beat * 0.36 : 0.05, k, step);
    this.slide = damp(this.slide, this.mode === "tangential" ? sway * 0.62 : 0, k, step);

    // Stack from the bottom up. Pressing shortens the pillars; sliding leans them.
    const g = this.gap;
    const pillarH = PILLAR_H - this.press;
    const y0 = -(0.3 + PILLAR_H + 0.3 + 0.16 + g * 3) / 2;
    this.layers.bottom.position.set(0, y0, 0);
    this.layers.pillars.position.set(0, y0 + 0.3 + g, 0);
    this.layers.top.position.set(this.slide, y0 + 0.3 + g + pillarH + g, 0);
    this.layers.shield.position.set(this.slide, y0 + 0.3 + g + pillarH + g + 0.3 + g, 0);

    const shear = this.slide / PILLAR_H;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this._m.set(
          1, shear, 0, (c - (COLS - 1) / 2) * PITCH,
          0, pillarH / PILLAR_H, 0, 0,
          0, 0, 1, (r - (ROWS - 1) / 2) * PITCH,
          0, 0, 0, 1,
        );
        this.pillars.setMatrixAt(r * COLS + c, this._m);
      }
    }
    this.pillars.instanceMatrix.needsUpdate = true;

    for (const name of SENSOR_LAYERS) {
      const dim = this.focus !== null && this.focus !== name;
      for (const m of this.materials[name]) {
        const base = this.baseOpacity.get(m) ?? 1;
        m.opacity = damp(m.opacity, dim ? base * 0.14 : base, 10, step);
        m.depthWrite = m.opacity > 0.95;
      }
    }

    this.root.rotation.set(this.rot.x, this.rot.y, 0);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
