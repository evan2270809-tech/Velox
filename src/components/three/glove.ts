import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

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
const BASE = new THREE.Color("#4b5058");
const WARM = new THREE.Color("#ff9500");
const HOT = new THREE.Color("#ffe2ad");

type Style = "glove" | "robot";

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
    else this.buildRobot();
  }

  private std(color: string, roughness: number, metalness = 0) {
    return this.res.track(new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  }

  private palmGeometry() {
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
        depth: 0.9,
        bevelEnabled: true,
        bevelThickness: 0.7,
        bevelSize: 0.7,
        bevelSegments: 10,
        curveSegments: 20,
      }),
    );
    geo.translate(0, 0, -0.45);
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
    // Knit fabric: matte, with a soft sheen at grazing angles.
    const shell = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#15161a",
        roughness: 0.92,
        metalness: 0,
        sheen: 1,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color("#6f7682"),
      }),
    );
    const seam = this.std("#24262b", 0.85);
    const trim = this.std("#2b2d33", 0.45, 0.2);
    const flex = this.std("#c9953c", 0.45, 0.35);
    const metal = this.std("#aeb4bb", 0.3, 0.85);
    const taxel = this.std("#ffffff", 0.5, 0.05);
    const palmFront = 0.45 + 0.7;

    this.body.add(new THREE.Mesh(this.palmGeometry(), shell));
    this.palmAnchor.position.set(0, 0.5, palmFront);
    this.body.add(this.palmAnchor);

    /* Palm pad: a grid with the crease left open */
    {
      const pos: THREE.Vector3[] = [];
      const nrm: THREE.Vector3[] = [];
      const pitch = 0.6;
      for (let ix = -7; ix <= 7; ix++) {
        for (let iy = -7; iy <= 7; iy++) {
          const x = ix * pitch - 0.2;
          const y = iy * pitch + 0.1;
          const half = 3.1 + ((y + 4.7) / 9.4) * 0.75;
          if (Math.abs(x) > half || Math.abs(y) > 3.95) continue;
          if (Math.abs(x) > half - 0.7 && Math.abs(y) > 3.2) continue;
          if (Math.abs(y + x * 0.75 + 0.9) < 0.42) continue;
          if (((x - 2.3) / 2.3) ** 2 + ((y + 2.4) / 3.0) ** 2 < 1) continue;
          pos.push(new THREE.Vector3(x, y, palmFront + 0.02));
          nrm.push(new THREE.Vector3(0, 0, 1));
        }
      }
      this.addPad(this.body, pos, nrm, 0.44, taxel, -1, 0, false);
    }

    /* Soft masses at the base of the thumb and along the pinky edge */
    {
      const ball = g(new THREE.SphereGeometry(1, 40, 28));
      const thenar = new THREE.Mesh(ball, shell);
      thenar.position.set(2.25, -2.35, 0.35);
      thenar.rotation.z = -0.45;
      thenar.scale.set(1.75, 2.75, 1.3);
      const edge = new THREE.Mesh(ball, shell);
      edge.position.set(-2.75, -1.6, 0.1);
      edge.rotation.z = 0.08;
      edge.scale.set(1.25, 3.0, 0.98);
      const knuckles = new THREE.Mesh(ball, shell);
      knuckles.position.set(0.1, 3.9, -0.25);
      knuckles.scale.set(4.1, 1.15, 1.05);
      this.body.add(thenar, edge, knuckles);
    }

    /* Hub on the back of the hand */
    {
      const hub = new THREE.Mesh(g(new THREE.BoxGeometry(3.2, 2.7, 0.42)), trim);
      hub.position.set(0, -0.4, -(palmFront + 0.16));
      this.body.add(hub);
      this.back.push({ obj: hub, z: hub.position.z, hidden: false });
      const led = new THREE.Mesh(
        g(new THREE.SphereGeometry(0.1, 12, 8)),
        this.res.track(new THREE.MeshBasicMaterial({ color: "#ff9500" })),
      );
      led.position.set(1.2, -1.4, -(palmFront + 0.38));
      this.body.add(led);
      this.back.push({ obj: led, z: led.position.z, hidden: false });
    }

    const mats = { shell, seam, flex, metal, taxel };
    FINGERS.forEach((f, fi) => {
      const base = new THREE.Group();
      base.position.set(f.x, f.y, 0);
      base.rotation.z = f.splay;
      this.body.add(base);
      this.gloveChain(base, f.len, f.r, fi + 1, f.bias, [0.85, 1.05, 0.7], mats);
    });
    this.gloveChain(this.thumbBase(), THUMB.len, THUMB.r, 0, 0, [0.12, 0.55, 0.6], mats);

    /* Forearm, cuff with strap and readout module */
    {
      const arm = new THREE.Mesh(g(new THREE.CylinderGeometry(3.05, 3.5, 34, 48, 1, true)), shell);
      arm.scale.z = 0.66;
      arm.position.y = -20.2;
      const cuff = new THREE.Mesh(g(new THREE.CylinderGeometry(3.2, 3.26, 2.6, 48, 1, false)), seam);
      cuff.scale.z = 0.68;
      cuff.position.y = -8.3;
      const strap = new THREE.Mesh(g(new THREE.CylinderGeometry(3.3, 3.3, 0.9, 48, 1, true)), trim);
      strap.scale.z = 0.685;
      strap.position.y = -8.3;
      const board = new THREE.Mesh(g(new THREE.BoxGeometry(2.7, 1.9, 0.6)), trim);
      board.position.set(0, -8.3, -2.36);
      const port = new THREE.Mesh(g(new THREE.BoxGeometry(0.9, 0.34, 0.3)), metal);
      port.position.set(0, -9.25, -2.4);
      const lead = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -9.3, -2.45),
        new THREE.Vector3(0.2, -12, -2.7),
        new THREE.Vector3(-0.3, -20, -3.1),
        new THREE.Vector3(0, -38, -3.2),
      ]);
      const cable = new THREE.Mesh(g(new THREE.TubeGeometry(lead, 40, 0.2, 10)), seam);
      this.body.add(arm, cuff, strap, board, port, cable);
    }
  }

  private gloveChain(
    base: THREE.Group,
    len: number[],
    rad: number[],
    channel: number,
    bias: number,
    weights: number[],
    m: Record<"shell" | "seam" | "flex" | "metal" | "taxel", THREE.Material>,
  ) {
    const g = <T extends THREE.BufferGeometry>(geo: T) => this.res.track(geo);
    let parent = base;
    const last = len.length - 1;

    len.forEach((l, i) => {
      const r = rad[i]!;
      const joint = new THREE.Group();
      if (i > 0) joint.position.y = len[i - 1]!;
      parent.add(joint);
      this.joints.push({ group: joint, weight: weights[i]!, bias, finger: channel });

      const seg = new THREE.Mesh(g(new THREE.CapsuleGeometry(r, l, 8, 28)), m.shell);
      seg.position.y = l / 2;
      seg.scale.z = FLAT;
      joint.add(seg);

      if (i > 0) {
        // Stitched seam at the knuckle
        const ring = new THREE.Mesh(g(new THREE.TorusGeometry(r + 0.01, 0.04, 8, 40)), m.seam);
        ring.rotation.x = Math.PI / 2;
        ring.scale.y = FLAT;
        joint.add(ring);
      }

      const inner = !(channel === 0 && i === 0);
      // Inside the glove: flex tail and motion sensor along the back
      const backZ = -(r * FLAT + 0.02);
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

      // Tactile pad on the palm side
      const tip = i === last;
      const cols = r > 0.8 ? 4 : 3;
      const y0 = tip ? 0.42 : 0.55;
      const y1 = tip ? l + r * 0.62 : l - 0.4;
      const rows = Math.max(2, Math.floor((y1 - y0) / PITCH) + 1);
      const pos: THREE.Vector3[] = [];
      const nrm: THREE.Vector3[] = [];
      for (let row = 0; row < rows; row++) {
        const y = y0 + row * PITCH;
        const over = Math.max(y - l, 0);
        const rr = Math.sqrt(Math.max(r * r - over * over, 0.01));
        const n = over > r * 0.35 ? cols - 1 : cols;
        for (let c = 0; c < n; c++) {
          const a = ((c - (n - 1) / 2) * PITCH) / r;
          const nx = Math.sin(a);
          const nz = Math.cos(a);
          pos.push(new THREE.Vector3(nx * (rr + 0.02), y, nz * (rr + 0.02) * FLAT));
          nrm.push(new THREE.Vector3(nx, over / r, nz).normalize());
        }
      }
      if (inner) this.addPad(joint, pos, nrm, 0.34, m.taxel, tip ? channel : -1, channel * 1.37, tip);

      if (tip && channel === 1) {
        this.indexTip.position.set(0, l + r * 0.75, r * 0.25);
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
      mesh.setColorAt(i, BASE);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    parent.add(mesh);
    this.front.push(mesh);
    this.pads.push({ mesh, pos, nrm, channel, phase, tip });
  }

  /* ---------------------------------------------------------------------- */
  /* Robot hand                                                              */
  /* ---------------------------------------------------------------------- */

  private buildRobot() {
    const g = <T extends THREE.BufferGeometry>(geo: T) => this.res.track(geo);
    const shell = this.res.track(
      new THREE.MeshPhysicalMaterial({
        color: "#eceef1",
        roughness: 0.3,
        metalness: 0.05,
        clearcoat: 0.7,
        clearcoatRoughness: 0.25,
      }),
    );
    const dark = this.std("#1b1c20", 0.42, 0.65);
    const steel = this.std("#8d939b", 0.3, 0.9);

    const palm = new THREE.Mesh(this.palmGeometry(), shell);
    palm.scale.set(0.96, 0.94, 0.9);
    this.body.add(palm);
    const plate = new THREE.Mesh(g(new THREE.BoxGeometry(5.2, 5.6, 0.3)), dark);
    plate.position.set(-0.3, 0.2, 1.02);
    this.body.add(plate);
    this.palmAnchor.position.set(0, 0.5, 1.2);
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
      len.forEach((l, i) => {
        const r = rad[i]! * 0.94;
        const joint = new THREE.Group();
        if (i > 0) joint.position.y = len[i - 1]!;
        parent.add(joint);
        this.joints.push({ group: joint, weight: weights[i]!, bias, finger });

        const hinge = new THREE.Mesh(g(new THREE.CylinderGeometry(r * 0.8, r * 0.8, r * 2.05, 28)), dark);
        hinge.rotation.z = Math.PI / 2;
        joint.add(hinge);
        const pin = new THREE.Mesh(g(new THREE.CylinderGeometry(r * 0.3, r * 0.3, r * 2.2, 16)), steel);
        pin.rotation.z = Math.PI / 2;
        joint.add(pin);
        const link = new THREE.Mesh(g(new THREE.CylinderGeometry(r * 0.5, r * 0.5, l, 16)), dark);
        link.position.y = l / 2;
        joint.add(link);

        const tip = i === len.length - 1;
        const coverLen = tip ? l * 0.72 : l * 0.5;
        const cover = new THREE.Mesh(g(new THREE.CapsuleGeometry(r, coverLen, 8, 28)), shell);
        cover.position.y = tip ? l * 0.62 : l * 0.52;
        cover.scale.z = FLAT;
        joint.add(cover);
        if (tip) {
          const pad = new THREE.Mesh(g(new THREE.CapsuleGeometry(r * 0.62, coverLen * 0.7, 6, 20)), dark);
          pad.position.set(0, l * 0.66, r * 0.42);
          pad.scale.z = 0.6;
          joint.add(pad);
          if (finger === 1) {
            this.indexTip.position.set(0, l + r * 0.7, r * 0.25);
            joint.add(this.indexTip);
          }
        }
        parent = joint;
      });
    };

    FINGERS.forEach((f, fi) => {
      const base = new THREE.Group();
      base.position.set(f.x, f.y + 0.15, 0);
      base.rotation.z = f.splay;
      this.body.add(base);
      chain(base, f.len, f.r, fi + 1, f.bias, [0.85, 1.05, 0.7]);
    });
    chain(this.thumbBase(), THUMB.len, THUMB.r, 0, 0, [0.12, 0.55, 0.6]);

    /* Wrist joint and forearm */
    const wrist = new THREE.Mesh(g(new THREE.SphereGeometry(2.1, 32, 20)), dark);
    wrist.scale.z = 0.7;
    wrist.position.y = -5.4;
    const neck = new THREE.Mesh(g(new THREE.CylinderGeometry(1.5, 1.7, 3, 32)), steel);
    neck.scale.z = 0.7;
    neck.position.y = -7.2;
    const arm = new THREE.Mesh(g(new THREE.CylinderGeometry(2.9, 3.3, 34, 48)), shell);
    arm.scale.z = 0.72;
    arm.position.y = -25.2;
    const band = new THREE.Mesh(g(new THREE.CylinderGeometry(2.96, 2.98, 0.5, 48)), dark);
    band.scale.z = 0.72;
    band.position.y = -9.6;
    this.body.add(wrist, neck, arm, band);
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

class Stream {
  readonly points: THREE.Points;
  private readonly n: number;
  private readonly seed: Float32Array; // t, speed, angle, radius
  private readonly push: Float32Array; // displacement xy + velocity xy
  private readonly pos: Float32Array;
  private readonly alpha: Float32Array;
  private readonly material: THREE.ShaderMaterial;

  constructor(res: Resources, n: number) {
    this.n = n;
    this.seed = new Float32Array(n * 4);
    this.push = new Float32Array(n * 4);
    this.pos = new Float32Array(n * 3);
    this.alpha = new Float32Array(n);
    const size = new Float32Array(n);
    const color = new Float32Array(n * 3);
    const ink = new THREE.Color("#111111");
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      this.seed[i * 4] = Math.random();
      this.seed[i * 4 + 1] = 0.05 + Math.random() * 0.1;
      this.seed[i * 4 + 2] = Math.random() * Math.PI * 2;
      this.seed[i * 4 + 3] = Math.pow(Math.random(), 1.6);
      size[i] = 1.4 + Math.random() * 2.6;
      c.copy(WARM).lerp(ink, Math.random() < 0.3 ? 0.9 : Math.random() * 0.15);
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
        depthTest: false,
      }),
    );
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
  }

  private readonly _a = new THREE.Vector3();
  private readonly _b = new THREE.Vector3();

  /**
   * a → b is the path of the data. `cursor` (world xy on the z = 0 plane) stirs
   * the particles like a liquid; they spring back to the stream afterwards.
   */
  update(
    dt: number,
    time: number,
    a: THREE.Vector3,
    b: THREE.Vector3,
    flow: number,
    cursor: THREE.Vector3 | null,
    px: number,
    unit: number,
  ) {
    this.points.visible = flow > 0.01;
    if (!this.points.visible) return;
    this.material.uniforms.uPx!.value = px;
    const step = dt || 0.016;
    const span = this._b.copy(b).sub(a).length();
    const reach = unit * 3.2;

    for (let i = 0; i < this.n; i++) {
      const s = i * 4;
      let t = this.seed[s]! + this.seed[s + 1]! * step;
      if (t > 1) t -= 1;
      this.seed[s] = t;

      // Thin at both fingertips, a soft cloud in between and beyond.
      const u = t * 1.8 - 0.4; // overshoots both ends
      const env = Math.sin(Math.PI * THREE.MathUtils.clamp(u, 0, 1));
      const spread =
        (0.1 + env * 1.7) * unit * (0.3 + this.seed[s + 3]! * 1.5) + span * 0.05 * this.seed[s + 3]!;
      const ang = this.seed[s + 2]! + time * 0.35 * (i % 2 ? 1 : -1);
      this._a.copy(a).lerp(b, u);
      let x = this._a.x + Math.cos(ang) * spread;
      let y =
        this._a.y +
        Math.sin(ang) * spread * 0.8 +
        Math.sin(u * 6.0 + time * 1.3 + this.seed[s + 2]!) * unit * 0.18;
      const z = this._a.z + Math.sin(ang * 1.7) * spread * 0.5;

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
        vx += (rx * inv * 0.9 - ry * inv * 0.7) * f * unit * 60 * step;
        vy += (ry * inv * 0.9 + rx * inv * 0.7) * f * unit * 60 * step;
      }
      vx -= dx * 6 * step;
      vy -= dy * 6 * step;
      const drag = Math.pow(0.06, step);
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
      const edge = Math.min(1, t * 8, (1 - t) * 8);
      this.alpha[i] = flow * edge * (0.3 + 0.55 * env);
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

  constructor(canvas: HTMLCanvasElement, opts: { robot?: boolean; mirrored?: boolean } = {}) {
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

    this.glove = new Hand(this.res, "glove", opts.mirrored ?? false);
    this.scene.add(this.glove.root);
    if (opts.robot) {
      this.robot = new Hand(this.res, "robot", false);
      this.robotTarget = this.robot.target;
      this.scene.add(this.robot.root);
      this.stream = new Stream(this.res, 2200);
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

    for (const pad of this.glove.pads) {
      const world = pad.mesh.matrixWorld;
      this._nm.getNormalMatrix(world);
      const pulse =
        s.grip > 0.01 && pad.tip
          ? s.grip * Math.pow(0.5 + 0.5 * Math.sin(this.time * 2.1 + pad.phase), 3)
          : 0;
      // The index fingertip glows where it meets the data stream.
      const touch =
        meet > 0.01 && pad.channel === 1 ? meet * (0.6 + 0.3 * Math.sin(this.time * 2.4)) : 0;
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
      this.stream.update(dt, this.time, this._a, this._b, this.flowNow, cursor, px, s.scale * fit);
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.res.dispose();
    this.renderer.dispose();
  }
}
