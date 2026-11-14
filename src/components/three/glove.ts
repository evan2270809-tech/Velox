import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

/**
 * Procedural concept models: the Velox tactile glove and a generic robot hand.
 * They illustrate the design direction; they are not CAD exports. Proportions
 * are those of a generic hand and the pad layout carries no real counts.
 *
 * Hand coordinates: palm faces +z, fingers point +y, thumb on +x. Units ≈ cm.
 */

export type GloveState = {
  /** Offset as a fraction of the visible width / height. */
  x: number;
  y: number;
  /** Extra offset in model units (shrinks with the model on narrow screens). */
  ox: number;
  oy: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  /** 0 = flat hand, 1 = closed grip. */
  curl: number;
  /** 0 … 1: index finger reaches out while the others relax. */
  point: number;
  /** Strength of the travelling contact wave across all pads. */
  sweep: number;
  /** Strength of the fingertip grip pulses. */
  grip: number;
  /** 0 = assembled, 1 = layers pulled apart. */
  explode: number;
};

export const defaultGloveState: GloveState = {
  x: 0,
  y: 0,
  ox: 0,
  oy: 0,
  rotX: 0.05,
  rotY: -0.45,
  rotZ: 0,
  scale: 1,
  curl: 0.22,
  point: 0,
  sweep: 0.5,
  grip: 0,
  explode: 0,
};

type FingerSpec = {
  x: number;
  y: number;
  splay: number;
  len: [number, number, number];
  r: [number, number, number];
  bias: number;
};

const FINGERS: FingerSpec[] = [
  { x: 2.72, y: 4.3, splay: -0.1, len: [4.0, 2.5, 2.1], r: [0.86, 0.78, 0.72], bias: 0 },
  { x: 0.92, y: 4.6, splay: -0.02, len: [4.4, 2.8, 2.2], r: [0.88, 0.8, 0.74], bias: 0.04 },
  { x: -0.88, y: 4.4, splay: 0.06, len: [4.1, 2.6, 2.2], r: [0.84, 0.76, 0.7], bias: 0.1 },
  { x: -2.56, y: 3.8, splay: 0.16, len: [3.2, 1.9, 1.9], r: [0.74, 0.68, 0.63], bias: 0.16 },
];
const THUMB = { len: [2.7, 2.9, 2.4], r: [1.2, 0.96, 0.85] };

const FLAT = 0.86;
const PITCH = 0.47;
const EXPLODE = 3.4;
/** Pads sit under the fabric: at rest they take the fabric's colour and only show when pressed. */
const FABRIC = new THREE.Color("#2a2c31");
const BARE = new THREE.Color("#8f959d");
const BASE = new THREE.Color();
const WARM = new THREE.Color("#ff9500");
const HOT = new THREE.Color("#ffe2ad");

/**
 * "glove" and "robot" are fully procedural and can be posed.
 * "scan" is a scanned human hand in a fixed, relaxed pose, dressed in the glove.
 * "model" is a modelled robot hand (GLB) in a fixed open pose, recoloured to match the site.
 */
type Style = "glove" | "robot" | "scan" | "model";

/** Points on a hand's surface, in the local space of `obj`; the data particles cling to them. */
type Surface = { obj: THREE.Object3D; pos: Float32Array; nrm: Float32Array; count: number };

type Pad = {
  mesh: THREE.InstancedMesh;
  pos: THREE.Vector3[];
  nrm: THREE.Vector3[];
  channel: number;
  phase: number;
  tip: boolean;
};

type Joint = { group: THREE.Group; weight: number; bias: number; finger: number };

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

/** A fine knit weave, used as a bump map so fabric reads as fabric up close. */
function fabricTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const warp = Math.sin((x / 4) * Math.PI) * 0.5 + 0.5;
      const weft = Math.sin((y / 4) * Math.PI + (Math.floor(x / 4) % 2) * Math.PI) * 0.5 + 0.5;
      const v = 118 + 70 * warp * weft + (Math.random() - 0.5) * 46;
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 7);
  return tex;
}

/** A box with rounded corners in plan and softened edges; w × h in the xy plane, d along z, centred. */
function roundedBox(w: number, h: number, d: number, r: number, bevel: number) {
  const iw = w - bevel * 2;
  const ih = h - bevel * 2;
  const rr = Math.max(Math.min(r - bevel, iw / 2, ih / 2), 0.01);
  const s = new THREE.Shape();
  s.moveTo(-iw / 2 + rr, -ih / 2);
  s.lineTo(iw / 2 - rr, -ih / 2);
  s.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + rr);
  s.lineTo(iw / 2, ih / 2 - rr);
  s.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - rr, ih / 2);
  s.lineTo(-iw / 2 + rr, ih / 2);
  s.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - rr);
  s.lineTo(-iw / 2, -ih / 2 + rr);
  s.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + rr, -ih / 2);
  const depth = Math.max(d - bevel * 2, 0.01);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 10,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

class Resources {
  private readonly items: { dispose(): void }[] = [];
  track<T extends { dispose(): void }>(item: T) {
    this.items.push(item);
    return item;
  }
  dispose() {
    this.items.forEach((i) => i.dispose());
  }
}

/** One hand: the fabric glove with its sensor layers, or a plain robot hand. */
class Hand {
  readonly root = new THREE.Group();
  readonly body = new THREE.Group();
  readonly joints: Joint[] = [];
  readonly pads: Pad[] = [];
  readonly indexTip = new THREE.Object3D();
  readonly palmAnchor = new THREE.Object3D();
  readonly state: GloveState = { ...defaultGloveState };
  target: GloveState = { ...defaultGloveState };
  surface: Surface | null = null;

  /** Scanned hand only: bends the fingers and spreads the sensor layers. */
  private poser: ((curl: number, explode: number) => void) | null = null;
  private posed = { curl: -1, explode: -1 };

  /** Parts that leave the shell in the exploded view. */
  private readonly front: THREE.Object3D[] = [];
  private readonly back: { obj: THREE.Object3D; z: number; hidden: boolean }[] = [];

  constructor(
    private readonly res: Resources,
    readonly style: Style,
    readonly mirrored: boolean,
  ) {
    this.root.add(this.body);
    this.body.position.y = -4.4;
    if (style === "glove") this.buildGlove();
    else if (style === "scan") this.buildScan();
    else if (style === "model") this.buildRobotModel();
    else this.buildRobot();
  }

  private std(color: string, roughness: number, metalness = 0) {
    return this.res.track(new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  }

  private palmGeometry(depth: number, bevel: number) {
    const w = 8.6;
    const h = 9.4;
    const r = 2.3;
    const bw = 3.5;
    const shape = new THREE.Shape();
    shape.moveTo(-bw + 1.4, -h / 2);
    shape.lineTo(bw - 1.4, -h / 2);
    shape.quadraticCurveTo(bw, -h / 2, bw + 0.25, -h / 2 + 1.6);
    shape.lineTo(w / 2, h / 2 - 1.5);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - 1.5, h / 2);
    shape.lineTo(-w / 2 + r, h / 2 - 0.55);
    shape.quadraticCurveTo(-w / 2, h / 2 - 0.7, -w / 2, h / 2 - r - 0.4);
    shape.lineTo(-bw - 0.25, -h / 2 + 1.6);
    shape.quadraticCurveTo(-bw, -h / 2, -bw + 1.4, -h / 2);
    const geo = this.res.track(
      new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: Math.min(bevel, 0.75),
        bevelSegments: 10,
        curveSegments: 20,
      }),
    );
    geo.translate(0, 0, -depth / 2);
    return geo;
  }

  private thumbBase() {
    const base = new THREE.Group();
    base.position.set(2.75, -2.75, 0.7);
    const along = new THREE.Vector3(0.78, 0.56, 0.28).normalize();
    const face = new THREE.Vector3(-0.45, 0.25, 0.86);
    const side = new THREE.Vector3().crossVectors(along, face).normalize();
    face.crossVectors(side, along).normalize();
    base.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, along, face));
    this.body.add(base);
    return base;
  }

  /* ---------------------------------------------------------------------- */
  /* Glove                                                                   */
  /* ---------------------------------------------------------------------- */

  private buildGlove() {
    const g = <T extends THREE.BufferGeometry>(geo: T) => this.res.track(geo);
    const weave = this.res.track(fabricTexture());
    // Knit fabric over a hand: matte, a fine weave you can see up close, soft sheen at grazing angles.
    const shell = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#2a2c31",
        roughness: 1,
        metalness: 0,
        sheen: 1,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color("#8a909b"),
        bumpMap: weave,
        bumpScale: 1.6,
      }),
    );
    // Latex grip caps on the fingertips: smooth and slightly glossy.
    const latex = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#191a1d",
        roughness: 0.42,
        metalness: 0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.45,
      }),
    );
    const seam = this.std("#3b3e44", 0.9);
    const accent = this.std("#ff9500", 0.6);
    const body = this.std("#dfe1e4", 0.55, 0.05); // module housing
    const dark = this.std("#1b1c1f", 0.5, 0.2);
    const flex = this.std("#c9953c", 0.45, 0.35);
    const metal = this.std("#aeb4bb", 0.3, 0.85);
    // Pads share the fabric's finish, so at rest they disappear into the glove.
    const taxel = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        roughness: 1,
        sheen: 1,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color("#8a909b"),
        bumpMap: weave,
        bumpScale: 1.6,
      }),
    );
    const skin = this.std("#cfc7be", 0.8);
    const palmFront = 1.42;

    /* Palm: a full, rounded hand inside the glove */
    const palm = new THREE.Mesh(this.palmGeometry(1.2, 0.82), shell);
    this.body.add(palm);
    this.palmAnchor.position.set(0, 0.5, palmFront);
    this.body.add(this.palmAnchor);
    {
      const ball = g(new THREE.SphereGeometry(1, 48, 32));
      const add = (x: number, y: number, z: number, sx: number, sy: number, sz: number, rz = 0) => {
        const m = new THREE.Mesh(ball, shell);
        m.position.set(x, y, z);
        m.rotation.z = rz;
        m.scale.set(sx, sy, sz);
        this.body.add(m);
      };
      add(2.25, -2.3, 0.55, 1.8, 2.8, 1.3, -0.45); // base of the thumb
      add(-2.8, -1.5, 0.2, 1.3, 3.0, 1.2, 0.08); // pinky edge
      add(0, 0.2, -0.75, 3.75, 4.3, 0.95); // back of the hand
      add(0.1, 3.75, -0.15, 4.05, 1.2, 1.25); // knuckle line
      FINGERS.forEach((f) => add(f.x, f.y - 0.25, -0.62, 0.92, 0.95, 0.8)); // knuckles
      add(0, -4.9, 0, 2.95, 1.6, 1.75); // heel of the hand into the wrist
    }

    /* Palm pad: a grid with the crease left open, under the fabric */
    {
      const pos: THREE.Vector3[] = [];
      const nrm: THREE.Vector3[] = [];
      const pitch = 0.6;
      for (let ix = -7; ix <= 7; ix++) {
        for (let iy = -7; iy <= 7; iy++) {
          const x = ix * pitch - 0.2;
          const y = iy * pitch + 0.1;
          const half = 3.0 + ((y + 4.7) / 9.4) * 0.7;
          if (Math.abs(x) > half || Math.abs(y) > 3.8) continue;
          if (Math.abs(x) > half - 0.7 && Math.abs(y) > 3.1) continue;
          if (Math.abs(y + x * 0.75 + 0.9) < 0.42) continue;
          if (((x - 2.3) / 2.4) ** 2 + ((y + 2.4) / 3.1) ** 2 < 1) continue;
          pos.push(new THREE.Vector3(x, y, palmFront + 0.02));
          nrm.push(new THREE.Vector3(0, 0, 1));
        }
      }
      this.addPad(this.body, pos, nrm, 0.44, taxel, -1, 0, false);
    }

    /* Top module on the back of the hand: base plate, housing, port and status light */
    {
      const z = -1.86;
      const top = new THREE.Group();
      top.position.set(0.1, -0.3, z);
      top.rotation.z = 0.06;
      this.body.add(top);
      this.back.push({ obj: top, z, hidden: false });
      const plate = new THREE.Mesh(g(roundedBox(4.3, 3.7, 0.3, 0.9, 0.1)), dark);
      plate.position.z = 0.02;
      const housing = new THREE.Mesh(g(roundedBox(3.3, 2.5, 0.85, 0.55, 0.22)), body);
      housing.position.z = -0.42;
      const ridge = new THREE.Mesh(g(roundedBox(1.35, 2.9, 0.5, 0.3, 0.14)), body);
      ridge.position.set(-0.35, 0, -0.78);
      const inset = new THREE.Mesh(g(roundedBox(0.7, 2.0, 0.08, 0.18, 0.02)), dark);
      inset.position.set(-0.35, 0, -1.06);
      const port = new THREE.Mesh(g(roundedBox(0.2, 0.62, 0.26, 0.08, 0.02)), dark);
      port.position.set(1.66, -0.3, -0.42);
      const led = new THREE.Mesh(
        g(new THREE.SphereGeometry(0.09, 12, 8)),
        this.res.track(new THREE.MeshBasicMaterial({ color: "#ff9500" })),
      );
      led.position.set(1.15, 0.85, -0.86);
      top.add(plate, housing, ridge, inset, port, led);
    }

    const mats = { shell, latex, seam, accent, flex, metal, taxel };
    FINGERS.forEach((f, fi) => {
      const base = new THREE.Group();
      base.position.set(f.x, f.y, 0);
      base.rotation.z = f.splay;
      this.body.add(base);
      this.gloveChain(base, f.len, f.r, fi + 1, f.bias, [0.85, 1.05, 0.7], mats);
    });
    this.gloveChain(this.thumbBase(), THUMB.len, THUMB.r, 0, 0, [0.12, 0.55, 0.6], mats);

    /* Wrist: fabric sleeve, strap with a pull tab, ribbed elastic cuff, then the bare forearm */
    {
      const sleeve = new THREE.Mesh(g(new THREE.CylinderGeometry(2.95, 2.8, 4.6, 56, 1, true)), shell);
      sleeve.scale.z = 0.66;
      sleeve.position.y = -6.4;

      const strap = new THREE.Mesh(g(new THREE.CylinderGeometry(2.98, 2.92, 1.15, 56, 1, true)), latex);
      strap.scale.z = 0.675;
      strap.position.y = -6.1;
      const tab = new THREE.Mesh(g(roundedBox(1.7, 1.0, 0.16, 0.22, 0.05)), latex);
      tab.position.set(1.2, -6.1, -2.02);
      tab.rotation.y = -0.38;

      // Ribbed elastic: a lathe profile with small ridges
      const pts: THREE.Vector2[] = [];
      for (let i = 40; i >= 0; i--) {
        // bottom to top, so the surface faces outwards
        const t = i / 40;
        pts.push(new THREE.Vector2(2.86 + 0.1 * t + 0.035 * Math.sin(t * Math.PI * 13), -t * 2.5));
      }
      const cuff = new THREE.Mesh(g(new THREE.LatheGeometry(pts, 64)), shell);
      cuff.scale.z = 0.66;
      cuff.position.y = -8.2;
      const hem = new THREE.Mesh(g(new THREE.TorusGeometry(2.97, 0.1, 10, 64)), seam);
      hem.rotation.x = Math.PI / 2;
      hem.scale.y = 0.66;
      hem.position.y = -10.7;

      // Woven label at the side of the cuff
      const tag = new THREE.Mesh(g(new THREE.BoxGeometry(0.08, 1.25, 0.62)), accent);
      tag.position.set(-2.98, -9.3, 0.15);

      const arm = new THREE.Mesh(g(new THREE.CylinderGeometry(2.55, 3.35, 34, 56, 1, true)), skin);
      arm.scale.z = 0.7;
      arm.position.y = -25.2; // starts inside the cuff
      this.body.add(sleeve, strap, tab, cuff, hem, tag, arm);
    }
  }

  private gloveChain(
    base: THREE.Group,
    len: number[],
    rad: number[],
    channel: number,
    bias: number,
    weights: number[],
    m: Record<"shell" | "latex" | "seam" | "accent" | "flex" | "metal" | "taxel", THREE.Material>,
  ) {
    const g = <T extends THREE.BufferGeometry>(geo: T) => this.res.track(geo);
    let parent = base;
    const last = len.length - 1;

    len.forEach((l, i) => {
      const r0 = rad[i]!;
      const r1 = i < last ? rad[i + 1]! : r0 * 0.9; // fingers taper towards the tip
      const joint = new THREE.Group();
      if (i > 0) joint.position.y = len[i - 1]!;
      parent.add(joint);
      this.joints.push({ group: joint, weight: weights[i]!, bias, finger: channel });

      // Phalanx: a tapered tube with a slightly fuller knuckle at its base
      const seg = new THREE.Mesh(g(new THREE.CylinderGeometry(r1, r0, l, 32, 1, true)), m.shell);
      seg.position.y = l / 2;
      seg.scale.z = FLAT;
      const knuckle = new THREE.Mesh(g(new THREE.SphereGeometry(r0 * 1.035, 28, 20)), m.shell);
      knuckle.scale.set(1, 0.9, FLAT * 1.04);
      joint.add(seg, knuckle);

      // Side seams
      for (const side of [-1, 1]) {
        const piping = new THREE.Mesh(g(new THREE.CylinderGeometry(0.035, 0.035, l * 0.86, 6)), m.seam);
        piping.position.set(side * ((r0 + r1) / 2 + 0.005), l / 2, 0);
        piping.rotation.z = side * Math.atan2(r0 - r1, l);
        joint.add(piping);
      }

      const tip = i === last;
      if (tip) {
        // Latex cap over the fingertip, edged with one orange stitch line
        const capStart = l * 0.38;
        const rs = r0 + (r1 - r0) * 0.38;
        const cap = new THREE.Mesh(
          g(new THREE.CylinderGeometry(r1 + 0.035, rs + 0.035, l - capStart, 32, 1, true)),
          m.latex,
        );
        cap.position.y = (capStart + l) / 2;
        cap.scale.z = FLAT;
        const end = new THREE.Mesh(g(new THREE.SphereGeometry(r1 + 0.035, 28, 20)), m.latex);
        end.position.y = l;
        end.scale.set(1, 1.12, FLAT);
        const stitch = new THREE.Mesh(g(new THREE.TorusGeometry(rs + 0.04, 0.03, 8, 40)), m.accent);
        stitch.rotation.x = Math.PI / 2;
        stitch.scale.y = FLAT;
        stitch.position.y = capStart;
        joint.add(cap, end, stitch);
      }

      const inner = !(channel === 0 && i === 0);
      // Inside the glove: flex tail and motion sensor along the back
      const backZ = -(r0 * FLAT + 0.06);
      if (inner) {
        const tail = new THREE.Mesh(g(new THREE.BoxGeometry(0.3, l * 0.96, 0.05)), m.flex);
        tail.position.set(0, l / 2, backZ);
        joint.add(tail);
        this.back.push({ obj: tail, z: backZ, hidden: true });
        if (i < last) {
          const imu = new THREE.Mesh(g(new THREE.BoxGeometry(0.62, 0.8, 0.2)), m.metal);
          imu.position.set(0, l * 0.5, backZ - 0.1);
          joint.add(imu);
          this.back.push({ obj: imu, z: backZ - 0.1, hidden: true });
        }
      }

      // Tactile pad on the palm side, following the taper
      const cols = r0 > 0.8 ? 4 : 3;
      const y0 = tip ? 0.42 : 0.55;
      const y1 = tip ? l + r1 * 0.62 : l - 0.4;
      const rows = Math.max(2, Math.floor((y1 - y0) / PITCH) + 1);
      const lift = tip ? 0.06 : 0.02;
      const pos: THREE.Vector3[] = [];
      const nrm: THREE.Vector3[] = [];
      for (let row = 0; row < rows; row++) {
        const y = y0 + row * PITCH;
        const r = r0 + (r1 - r0) * Math.min(y / l, 1);
        const over = Math.max(y - l, 0);
        const rr = Math.sqrt(Math.max(r * r - over * over, 0.01));
        const n = over > r * 0.35 ? cols - 1 : cols;
        for (let c = 0; c < n; c++) {
          const a = ((c - (n - 1) / 2) * PITCH) / r;
          const nx = Math.sin(a);
          const nz = Math.cos(a);
          pos.push(new THREE.Vector3(nx * (rr + lift), y, nz * (rr + lift) * FLAT));
          nrm.push(new THREE.Vector3(nx, over / r, nz).normalize());
        }
      }
      if (inner) this.addPad(joint, pos, nrm, 0.34, m.taxel, tip ? channel : -1, channel * 1.37, tip);

      if (tip && channel === 1) {
        this.indexTip.position.set(0, l + r1 * 0.85, r1 * 0.25);
        joint.add(this.indexTip);
      }
      parent = joint;
    });
  }

  private addPad(
    parent: THREE.Object3D,
    pos: THREE.Vector3[],
    nrm: THREE.Vector3[],
    size: number,
    material: THREE.Material,
    channel: number,
    phase: number,
    tip: boolean,
  ) {
    const geo = this.res.track(new THREE.BoxGeometry(size, size, 0.06));
    const mesh = new THREE.InstancedMesh(geo, material, pos.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const zAxis = new THREE.Vector3(0, 0, 1);
    const one = new THREE.Vector3(1, 1, 1);
    pos.forEach((p, i) => {
      q.setFromUnitVectors(zAxis, nrm[i]!);
      m.compose(p, q, one);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, FABRIC);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    parent.add(mesh);
    this.front.push(mesh);
    this.pads.push({ mesh, pos, nrm, channel, phase, tip });
  }

  /* ---------------------------------------------------------------------- */
  /* Scanned hand wearing the glove                                          */
  /* ---------------------------------------------------------------------- */

  /**
   * Scan space: palm faces +z, fingers up +y, thumb on +x, in cm. The wrist is
   * near y = 9, the knuckles near y = 17.5 and the middle fingertip at y = 24.7.
   */
  private buildScan() {
    const g = <T extends THREE.BufferGeometry>(geo: T) => this.res.track(geo);
    const k = 1.12;
    const scan = new THREE.Group();
    scan.scale.setScalar(k);
    scan.position.set(-0.5 * k, -13.2 * k, -1.4 * k);
    this.body.add(scan);
    this.palmAnchor.position.set(0.3, 13.2, 3.6);
    this.indexTip.position.set(3.2, 23.8, 4.6);
    scan.add(this.palmAnchor, this.indexTip);

    const LEATHER = new THREE.Color("#dcdee1"); // a very light grey all over
    /** The last stretch of each finger and the thumb, in scan space. */
    const isTip = (x: number, y: number) =>
      (x > 5.4 && y > 15.9) || // thumb
      (x < -3.0 && y > 19.3) || // little finger
      (x >= -3.0 && x < 4.2 && y > 22.0 - Math.max(0, -x - 0.5) * 0.9); // ring, middle, index
    const CUFF_Y = 7.7; // the white glove runs past the wrist
    const LIFT = 0.14; // the glove sits this far above the skin

    // Dark fingertips: everything past a clean line across each finger, drawn per pixel so
    // the edge is exact. Measured in the hand's rest pose, so it stays put when the fingers bend.
    const tipCaps = {
      start: Array.from({ length: 5 }, () => new THREE.Vector3(0, 999, 0)),
      axis: Array.from({ length: 5 }, () => new THREE.Vector3(0, 1, 0)),
    };
    // The glove comes off as two shells: x = how far each half moves along the palm normal,
    // y = how far both slide towards the fingertips.
    const split = { value: new THREE.Vector2(0, 0) };

    /**
     * Turns a material into one half of a part that is cut in two along the hand's outline.
     * The same geometry is drawn once per half; each copy keeps only the pixels on its own
     * side (`aHalf` > 0 is the palm side), so the cut is a clean line whatever the triangles
     * underneath look like, and each copy moves away with its half.
     */
    const halve = <T extends THREE.Material>(mat: T, half: 1 | -1, glove: boolean) => {
      mat.side = THREE.DoubleSide; // the shells are open, so their insides show
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uSplit = split;
        shader.uniforms.uHalfSide = { value: half };
        shader.uniforms.uTipStart = { value: tipCaps.start };
        shader.uniforms.uTipAxis = { value: tipCaps.axis };
        shader.uniforms.uCuff = { value: CUFF_Y };
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            "#include <common>\nattribute vec3 aRest;\nattribute float aHalf;\nuniform vec2 uSplit;\nuniform float uHalfSide;\nvarying vec3 vRest;\nvarying float vHalf;",
          )
          .replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\nvRest = aRest;\nvHalf = aHalf;\ntransformed.z += uHalfSide * uSplit.x;\ntransformed.y += uSplit.y;",
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            "#include <common>\nvarying vec3 vRest;\nvarying float vHalf;\nuniform float uHalfSide;\nuniform float uCuff;\nuniform vec3 uTipStart[5];\nuniform vec3 uTipAxis[5];",
          )
          .replace(
            "#include <color_fragment>",
            glove
              ? `#include <color_fragment>
            if (vHalf * uHalfSide < -0.012) discard; // the other half's pixels
            if (vRest.y < uCuff) discard; // a straight lower edge
            for (int i = 0; i < 5; i++) {
              vec3 d = vRest - uTipStart[i];
              float along = dot(d, uTipAxis[i]);
              float away = length(d - uTipAxis[i] * along);
              float cap = smoothstep(0.0, 0.035, along) * (1.0 - step(1.3, away));
              diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.2, 0.205, 0.22), cap);
            }`
              : `#include <color_fragment>
            if (vHalf * uHalfSide < -0.012) discard;`,
          );
      };
      mat.customProgramCacheKey = () => (glove ? "glove-half" : "strap-half");
      return this.res.track(mat);
    };
    // Latex: smooth, no texture, with a soft gloss
    const gloveMats = ([1, -1] as const).map((half) =>
      halve(
        new THREE.MeshPhysicalMaterial({
          vertexColors: true,
          roughness: 0.42,
          metalness: 0,
          clearcoat: 0.45,
          clearcoatRoughness: 0.35,
        }),
        half,
        true,
      ),
    );
    const skinMat = this.std("#d9a98f", 0.74);
    const weaveTex = this.res.track(fabricTexture());
    const velcros = ([1, -1] as const).map((half) =>
      halve(new THREE.MeshStandardMaterial({ color: "#2b2c30", roughness: 1, bumpMap: weaveTex, bumpScale: 1.2 }), half, false),
    );
    const leather = this.std("#e7e8ea", 0.7);
    const housing = this.std("#dfe1e4", 0.55, 0.05);
    const dark = this.std("#1b1c1f", 0.5, 0.2);

    /* Wrist camera: a small camera on the palm side of the strap, looking up at the palm */
    const wristCam = new THREE.Group();
    {
      const cam = new THREE.Group();
      cam.position.set(-0.85, 6.9, 4.72);
      cam.rotation.x = -0.1;
      wristCam.add(cam);
      scan.add(wristCam);
      // Same matte charcoal as the strap, so the camera reads as part of it
      const camMat = this.std("#2b2c30", 0.92);
      const body = new THREE.Mesh(g(roundedBox(1.7, 1.25, 0.72, 0.28, 0.1)), camMat);
      const mount = new THREE.Mesh(g(roundedBox(2.1, 1.6, 0.16, 0.3, 0.05)), camMat);
      mount.position.z = -0.36;
      // The lens sits on the face that points at the fingers
      const barrel = new THREE.Mesh(g(new THREE.CylinderGeometry(0.3, 0.33, 0.2, 28)), camMat);
      barrel.position.set(0, 0.7, 0.02);
      const glass = new THREE.Mesh(
        g(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 24)),
        this.res.track(new THREE.MeshPhysicalMaterial({ color: "#0b0d12", roughness: 0.05, metalness: 0.2, clearcoat: 1 })),
      );
      glass.position.set(0, 0.81, 0.02);
      cam.add(body, mount, barrel, glass);
    }

    let processor: THREE.Group | null = null;
    /* Processor on the back of the hand: a plain square box on a mounting plate */
    {
      const top = new THREE.Group();
      processor = top;
      top.position.set(0.0, 13.7, -0.55);
      top.rotation.set(0.06, 0, 0.04);
      scan.add(top);
      const plate = new THREE.Mesh(g(roundedBox(4.6, 4.6, 0.26, 0.5, 0.08)), leather);
      const box = new THREE.Mesh(g(roundedBox(3.9, 3.9, 1.25, 0.32, 0.12)), housing);
      box.position.z = -0.7;
      const lid = new THREE.Mesh(g(roundedBox(3.1, 3.1, 0.08, 0.2, 0.02)), dark);
      lid.position.z = -1.35;
      const port = new THREE.Mesh(g(roundedBox(0.9, 0.24, 0.34, 0.08, 0.02)), dark);
      port.position.set(0, -1.96, -0.7);
      const led = new THREE.Mesh(
        g(new THREE.SphereGeometry(0.09, 12, 8)),
        this.res.track(new THREE.MeshBasicMaterial({ color: "#ff9500" })),
      );
      led.position.set(1.25, 1.25, -1.4);
      top.add(plate, box, lid, port, led);
    }

    new OBJLoader().load("/models/hand-scan.obj", (obj) => {
      let src: THREE.BufferGeometry | null = null;
      obj.traverse((c) => {
        if ((c as THREE.Mesh).isMesh && !src) src = (c as THREE.Mesh).geometry;
      });
      if (!src) return;
      const geo = src as THREE.BufferGeometry;
      this.res.track(geo);
      const P = geo.attributes.position!.array as Float32Array;
      const N = geo.attributes.normal!.array as Float32Array;
      const U = geo.attributes.uv ? (geo.attributes.uv.array as Float32Array) : null;

      // The bare hand and forearm. The hand is under the glove until the glove comes off.
      const armPos: number[] = [];
      const armNrm: number[] = [];
      const armUv: number[] = [];
      for (let t = 0; t < P.length; t += 9) {
        for (let v = 0; v < 3; v++) {
          const i = t + v * 3;
          // The scan stops mid-forearm. Its last stretch is drawn out along the arm, so the
          // forearm leaves the stage as one continuous piece of the same skin.
          const pull = THREE.MathUtils.smoothstep(2.6 - P[i + 1]!, 0, 2.4) * 46;
          armPos.push(P[i]! - 0.02 * pull, P[i + 1]! - 0.976 * pull, P[i + 2]! - 0.214 * pull);
          armNrm.push(N[i]!, N[i + 1]!, N[i + 2]!);
          if (U) armUv.push(U[(i / 3) * 2]!, U[(i / 3) * 2 + 1]!);
        }
      }
      const armGeo = this.res.track(new THREE.BufferGeometry());
      armGeo.setAttribute("position", new THREE.Float32BufferAttribute(armPos, 3));
      armGeo.setAttribute("normal", new THREE.Float32BufferAttribute(armNrm, 3));
      if (U) armGeo.setAttribute("uv", new THREE.Float32BufferAttribute(armUv, 2));
      const skin = new THREE.Mesh(armGeo, skinMat);
      new THREE.TextureLoader().load("/models/hand-scan-skin.jpg", (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        this.res.track(tex);
        skinMat.map = tex;
        skinMat.color.set("#e9c3ae"); // deepens the scan's pale tone so skin reads as skin next to the glove
        skinMat.needsUpdate = true;
      });
      new THREE.TextureLoader().load("/models/hand-scan-normal.jpg", (tex) => {
        this.res.track(tex);
        skinMat.normalMap = tex; // pores and creases
        skinMat.normalScale.set(1.4, 1.4);
        skinMat.needsUpdate = true;
      });
      scan.add(skin);

      // The glove: every triangle above the wrist, lifted off the skin and coloured by zone
      const pos: number[] = [];
      const nrm: number[] = [];
      const uv: number[] = [];
      const col: number[] = [];
      const half: number[] = []; // > 0 on the palm side, < 0 on the back of the hand
      const c = new THREE.Color();
      let tipY = -Infinity;
      for (let t = 0; t < P.length; t += 9) {
        // Keep triangles that reach above the cuff line; the material trims them to a straight edge.
        if (Math.max(P[t + 1]!, P[t + 4]!, P[t + 7]!) < CUFF_Y) continue;
        for (let v = 0; v < 3; v++) {
          const i = t + v * 3;
          const x = P[i]!;
          const y = P[i + 1]!;
          const z = P[i + 2]!;
          pos.push(x + N[i]! * LIFT, y + N[i + 1]! * LIFT, z + N[i + 2]! * LIFT);
          nrm.push(N[i]!, N[i + 1]!, N[i + 2]!);
          half.push(N[i + 2]!);
          if (U) uv.push(U[(i / 3) * 2]!, U[(i / 3) * 2 + 1]!);
          c.copy(LEATHER); // the dark fingertips are drawn per pixel, in the material
          col.push(c.r, c.g, c.b);
          if (x > 1.9 && x < 4.1 && y > tipY) {
            tipY = y;
            this.indexTip.position.set(x, y + 0.5, z + 0.2);
          }
        }
      }
      const glove = new THREE.BufferGeometry();
      glove.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      glove.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
      glove.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      if (U) glove.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      glove.setAttribute("aRest", new THREE.Float32BufferAttribute(pos, 3));
      glove.setAttribute("aHalf", new THREE.Float32BufferAttribute(half, 1));
      this.res.track(glove);

      /* Where each dark fingertip starts: a fixed length back from the tip, along the finger */
      {
        // x range of each finger in scan space, and the length of its dark tip
        const tipsX: [number, number, number][] = [
          [5.4, 99, 1.9], // thumb
          [1.6, 4.2, 1.9], // index
          [-0.7, 1.6, 2.0], // middle
          [-3.0, -0.7, 1.9], // ring
          [-99, -3.0, 1.6], // little finger
        ];
        tipsX.forEach(([x0, x1, length], f) => {
          const verts: THREE.Vector3[] = [];
          const mean = new THREE.Vector3();
          for (let j = 0; j < pos.length; j += 3) {
            if (pos[j]! < x0 || pos[j]! >= x1 || !isTip(pos[j]!, pos[j + 1]!)) continue;
            const v = new THREE.Vector3(pos[j]!, pos[j + 1]!, pos[j + 2]!);
            verts.push(v);
            mean.add(v);
          }
          if (verts.length < 3) return;
          mean.divideScalar(verts.length);
          // The finger's direction: the axis along which its tip vertices spread the most.
          const axis = new THREE.Vector3(0, 1, 0);
          for (let pass = 0; pass < 12; pass++) {
            const next = new THREE.Vector3();
            for (const v of verts) {
              const d = v.clone().sub(mean);
              next.addScaledVector(d, d.dot(axis));
            }
            axis.copy(next.normalize());
          }
          if (axis.y < 0) axis.negate();
          let reach = -Infinity;
          for (const v of verts) reach = Math.max(reach, v.clone().sub(mean).dot(axis));
          tipCaps.axis[f]!.copy(axis);
          tipCaps.start[f]!.copy(mean).addScaledVector(axis, reach - length);
        });
      }
      for (const mat of gloveMats) scan.add(new THREE.Mesh(glove, mat));

      /* ------------------------------------------------------------------ */
      /* Finger rig: the scan has no skeleton, so each finger is bent around  */
      /* three joints found from its own shape, and the thumb swings across.  */
      /* ------------------------------------------------------------------ */
      const FINGERS_X: [number, number, number][] = [
        // x range above the knuckles, height of the knuckle joint
        [1.65, 4.3, 17.3], // index
        [-0.7, 1.65, 17.6], // middle
        [-3.0, -0.7, 17.2], // ring
        [-99, -3.0, 16.4], // little
      ];
      const fingerOf = (x: number, y: number) => {
        if (y < 15.2 || x >= 4.3) return -1;
        for (let f = 0; f < 4; f++) if (x >= FINGERS_X[f]![0] && x < FINGERS_X[f]![1]) return f;
        return -1;
      };
      /** Centre of a finger (x, z) and its back surface (min z) at height y. */
      const slice = (f: number, y: number) => {
        let sx = 0;
        let sz = 0;
        let n = 0;
        let back = Infinity;
        for (let j = 0; j < pos.length; j += 3) {
          if (Math.abs(pos[j + 1]! - y) > 0.45 || fingerOf(pos[j]!, pos[j + 1]!) !== f) continue;
          sx += pos[j]!;
          sz += pos[j + 2]!;
          back = Math.min(back, pos[j + 2]!);
          n++;
        }
        return n ? { x: sx / n, z: sz / n, back } : null;
      };
      const joints = FINGERS_X.map(([, , y0], f) => {
        let tip = y0;
        for (let j = 0; j < pos.length; j += 3) {
          if (fingerOf(pos[j]!, pos[j + 1]!) === f) tip = Math.max(tip, pos[j + 1]!);
        }
        const len = tip - y0;
        const ys = [y0, y0 + len * 0.44, y0 + len * 0.73];
        return { tip, len, y: ys, z: ys.map((y) => slice(f, y)?.z ?? 2) };
      });

      const sm = THREE.MathUtils.smoothstep;
      const out = { x: 0, y: 0, z: 0, nx: 0, ny: 0, nz: 0 };
      /** Bends a rest-pose point (and a direction at it) by `curl`: 0 open hand, 1 fist. */
      const bend = (x: number, y: number, z: number, nx: number, ny: number, nz: number, curl: number) => {
        const f = fingerOf(x, y);
        if (f >= 0 && curl > 0) {
          const J = joints[f]!;
          const amount = [1.25, 1.7, 1.0];
          for (let k = 2; k >= 0; k--) {
            const w = sm(y, J.y[k]! - 0.75, J.y[k]! + 0.75);
            if (w <= 0) continue;
            const a = curl * amount[k]! * w * (f === 3 ? 1.08 : 1);
            const c = Math.cos(a);
            const s = Math.sin(a);
            const dy = y - J.y[k]!;
            const dz = z - J.z[k]!;
            y = J.y[k]! + dy * c - dz * s;
            z = J.z[k]! + dy * s + dz * c;
            const t = ny * c - nz * s;
            nz = ny * s + nz * c;
            ny = t;
          }
        }
        // Thumb: swings in front of the palm, around an upright axis at its base
        let wt = sm(x, 3.2, 4.9) * sm(y, 10.8, 12.4);
        if (x < 4.3) wt *= 1 - sm(y, 14.6, 15.6);
        if (f < 0 && wt > 0 && curl > 0 && y < 18.6) {
          const a = -curl * 1.15 * wt;
          const c = Math.cos(a);
          const s = Math.sin(a);
          const dx = x - 3.5;
          const dz = z - 2.4;
          x = 3.5 + dx * c + dz * s;
          z = 2.4 - dx * s + dz * c;
          const t = nx * c + nz * s;
          nz = -nx * s + nz * c;
          nx = t;
        }
        out.x = x;
        out.y = y;
        out.z = z;
        out.nx = nx;
        out.ny = ny;
        out.nz = nz;
      };

      /* Sensors inside the glove. Hidden while assembled; they come out in the exploded view. */
      type Layer = {
        mesh: THREE.InstancedMesh;
        p: number[]; // rest position
        d: number[]; // rest direction: surface normal for pads, finger direction for the rest
        axis: THREE.Vector3; // the instance's own axis that follows `d`
        shift: number; // how far it moves along the palm normal when exploded
      };
      const layers: Layer[] = [];
      const addLayer = (geo: THREE.BufferGeometry, mat: THREE.Material, p: number[], d: number[], axis: THREE.Vector3, shift: number) => {
        const mesh = new THREE.InstancedMesh(this.res.track(geo), mat, p.length / 3);
        mesh.frustumCulled = false;
        mesh.visible = false;
        scan.add(mesh);
        layers.push({ mesh, p, d, axis, shift });
        return mesh;
      };
      {
        // Tactile pads: one per cell of a grid laid over the palm side of the glove
        const PITCH_PAD = 0.6;
        const cells = new Map<string, number[]>();
        for (let j = 0; j < pos.length; j += 3) {
          if (nrm[j + 2]! < 0.35 || pos[j + 1]! < 11.2) continue;
          const key = `${Math.round(pos[j]! / PITCH_PAD)},${Math.round(pos[j + 1]! / PITCH_PAD)}`;
          const cell = cells.get(key) ?? [0, 0, 0, 0, 0, 0, 0];
          cell[0]! += pos[j]!;
          cell[1]! += pos[j + 1]!;
          cell[2]! += pos[j + 2]!;
          cell[3]! += nrm[j]!;
          cell[4]! += nrm[j + 1]!;
          cell[5]! += nrm[j + 2]!;
          cell[6]!++;
          cells.set(key, cell);
        }
        const pp: number[] = [];
        const pd: number[] = [];
        const pc: THREE.Color[] = [];
        const n = new THREE.Vector3();
        const TIP_BLUE = new THREE.Color("#2f5fd0");
        const FINGER_BLUE = new THREE.Color("#5b8be6");
        const PALM_BLUE = new THREE.Color("#9bb8f0");
        cells.forEach((cell, key) => {
          const m = cell[6]!;
          if (m < 2) return;
          const [ix, iy] = key.split(",").map(Number) as [number, number];
          // On the grid in x and y, so the pads read as tidy islands; depth follows the surface.
          const px = ix * PITCH_PAD;
          const py = iy * PITCH_PAD;
          pp.push(px, py, cell[2]! / m);
          n.set(cell[3]!, cell[4]!, cell[5]!).normalize();
          pd.push(n.x, n.y, n.z);
          const f = fingerOf(px, py);
          const onFinger = (f >= 0 && py > joints[f]!.y[0]! + 0.3) || px > 4.6;
          pc.push(isTip(px, py) ? TIP_BLUE : onFinger ? FINGER_BLUE : PALM_BLUE);
        });
        const padMesh = addLayer(new THREE.BoxGeometry(0.46, 0.46, 0.07), this.std("#ffffff", 0.55, 0.05), pp, pd, new THREE.Vector3(0, 0, 1), 3.7);
        pc.forEach((colour, i) => padMesh.setColorAt(i, colour));
        if (padMesh.instanceColor) padMesh.instanceColor.needsUpdate = true;

        // Flex tails down the back of each finger to the processor, and motion sensors on them
        const tp: number[] = [];
        const td: number[] = [];
        const ip: number[] = [];
        const id: number[] = [];
        joints.forEach((J, f) => {
          const base = slice(f, J.y[0]! + 0.6);
          if (!base) return;
          for (let y = 14.6; y < J.tip - 0.5; y += 0.42) {
            const s = y > J.y[0]! + 0.4 ? slice(f, y) : null;
            const px = s ? s.x : THREE.MathUtils.lerp(0.4, base.x, sm(y, 14.0, J.y[0]! + 0.6));
            const pz = s ? s.back : THREE.MathUtils.lerp(-0.35, base.back, sm(y, 15.0, J.y[0]! + 0.6));
            tp.push(px, y, pz - 0.14);
            td.push(0, 1, 0);
          }
          for (const t of [0.22, 0.58]) {
            const y = J.y[0]! + J.len * t;
            const s = slice(f, y);
            if (!s) continue;
            ip.push(s.x, y, s.back - 0.26);
            id.push(0, 1, 0);
          }
        });
        const up = new THREE.Vector3(0, 1, 0);
        addLayer(new THREE.BoxGeometry(0.3, 0.46, 0.05), this.std("#22b8cf", 0.5, 0.1), tp, td, up, -3.7);
        addLayer(new THREE.BoxGeometry(0.62, 0.8, 0.2), this.std("#f08c00", 0.5, 0.2), ip, id, up, -3.7);
      }

      const restSkin = Float32Array.from(armPos);
      const restSkinN = Float32Array.from(armNrm);
      const sp2 = armGeo.attributes.position!.array as Float32Array;
      const sn2 = armGeo.attributes.normal!.array as Float32Array;
      const restPos = Float32Array.from(pos);
      const restNrm = Float32Array.from(nrm);
      const gp = glove.attributes.position!.array as Float32Array;
      const gn = glove.attributes.normal!.array as Float32Array;
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const v3 = new THREE.Vector3();
      const dir = new THREE.Vector3();
      const scl = new THREE.Vector3();
      this.poser = (curl, explode) => {
        for (let j = 0; j < restPos.length; j += 3) {
          bend(restPos[j]!, restPos[j + 1]!, restPos[j + 2]!, restNrm[j]!, restNrm[j + 1]!, restNrm[j + 2]!, curl);
          gp[j] = out.x;
          gp[j + 1] = out.y;
          gp[j + 2] = out.z;
          gn[j] = out.nx;
          gn[j + 1] = out.ny;
          gn[j + 2] = out.nz;
        }
        glove.attributes.position!.needsUpdate = true;
        glove.attributes.normal!.needsUpdate = true;
        for (let j = 0; j < restSkin.length; j += 3) {
          if (restSkin[j + 1]! < 10) continue; // the forearm never bends
          bend(restSkin[j]!, restSkin[j + 1]!, restSkin[j + 2]!, restSkinN[j]!, restSkinN[j + 1]!, restSkinN[j + 2]!, curl);
          sp2[j] = out.x;
          sp2[j + 1] = out.y;
          sp2[j + 2] = out.z;
          sn2[j] = out.nx;
          sn2[j + 1] = out.ny;
          sn2[j + 2] = out.nz;
        }
        armGeo.attributes.position!.needsUpdate = true;
        armGeo.attributes.normal!.needsUpdate = true;

        // The glove slides off towards the fingertips and parts into its palm and back halves.
        const apart = explode * 7.4;
        const slide = explode * 1.0;
        split.value.set(apart, slide);

        const show = sm(explode, 0.02, 0.3);
        for (const layer of layers) {
          layer.mesh.visible = explode > 0.02;
          if (!layer.mesh.visible) continue;
          for (let i = 0; i < layer.p.length / 3; i++) {
            const j = i * 3;
            bend(layer.p[j]!, layer.p[j + 1]!, layer.p[j + 2]!, layer.d[j]!, layer.d[j + 1]!, layer.d[j + 2]!, curl);
            v3.set(out.x, out.y, out.z + layer.shift * explode);
            q.setFromUnitVectors(layer.axis, dir.set(out.nx, out.ny, out.nz).normalize());
            m4.compose(v3, q, scl.setScalar(show));
            layer.mesh.setMatrixAt(i, m4);
          }
          layer.mesh.instanceMatrix.needsUpdate = true;
        }
        if (processor) processor.position.set(0, 13.7 + slide, -0.55 - apart);
        wristCam.position.set(0, slide, apart); // leaves with the palm half of the strap
      };

      /* Wrist wrap, shaped to the arm itself: measure the arm's outline at several heights of
         the scan, then wrap a wide ribbon just outside it, from the glove's edge down the
         forearm, with the wrap's free end lapped on top. */
      {
        const Y0 = 5.4; // down the forearm
        const Y1 = 8.25; // just over the glove's edge
        const BINS = 72;
        type Ring = { y: number; cx: number; cz: number; radius: Float32Array };

        const measure = (y: number): Ring => {
          let cx = 0;
          let cz = 0;
          let m = 0;
          for (let i = 0; i < P.length; i += 3) {
            if (Math.abs(P[i + 1]! - y) > 0.5) continue;
            cx += P[i]!;
            cz += P[i + 2]!;
            m++;
          }
          cx /= Math.max(m, 1);
          cz /= Math.max(m, 1);
          let radius = new Float32Array(BINS);
          for (let i = 0; i < P.length; i += 3) {
            if (Math.abs(P[i + 1]! - y) > 0.5) continue;
            const dx = P[i]! - cx;
            const dz = P[i + 2]! - cz;
            const bin = Math.floor(((Math.atan2(dz, dx) + Math.PI) / (Math.PI * 2)) * BINS) % BINS;
            radius[bin] = Math.max(radius[bin]!, Math.hypot(dx, dz));
          }
          for (let pass = 0; pass < 6; pass++) {
            for (let b = 0; b < BINS; b++) {
              if (radius[b]! > 0) continue;
              radius[b] = Math.max(radius[(b + BINS - 1) % BINS]!, radius[(b + 1) % BINS]!);
            }
          }
          for (let pass = 0; pass < 4; pass++) {
            const next = new Float32Array(BINS);
            for (let b = 0; b < BINS; b++) {
              const avg = (radius[(b + BINS - 1) % BINS]! + radius[b]! * 2 + radius[(b + 1) % BINS]!) / 4;
              next[b] = Math.max(avg, radius[b]! * 0.985); // smooth, but never cut into the arm
            }
            radius = next;
          }
          return { y, cx, cz, radius };
        };

        const ROWS = 13;
        const rings = Array.from({ length: ROWS }, (_, r) => measure(Y0 + ((Y1 - Y0) * r) / (ROWS - 1)));

        /** A ribbon around part of the arm, between two rows of rings, `off` above the surface. */
        const ribbon = (from: number, to: number, r0: number, r1: number, off: number) => {
          const rows = r1 - r0 + 1;
          const verts: number[] = [];
          const halves: number[] = [];
          const idx: number[] = [];
          for (let b = from; b <= to; b++) {
            const bin = ((b % BINS) + BINS) % BINS;
            const a = (bin / BINS) * Math.PI * 2 - Math.PI + Math.PI / BINS;
            for (let row = 0; row < rows; row++) {
              const ring = rings[r0 + row]!;
              // An even band: its cut ends then show as straight lines when the halves part.
              const lift = LIFT + off;
              const r = ring.radius[bin]! + lift;
              verts.push(ring.cx + Math.cos(a) * r, ring.y, ring.cz + Math.sin(a) * r);
              halves.push(Math.sin(a)); // palm side of the arm is positive, like the glove
            }
          }
          const cols = to - from;
          for (let c = 0; c < cols; c++) {
            for (let row = 0; row < rows - 1; row++) {
              const i0 = c * rows + row;
              const i1 = (c + 1) * rows + row;
              idx.push(i0, i0 + 1, i1, i1, i0 + 1, i1 + 1);
            }
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
          geo.setIndex(idx);
          geo.setAttribute("aRest", new THREE.Float32BufferAttribute(verts, 3));
          geo.setAttribute("aHalf", new THREE.Float32BufferAttribute(halves, 1));
          geo.computeVertexNormals();
          this.res.track(geo);
          // Drawn once per half, so the wrap parts exactly where the glove does.
          for (const mat of velcros) scan.add(new THREE.Mesh(geo, mat));
        };
        ribbon(0, BINS, 0, ROWS - 1, 0.16);
        // The free end, lapped over the wrap on the back of the wrist
        const back = Math.round(BINS * 0.22);
        ribbon(back - 9, back + 7, 1, ROWS - 2, 0.34);
      }

      // The data particles leave from the fingertips only: the last stretch of each finger and the thumb.
      const tips: number[] = [];
      for (let j = 0; j < pos.length; j += 3) {
        const x = pos[j]!;
        const y = pos[j + 1]!;
        if (isTip(x, y)) tips.push(j);
      }
      const count = Math.min(1600, tips.length);
      const sp = new Float32Array(count * 3);
      const sn = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const j = tips[Math.floor(Math.random() * tips.length)]!;
        sp.set([pos[j]!, pos[j + 1]!, pos[j + 2]!], i * 3);
        sn.set([nrm[j]!, nrm[j + 1]!, nrm[j + 2]!], i * 3);
      }
      if (count > 0) this.surface = { obj: scan, pos: sp, nrm: sn, count };
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Modelled robot hand                                                     */
  /* ---------------------------------------------------------------------- */

  /**
   * The model stands fingers-up with its palm towards -x and its thumb towards
   * -z; it is turned so the thumb ends up on +x like the other hands, which
   * leaves the back of the hand towards the viewer.
   */
  private buildRobotModel() {
    const g = <T extends THREE.BufferGeometry>(geo: T) => this.res.track(geo);
    const white = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#f1f2f4",
        roughness: 0.32,
        metalness: 0.02,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
      }),
    );
    const black = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#141518",
        roughness: 0.38,
        metalness: 0.45,
        clearcoat: 0.4,
        clearcoatRoughness: 0.35,
      }),
    );
    const matte = this.std("#25262a", 0.65, 0.3);
    const rubber = this.std("#0e0f11", 0.95);
    const steel = this.std("#9aa0a8", 0.28, 0.95);

    const K = 4.7; // model units → hand units
    const model = new THREE.Group();
    model.rotation.y = -Math.PI / 2;
    model.scale.setScalar(K);
    // Model-space palm centre (3.69, -0.45, -0.28) goes to the hand's origin.
    model.position.set(-0.28 * K, 0.45 * K, -3.69 * K);
    this.body.add(model);
    this.palmAnchor.position.set(3.2, -0.45, -0.28);
    this.indexTip.position.set(3.6, 2.5, -1.2);
    model.add(this.palmAnchor, this.indexTip);

    /* Forearm housing, running off stage below the model's wrist */
    {
      const housing = new THREE.Mesh(g(roundedBox(7.6, 40, 6.2, 1.6, 0.35)), black);
      housing.position.y = -38.6;
      const ring = new THREE.Mesh(g(roundedBox(7.9, 0.5, 6.5, 1.7, 0.1)), white);
      ring.position.y = -19.4;
      this.body.add(housing, ring);
      for (let i = 0; i < 7; i++) {
        const slot = new THREE.Mesh(g(new THREE.BoxGeometry(3.4, 0.12, 0.08)), steel);
        slot.position.set(0, -21.6 - i * 0.36, -3.14);
        this.body.add(slot);
      }
    }

    new GLTFLoader().load("/models/robot-hand.glb", (gltf) => {
      const scene = gltf.scene;
      model.add(scene);
      model.updateMatrixWorld(true);
      const inv = new THREE.Matrix4().copy(model.matrixWorld).invert();
      const toModel = new THREE.Matrix4();
      const box = new THREE.Box3();
      const size = new THREE.Vector3();
      const centre = new THREE.Vector3();
      const v = new THREE.Vector3();
      const n = new THREE.Vector3();
      const nm = new THREE.Matrix3();
      const pts: number[] = [];
      const tipPts: number[] = [];
      const tipNrms: number[] = [];

      scene.traverse((c) => {
        const mesh = c as THREE.Mesh;
        if (!mesh.isMesh) return;
        this.res.track(mesh.geometry);
        const name = (mesh.material as THREE.Material).name;
        toModel.multiplyMatrices(inv, mesh.matrixWorld);
        box.setFromObject(mesh).applyMatrix4(inv);
        box.getSize(size);
        box.getCenter(centre);

        // Same palette as before: black chassis, white finger shells, steel pins, rubber pads.
        if (name === "Material.012") {
          const chassis = centre.y < -0.9 || size.z > 1.4;
          mesh.material = chassis ? black : white;
        } else if (name === "Material.000") mesh.material = rubber;
        else if (name === "Material.011") mesh.material = steel;
        else if (name === "Material.010") mesh.material = matte;
        else if (name === "Material.013") mesh.material = white;
        else mesh.material = black;

        const P = mesh.geometry.attributes.position!;
        const N = mesh.geometry.attributes.normal;
        nm.getNormalMatrix(toModel);
        const isTip = name === "Material.000"; // the fingertip pads
        for (let i = 0; i < P.count; i++) {
          v.fromBufferAttribute(P, i).applyMatrix4(toModel);
          pts.push(v.x, v.y, v.z);
          if (!isTip) continue;
          if (N) n.fromBufferAttribute(N, i).applyMatrix3(nm).normalize();
          else n.set(1, 0, 0);
          tipPts.push(v.x, v.y, v.z);
          tipNrms.push(n.x, n.y, n.z);
        }
      });

      // Index fingertip: the highest point of the finger next to the thumb (thumb side is -z).
      let top = -Infinity;
      for (let i = 0; i < pts.length; i += 3) top = Math.max(top, pts[i + 1]!);
      let zMin = Infinity;
      let zMax = -Infinity;
      for (let i = 0; i < pts.length; i += 3) {
        if (pts[i + 1]! < top - 1.2) continue;
        zMin = Math.min(zMin, pts[i + 2]!);
        zMax = Math.max(zMax, pts[i + 2]!);
      }
      let tipY = -Infinity;
      for (let i = 0; i < pts.length; i += 3) {
        if (pts[i + 2]! > zMin + (zMax - zMin) * 0.25 || pts[i + 1]! < tipY) continue;
        tipY = pts[i + 1]!;
        this.indexTip.position.set(pts[i]!, tipY + 0.1, pts[i + 2]!);
      }

      // The data particles land on the fingertips only.
      const total = tipPts.length / 3;
      const count = Math.min(1600, total);
      const sp = new Float32Array(count * 3);
      const sn = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const j = Math.floor(Math.random() * total) * 3;
        sp.set([tipPts[j]!, tipPts[j + 1]!, tipPts[j + 2]!], i * 3);
        sn.set([tipNrms[j]!, tipNrms[j + 1]!, tipNrms[j + 2]!], i * 3);
      }
      if (count > 0) this.surface = { obj: model, pos: sp, nrm: sn, count };
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Robot hand                                                              */
  /* ---------------------------------------------------------------------- */

  private buildRobot() {
    const g = <T extends THREE.BufferGeometry>(geo: T) => this.res.track(geo);
    const shell = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#f1f2f4",
        roughness: 0.32,
        metalness: 0.02,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
      }),
    );
    const black = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#141518",
        roughness: 0.38,
        metalness: 0.45,
        clearcoat: 0.4,
        clearcoatRoughness: 0.35,
      }),
    );
    const matte = this.std("#222327", 0.7, 0.2);
    const rubber = this.std("#0e0f11", 0.95);
    const steel = this.std("#9aa0a8", 0.28, 0.95);

    /* Palm: black chassis with a faceted cover, rubber pad and knuckle housing */
    const palm = new THREE.Mesh(this.palmGeometry(0.9, 0.34), black);
    palm.scale.set(0.95, 0.93, 1);
    this.body.add(palm);
    const cover = new THREE.Mesh(g(roundedBox(5.6, 5.4, 0.42, 0.5, 0.16)), matte);
    cover.position.set(-0.35, 0.5, 0.86);
    const pad = new THREE.Mesh(g(roundedBox(3.9, 3.2, 0.2, 0.9, 0.08)), rubber);
    pad.position.set(-0.5, 0.1, 1.12);
    const heel = new THREE.Mesh(g(roundedBox(5.4, 1.5, 0.5, 0.5, 0.18)), black);
    heel.position.set(-0.1, -3.4, 0.75);
    const knuckleBar = new THREE.Mesh(g(roundedBox(8.0, 1.7, 1.9, 0.5, 0.25)), black);
    knuckleBar.position.set(0.05, 3.75, -0.05);
    knuckleBar.rotation.z = 0.05;
    const backPlate = new THREE.Mesh(g(roundedBox(6.2, 5.6, 0.4, 0.6, 0.16)), matte);
    backPlate.position.set(-0.1, 0.1, -0.86);
    this.body.add(cover, pad, heel, knuckleBar, backPlate);
    // Actuator barrels and screws on the back
    FINGERS.forEach((f) => {
      const barrel = new THREE.Mesh(g(new THREE.CylinderGeometry(0.34, 0.34, 4.2, 20)), steel);
      barrel.position.set(f.x * 0.82, 0.6, -1.08);
      this.body.add(barrel);
    });
    for (const [x, y] of [[-2.6, 2.4], [2.6, 2.4], [-2.6, -2.2], [2.6, -2.2]] as const) {
      const screw = new THREE.Mesh(g(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12)), steel);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(x - 0.35, y + 0.5, 1.1);
      this.body.add(screw);
    }
    this.palmAnchor.position.set(0, 0.5, 1.25);
    this.body.add(this.palmAnchor);

    const chain = (
      base: THREE.Group,
      len: number[],
      rad: number[],
      finger: number,
      bias: number,
      weights: number[],
    ) => {
      let parent = base;
      const last = len.length - 1;
      len.forEach((l, i) => {
        const r = rad[i]! * 0.96;
        const joint = new THREE.Group();
        if (i > 0) joint.position.y = len[i - 1]!;
        parent.add(joint);
        this.joints.push({ group: joint, weight: weights[i]!, bias, finger });

        // Hinge: black barrel, steel pin with a cap on each side
        const hinge = new THREE.Mesh(g(new THREE.CylinderGeometry(r * 0.86, r * 0.86, r * 1.9, 32)), black);
        hinge.rotation.z = Math.PI / 2;
        const pin = new THREE.Mesh(g(new THREE.CylinderGeometry(r * 0.3, r * 0.3, r * 2.12, 16)), steel);
        pin.rotation.z = Math.PI / 2;
        joint.add(hinge, pin);

        // Inner link and the push rod that drives the next joint
        const link = new THREE.Mesh(g(roundedBox(r * 1.15, l, r * 1.0, r * 0.25, 0.04)), black);
        link.position.y = l / 2;
        const rod = new THREE.Mesh(g(new THREE.CylinderGeometry(0.07, 0.07, l * 0.92, 8)), steel);
        rod.position.set(r * 0.36, l / 2, -r * 0.72);
        joint.add(link, rod);

        // White shell over the back and sides, black rubber pad underneath
        const tip = i === last;
        const coverLen = tip ? l * 0.7 : l * 0.56;
        const cy = tip ? l * 0.6 : l * 0.52;
        const shellMesh = new THREE.Mesh(g(new THREE.CapsuleGeometry(r * 1.02, coverLen, 10, 32)), shell);
        shellMesh.position.set(0, cy, -r * 0.06);
        shellMesh.scale.z = FLAT;
        const grip = new THREE.Mesh(g(new THREE.CapsuleGeometry(r * 0.7, coverLen * 0.72, 8, 24)), rubber);
        grip.position.set(0, cy + (tip ? l * 0.04 : 0), r * 0.44);
        grip.scale.z = 0.62;
        joint.add(shellMesh, grip);
        if (tip) {
          const nail = new THREE.Mesh(g(roundedBox(r * 1.1, l * 0.34, 0.08, r * 0.3, 0.02)), black);
          nail.position.set(0, l * 0.82, -r * FLAT * 0.98);
          joint.add(nail);
          if (finger === 1) {
            this.indexTip.position.set(0, l + r * 0.75, r * 0.25);
            joint.add(this.indexTip);
          }
        }
        parent = joint;
      });
    };

    FINGERS.forEach((f, fi) => {
      const base = new THREE.Group();
      base.position.set(f.x, f.y + 0.35, 0);
      base.rotation.z = f.splay;
      this.body.add(base);
      chain(base, f.len, f.r, fi + 1, f.bias, [0.85, 1.05, 0.7]);
    });
    const thumb = this.thumbBase();
    chain(thumb, THUMB.len, THUMB.r, 0, 0, [0.12, 0.55, 0.6]);
    // Thumb drive: a larger black motor housing at its base
    const motor = new THREE.Mesh(g(new THREE.CylinderGeometry(1.25, 1.25, 2.3, 32)), black);
    motor.rotation.x = Math.PI / 2;
    motor.position.set(2.5, -2.6, 0.2);
    const motorCap = new THREE.Mesh(g(new THREE.CylinderGeometry(0.8, 0.8, 2.5, 24)), steel);
    motorCap.rotation.x = Math.PI / 2;
    motorCap.position.copy(motor.position);
    this.body.add(motor, motorCap);

    /* Wrist and forearm: collar, white ring, then a black housing with a vent */
    const collar = new THREE.Mesh(g(new THREE.CylinderGeometry(2.5, 2.7, 1.4, 40)), black);
    collar.scale.z = 0.72;
    collar.position.y = -5.3;
    const ring = new THREE.Mesh(g(new THREE.CylinderGeometry(2.78, 2.78, 0.34, 40)), shell);
    ring.scale.z = 0.72;
    ring.position.y = -6.1;
    const housingGeo = g(roundedBox(6.6, 34, 4.6, 1.5, 0.35));
    const housing = new THREE.Mesh(housingGeo, black);
    housing.position.y = -23.4;
    this.body.add(collar, ring, housing);
    for (let i = 0; i < 7; i++) {
      const slot = new THREE.Mesh(g(new THREE.BoxGeometry(3.2, 0.12, 0.08)), steel);
      slot.position.set(0, -7.6 - i * 0.34, 2.33);
      this.body.add(slot);
    }
    const stripe = new THREE.Mesh(g(new THREE.BoxGeometry(0.1, 9, 0.5)), shell);
    stripe.position.set(3.31, -13, 0);
    this.body.add(stripe);
  }

  /* ---------------------------------------------------------------------- */

  /** Eases the state towards the target and poses the model. */
  update(
    dt: number,
    time: number,
    still: boolean,
    visW: number,
    visH: number,
    fit: number,
    nudge: { x: number; y: number },
  ) {
    const s = this.state;
    const k = dt === 0 ? 1e6 : 5.5;
    (Object.keys(s) as (keyof GloveState)[]).forEach((key) => {
      s[key] = damp(s[key], this.target[key], k, dt || 1);
    });

    const scale = s.scale * fit;
    this.root.position.set(s.x * visW + s.ox * fit, s.y * visH + s.oy * fit, 0);
    this.root.scale.set(this.mirrored ? -scale : scale, scale, scale);
    this.root.rotation.set(s.rotX + nudge.x, s.rotY + nudge.y, s.rotZ);

    const breathe = still ? 0 : Math.sin(time * 0.9 + (this.style === "robot" ? 1.3 : 0)) * 0.025;
    for (const j of this.joints) {
      let c = s.curl + j.bias * (0.4 + s.curl);
      if (j.finger === 1) c = THREE.MathUtils.lerp(c, 0.06, s.point);
      else if (j.finger > 1) c += s.point * (0.16 + (j.finger - 2) * 0.09);
      j.group.rotation.x = THREE.MathUtils.clamp(c + breathe, 0, 1.05) * j.weight * 1.45;
    }

    const e = s.explode;
    if (this.poser && (Math.abs(s.curl - this.posed.curl) > 1e-4 || Math.abs(e - this.posed.explode) > 1e-4)) {
      this.posed.curl = s.curl;
      this.posed.explode = e;
      this.poser(s.curl, e);
    }
    for (const obj of this.front) obj.position.z = e * EXPLODE;
    for (const b of this.back) {
      b.obj.position.z = b.z - e * EXPLODE;
      if (b.hidden) b.obj.visible = e > 0.02;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Data stream between the two index fingertips                                */
/* -------------------------------------------------------------------------- */

const STREAM_VS = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uPx;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPx;
  }
`;
const STREAM_FS = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.32, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

/** Black through greys: mostly dark, so the cloud reads on a white page. */
const STREAM_COLORS = ["#0f0f0f", "#1f1f1e", "#3a3a38", "#5c5b58", "#84827e", "#aeaca7"];

class Stream {
  readonly points: THREE.Points;
  private readonly n: number;
  /** t, speed, index on hand A, index on hand B */
  private readonly seed: Float32Array;
  /** lift, phase, jitter x, jitter y */
  private readonly vary: Float32Array;
  private readonly push: Float32Array; // displacement xy + velocity xy
  private readonly pos: Float32Array;
  private readonly alpha: Float32Array;
  private readonly material: THREE.ShaderMaterial;

  constructor(res: Resources, n: number) {
    this.n = n;
    this.seed = new Float32Array(n * 4);
    this.vary = new Float32Array(n * 4);
    this.push = new Float32Array(n * 4);
    this.pos = new Float32Array(n * 3);
    this.alpha = new Float32Array(n);
    const size = new Float32Array(n);
    const color = new Float32Array(n * 3);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      this.seed[i * 4] = Math.random();
      this.seed[i * 4 + 1] = 0.07 + Math.random() * 0.09;
      this.seed[i * 4 + 2] = Math.random();
      this.seed[i * 4 + 3] = Math.random();
      this.vary[i * 4] = 0.03 + Math.pow(Math.random(), 2.2) * 0.5;
      this.vary[i * 4 + 1] = Math.random() * Math.PI * 2;
      this.vary[i * 4 + 2] = Math.random() - 0.5;
      this.vary[i * 4 + 3] = Math.random() - 0.5;
      // Mostly fine black dust, with mid and light greys mixed in.
      const tone = Math.pow(Math.random(), 1.3);
      size[i] = 0.9 + Math.random() * 1.9;
      c.set(STREAM_COLORS[Math.floor(tone * (STREAM_COLORS.length - 0.01))]!);
      color.set([c.r, c.g, c.b], i * 3);
    }
    const geo = res.track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(this.alpha, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    this.material = res.track(
      new THREE.ShaderMaterial({
        vertexShader: STREAM_VS,
        fragmentShader: STREAM_FS,
        uniforms: { uPx: { value: 1 } },
        transparent: true,
        depthWrite: false,
      }),
    );
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
  }

  private readonly _a = new THREE.Vector3();
  private readonly _b = new THREE.Vector3();
  private readonly _n = new THREE.Vector3();
  private readonly _nm = new THREE.Matrix3();

  /** World position just above a random point of a hand's surface (or its fingertip, before the model loads). */
  private onSurface(hand: Hand, pick: number, lift: number, tip: THREE.Vector3, out: THREE.Vector3) {
    const s = hand.surface;
    if (!s) return out.copy(tip);
    const j = Math.floor(pick * s.count) * 3;
    out.set(s.pos[j]!, s.pos[j + 1]!, s.pos[j + 2]!).applyMatrix4(s.obj.matrixWorld);
    this._n.set(s.nrm[j]!, s.nrm[j + 1]!, s.nrm[j + 2]!).applyMatrix3(this._nm).normalize();
    return out.addScaledVector(this._n, lift);
  }

  /**
   * Each particle clings to the glove, lifts off, funnels through the gap
   * between the two index fingertips and settles on the robot hand: the data
   * wraps both hands and flows from one to the other. The cursor stirs it like
   * a liquid; it springs back afterwards.
   */
  update(
    dt: number,
    time: number,
    from: Hand,
    to: Hand,
    tipA: THREE.Vector3,
    tipB: THREE.Vector3,
    flow: number,
    cursor: THREE.Vector3 | null,
    px: number,
    unit: number,
  ) {
    this.points.visible = flow > 0.01;
    if (!this.points.visible) return;
    this.material.uniforms.uPx!.value = px;
    const step = dt || 0.016;
    const reach = unit * 3.4;
    const gx = (tipA.x + tipB.x) / 2;
    const gy = (tipA.y + tipB.y) / 2;
    const gz = (tipA.z + tipB.z) / 2;
    const nmA = from.surface ? new THREE.Matrix3().getNormalMatrix(from.surface.obj.matrixWorld) : null;
    const nmB = to.surface ? new THREE.Matrix3().getNormalMatrix(to.surface.obj.matrixWorld) : null;

    for (let i = 0; i < this.n; i++) {
      const s = i * 4;
      let t = this.seed[s]! + this.seed[s + 1]! * step;
      if (t > 1) {
        t -= 1;
        this.seed[s + 2] = Math.random();
        this.seed[s + 3] = Math.random();
      }
      this.seed[s] = t;

      const lift = (this.vary[s]! + 0.12 * Math.sin(time * 1.7 + this.vary[s + 1]!)) * unit;
      if (nmA) this._nm.copy(nmA);
      this.onSurface(from, this.seed[s + 2]!, lift, tipA, this._a);
      if (nmB) this._nm.copy(nmB);
      this.onSurface(to, this.seed[s + 3]!, lift, tipB, this._b);

      // Rest on the glove, cross through the gap, rest on the robot hand.
      const u = THREE.MathUtils.smootherstep(t, 0.06, 0.94);
      const w0 = (1 - u) * (1 - u);
      const w1 = 2 * u * (1 - u);
      const w2 = u * u;
      const spread = unit * 1.5;
      let x = w0 * this._a.x + w1 * (gx + this.vary[s + 2]! * spread) + w2 * this._b.x;
      let y = w0 * this._a.y + w1 * (gy + this.vary[s + 3]! * spread) + w2 * this._b.y;
      const z = w0 * this._a.z + w1 * gz + w2 * this._b.z;

      // Liquid response to the cursor
      let dx = this.push[s]!;
      let dy = this.push[s + 1]!;
      let vx = this.push[s + 2]!;
      let vy = this.push[s + 3]!;
      if (cursor) {
        const rx = x + dx - cursor.x;
        const ry = y + dy - cursor.y;
        const d2 = rx * rx + ry * ry;
        const f = Math.exp(-d2 / (reach * reach));
        const inv = 1 / Math.sqrt(d2 + 0.01);
        vx += (rx * inv * 0.9 - ry * inv * 0.75) * f * unit * 70 * step;
        vy += (ry * inv * 0.9 + rx * inv * 0.75) * f * unit * 70 * step;
      }
      vx -= dx * 5 * step;
      vy -= dy * 5 * step;
      const drag = Math.pow(0.05, step);
      vx *= drag;
      vy *= drag;
      dx += vx * step;
      dy += vy * step;
      this.push[s] = dx;
      this.push[s + 1] = dy;
      this.push[s + 2] = vx;
      this.push[s + 3] = vy;
      x += dx;
      y += dy;

      this.pos[i * 3] = x;
      this.pos[i * 3 + 1] = y;
      this.pos[i * 3 + 2] = z;
      const edge = Math.min(1, t * 10, (1 - t) * 10);
      this.alpha[i] = flow * edge * 0.9;
    }
    const geo = this.points.geometry;
    geo.attributes.position!.needsUpdate = true;
    geo.attributes.aAlpha!.needsUpdate = true;
  }
}

/* -------------------------------------------------------------------------- */

export type Anchor = { x: number; y: number };

export class GloveRig {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(30, 1, 1, 400);

  /** Target of the robot hand, when the rig was created with one. */
  robotTarget: GloveState | null = null;
  /** 0 … 1: strength of the data stream between the fingertips. */
  flow = 0;
  nudge = { x: 0, y: 0 };
  pointer: { x: number; y: number } | null = null;
  /** Fingertip contact, thumb to pinky, 0 … 1. */
  readonly signals = new Float32Array(5);
  /** Screen positions (0 … 1 of the canvas) for HTML labels. */
  readonly anchors: Record<"glove" | "robot" | "contact", Anchor> = {
    glove: { x: 0, y: 0 },
    robot: { x: 0, y: 0 },
    contact: { x: 0, y: 0 },
  };
  still = false;

  private readonly res = new Resources();
  private readonly glove: Hand;
  private readonly robot: Hand | null = null;
  private readonly stream: Stream | null = null;
  private readonly nudgeNow = { x: 0, y: 0 };
  private flowNow = 0;
  private readonly clock = new THREE.Clock();
  private readonly raycaster = new THREE.Raycaster();
  private frame = 0;
  private running = false;
  private time = 0;
  private aspect = 1;
  private height = 1;

  constructor(canvas: HTMLCanvasElement, opts: { robot?: boolean; scan?: boolean; mirrored?: boolean } = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x000000, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = env.texture;
    this.scene.environmentIntensity = 0.85;
    this.res.track(env.texture);
    this.res.track(pmrem);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(14, 22, 30);
    const rim = new THREE.DirectionalLight(0xffffff, 1.4);
    rim.position.set(-20, 8, -18);
    this.scene.add(key, rim);
    this.camera.position.set(0, 0, 60);

    // On stage with the robot hand: the scanned hand in its glove. Alone: the posable concept model.
    this.glove = new Hand(this.res, opts.robot || opts.scan ? "scan" : "glove", opts.mirrored ?? false);
    this.scene.add(this.glove.root);
    if (opts.robot) {
      this.robot = new Hand(this.res, "model", false);
      this.robotTarget = this.robot.target;
      this.scene.add(this.robot.root);
      this.stream = new Stream(this.res, 3200);
      this.scene.add(this.stream.points);
    }
  }

  /** Where the consumer wants the glove; the rig eases towards it. */
  get target() {
    return this.glove.target;
  }

  resize(width: number, height: number) {
    if (width === 0 || height === 0) return;
    this.aspect = width / height;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = this.aspect;
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

  /** Jump straight to the targets, without easing. */
  snap() {
    Object.assign(this.glove.state, this.glove.target);
    if (this.robot) Object.assign(this.robot.state, this.robot.target);
    this.flowNow = this.flow;
  }

  private readonly _p = new THREE.Vector3();
  private readonly _n = new THREE.Vector3();
  private readonly _v = new THREE.Vector3();
  private readonly _a = new THREE.Vector3();
  private readonly _b = new THREE.Vector3();
  private readonly _cursor = new THREE.Vector3();
  private readonly _nm = new THREE.Matrix3();
  private readonly _c = new THREE.Color();
  private readonly _ndc = new THREE.Vector2();
  private readonly _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private readonly _none = { x: 0, y: 0 };

  private project(v: THREE.Vector3, out: Anchor) {
    this._v.copy(v).project(this.camera);
    out.x = this._v.x * 0.5 + 0.5;
    out.y = 0.5 - this._v.y * 0.5;
  }

  render(dt: number) {
    if (!this.still) this.time += dt;
    this.nudgeNow.x = damp(this.nudgeNow.x, this.nudge.x, 7, dt || 1);
    this.nudgeNow.y = damp(this.nudgeNow.y, this.nudge.y, 7, dt || 1);
    this.flowNow = damp(this.flowNow, this.flow, dt === 0 ? 1e6 : 4, dt || 1);

    const visH = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(15));
    const visW = visH * this.aspect;
    const fit = Math.min(1, visW / 15.5);

    // With two hands on stage the cursor only stirs the data; a single glove leans to it.
    const duo = this.robot !== null && this.flowNow > 0.5;
    this.glove.update(dt, this.time, this.still, visW, visH, fit, duo ? this._none : this.nudgeNow);
    this.robot?.update(dt, this.time, this.still, visW, visH, fit, this._none);
    this.scene.updateMatrixWorld(true);

    const hasRay = this.pointer !== null;
    let cursor: THREE.Vector3 | null = null;
    if (this.pointer) {
      this._ndc.set(this.pointer.x, this.pointer.y);
      this.raycaster.setFromCamera(this._ndc, this.camera);
      cursor = this.raycaster.ray.intersectPlane(this._plane, this._cursor);
    }
    const ray = this.raycaster.ray;
    const cam = this.camera.position;
    const s = this.glove.state;
    const reach = 1.5 * s.scale * fit;
    this.signals.fill(0);
    const counts = [0, 0, 0, 0, 0];
    const meet = this.flowNow;
    BASE.copy(FABRIC).lerp(BARE, Math.min(1, s.explode * 1.5));

    for (const pad of this.glove.pads) {
      const world = pad.mesh.matrixWorld;
      this._nm.getNormalMatrix(world);
      const pulse =
        s.grip > 0.01 && pad.tip
          ? s.grip * Math.pow(0.5 + 0.5 * Math.sin(this.time * 2.1 + pad.phase), 3)
          : 0;
      // The index fingertip glows where it meets the data stream.
      const touch =
        meet > 0.01 && pad.channel === 1 ? meet * (0.45 + 0.2 * Math.sin(this.time * 2.4)) : 0;
      for (let i = 0; i < pad.pos.length; i++) {
        this._p.copy(pad.pos[i]!).applyMatrix4(world);
        this._n.copy(pad.nrm[i]!).applyMatrix3(this._nm).normalize();
        const facing = this._n.dot(this._v.copy(cam).sub(this._p).normalize());

        let v = pulse + touch;
        if (s.sweep > 0.01) {
          const wave = Math.sin(this.time * 1.4 - this._p.y * 0.42 + this._p.x * 0.18);
          v += s.sweep * 0.6 * Math.pow(0.5 + 0.5 * wave, 6);
        }
        if (hasRay && facing > 0.05) {
          const d = ray.distanceToPoint(this._p) / reach;
          v += Math.exp(-d * d);
        }
        v = Math.min(v, 1);

        if (v < 0.6) this._c.copy(BASE).lerp(WARM, v / 0.6);
        else this._c.copy(WARM).lerp(HOT, (v - 0.6) / 0.4);
        pad.mesh.setColorAt(i, this._c);

        if (pad.channel >= 0) {
          this.signals[pad.channel]! += v;
          counts[pad.channel]!++;
        }
      }
      if (pad.mesh.instanceColor) pad.mesh.instanceColor.needsUpdate = true;
    }
    for (let i = 0; i < 5; i++) if (counts[i]) this.signals[i]! /= counts[i]!;
    if (this.glove.pads.length === 0) {
      // The scanned hand has no modelled pads: drive the trace from the grip pulse directly.
      for (let i = 0; i < 5; i++) {
        this.signals[i] = s.grip * Math.pow(0.5 + 0.5 * Math.sin(this.time * 2.1 + i * 1.37), 3);
      }
    }

    this.glove.indexTip.getWorldPosition(this._a);
    this.glove.palmAnchor.getWorldPosition(this._p);
    this.project(this._p, this.anchors.glove);
    if (this.robot && this.stream) {
      this.robot.indexTip.getWorldPosition(this._b);
      this.robot.palmAnchor.getWorldPosition(this._p);
      this.project(this._p, this.anchors.robot);
      this.project(this._p.copy(this._a).lerp(this._b, 0.5), this.anchors.contact);
      const px =
        (this.height / visH) * this.renderer.getPixelRatio() * 0.055 * Math.max(fit, 0.6);
      this.stream.update(dt, this.time, this.glove, this.robot, this._a, this._b, this.flowNow, cursor, px, s.scale * fit);
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.res.dispose();
    this.renderer.dispose();
  }
}
