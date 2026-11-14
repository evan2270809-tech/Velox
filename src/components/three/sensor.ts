import * as THREE from "three";

/**
 * Line drawing, in 3D, of the fingertip sensor concept as a stack of layers.
 * Deliberately schematic: it shows that the sensor is a layered part that
 * reads pressing and sideways force, and nothing about its real layout,
 * counts, materials or dimensions.
 */

const COLS = 4;
const ROWS = 5;
const PITCH = 2.1;
const W = COLS * PITCH + 1.2;
const D = ROWS * PITCH + 1.2;
const PILLAR_H = 1.0;
const GAP = 3.0;

const PAPER = "#f5f5f3";
const INK = "#1b1b1b";
const AMBER = "#c58a16";
const COPPER = "#b9551c";
const BLUE = "#3f6ea8";

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
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2); // lie flat: thickness along +y
  return g;
}

export class SensorRig {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(28, 1, 1, 300);

  /** 0 = assembled, 1 = layers pulled apart. Set by the page as it scrolls. */
  explode = 0;
  /** Turn of the stack around its vertical axis, also driven by scrolling. */
  turn = -0.7;
  still = false;

  private readonly root = new THREE.Group();
  private readonly bottom = new THREE.Group();
  private readonly middle = new THREE.Group();
  private readonly top = new THREE.Group();
  private readonly shield = new THREE.Group();
  private readonly pillars: THREE.Group[] = [];
  private readonly disposables: { dispose(): void }[] = [];
  private readonly fill: THREE.MeshBasicMaterial;
  private readonly clock = new THREE.Clock();
  private gap = 0;
  private turnNow = -0.7;
  private time = 0;
  private frame = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.set(0, 0, 56);

    // Surfaces are filled with the page colour so lines behind them are hidden.
    this.fill = new THREE.MeshBasicMaterial({
      color: PAPER,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    this.disposables.push(this.fill);
    this.root.add(this.bottom, this.middle, this.top, this.shield);
    this.scene.add(this.root);
    this.build();
  }

  /** A part drawn as coloured edges over a paper-coloured surface. */
  private part(geo: THREE.BufferGeometry, color: string, parent: THREE.Object3D) {
    const edges = new THREE.EdgesGeometry(geo, 24);
    const line = new THREE.LineBasicMaterial({ color });
    this.disposables.push(geo, edges, line);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geo, this.fill), new THREE.LineSegments(edges, line));
    parent.add(group);
    return group;
  }

  private build() {
    /* Lower layer: film with strips */
    this.part(roundedSlab(W, D, 0.22, 0.9), AMBER, this.bottom);
    for (let c = 0; c < COLS; c++) {
      const strip = this.part(new THREE.BoxGeometry(PITCH * 0.62, 0.06, D - 1.4), COPPER, this.bottom);
      strip.position.set((c - (COLS - 1) / 2) * PITCH, 0.26, 0);
    }
    const tailA = this.part(new THREE.BoxGeometry(2.4, 0.2, 3.2), AMBER, this.bottom);
    tailA.position.set(0, 0.1, D / 2 + 1.4);

    /* Soft layer between them */
    const pillar = new THREE.BoxGeometry(PITCH * 0.56, PILLAR_H, PITCH * 0.56);
    pillar.translate(0, PILLAR_H / 2, 0);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = this.part(r + c === 0 ? pillar : pillar.clone(), BLUE, this.middle);
        p.matrixAutoUpdate = false;
        p.userData.x = (c - (COLS - 1) / 2) * PITCH;
        p.userData.z = (r - (ROWS - 1) / 2) * PITCH;
        this.pillars.push(p);
      }
    }

    /* Upper layer: film with pads */
    this.part(roundedSlab(W, D, 0.22, 0.9), AMBER, this.top);
    for (let r = 0; r < ROWS; r++) {
      const z = (r - (ROWS - 1) / 2) * PITCH;
      for (let c = 0; c < COLS; c++) {
        const pad = this.part(new THREE.BoxGeometry(PITCH * 0.66, 0.06, PITCH * 0.66), COPPER, this.top);
        pad.position.set((c - (COLS - 1) / 2) * PITCH, 0.26, z);
      }
    }
    const tailB = this.part(new THREE.BoxGeometry(3.2, 0.2, 2.4), AMBER, this.top);
    tailB.position.set(W / 2 + 1.4, 0.1, 0);

    /* Cover */
    this.part(roundedSlab(W + 0.6, D + 0.6, 0.16, 1.2), INK, this.shield);
  }

  resize(width: number, height: number) {
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    this.camera.aspect = aspect;
    // Keep the whole exploded stack in view on narrow canvases.
    this.camera.position.z = aspect < 1.1 ? 58 / aspect ** 0.7 : 56;
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

  render(dt: number) {
    const step = dt || 1;
    const k = dt === 0 ? 1e6 : 6;
    if (!this.still) this.time += dt;
    this.gap = damp(this.gap, this.explode * GAP, k, step);
    this.turnNow = damp(this.turnNow, this.turn, k, step);

    // The upper layers are pressed down and slid sideways at once: pressure and shear together.
    const press = this.still ? 0.15 : (0.5 + 0.5 * Math.sin(this.time * 2.1)) * 0.3;
    const slide = this.still ? 0.3 : Math.sin(this.time * 1.4) * 0.55;
    const g = this.gap;
    const pillarH = PILLAR_H - press;
    const y0 = -(0.3 + PILLAR_H + 0.3 + 0.16 + g * 3) / 2;
    this.bottom.position.set(0, y0, 0);
    this.middle.position.set(0, y0 + 0.3 + g, 0);
    this.top.position.set(slide, y0 + 0.3 + g + pillarH + g, 0);
    this.shield.position.set(slide, y0 + 0.3 + g + pillarH + g + 0.3 + g, 0);

    const shear = slide / PILLAR_H;
    for (const p of this.pillars) {
      p.matrix.set(
        1, shear, 0, p.userData.x as number,
        0, pillarH / PILLAR_H, 0, 0,
        0, 0, 1, p.userData.z as number,
        0, 0, 0, 1,
      );
      p.matrixWorldNeedsUpdate = true;
    }

    this.root.rotation.set(0.62, this.turnNow, 0);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
