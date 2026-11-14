import * as THREE from "three";

/**
 * Line sketch, in 3D, of the capture kit as worn: a head camera, a tactile
 * glove on each hand and a camera under each wrist.
 * Drawn like a technical sketch: flat paper-coloured surfaces with ink
 * outlines, and tinted fans for what each camera sees. Schematic, not to scale.
 */

const PAPER = "#fbfbf9";
const INK = "#1b1b1b";
const BLUE = "#3b6fd9";
const GREEN = "#2d7d58";

/** Back faces pushed out along the normal: an even ink outline around each part. */
const OUTLINE_VS = /* glsl */ `
  uniform float uWidth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    mv.xyz += n * uWidth * (-mv.z) * 0.012;
    gl_Position = projectionMatrix * mv;
  }
`;
const OUTLINE_FS = /* glsl */ `
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }
`;

export type KitAnchor = { id: string; x: number; y: number };

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export class KitRig {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(26, 1, 0.5, 200);
  /** Rotation the visitor dragged to, around the vertical axis. */
  yaw = 0;
  still = false;
  /** Screen positions (0 … 1 of the canvas) of the numbered parts. */
  readonly anchors: KitAnchor[] = [];

  private readonly root = new THREE.Group();
  private readonly marks: { id: string; obj: THREE.Object3D }[] = [];
  private readonly disposables: { dispose(): void }[] = [];
  private readonly fill: THREE.MeshBasicMaterial;
  private readonly tone: THREE.MeshBasicMaterial;
  private readonly dark: THREE.MeshBasicMaterial;
  private readonly outline: THREE.ShaderMaterial;
  private readonly clock = new THREE.Clock();
  private yawNow = 0;
  private time = 0;
  private frame = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);

    const basic = (color: string) => {
      const m = new THREE.MeshBasicMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      this.disposables.push(m);
      return m;
    };
    this.fill = basic(PAPER);
    this.tone = basic("#e4e4df");
    this.dark = basic(INK);
    this.outline = new THREE.ShaderMaterial({
      vertexShader: OUTLINE_VS,
      fragmentShader: OUTLINE_FS,
      uniforms: { uWidth: { value: 1 }, uColor: { value: new THREE.Color(INK) } },
      side: THREE.BackSide,
    });
    this.disposables.push(this.outline);

    this.camera.position.set(8.4, 8.6, 18.6);
    this.camera.lookAt(0, 0.7, 2.2);
    this.build();
    this.scene.add(this.root);
  }

  /** A sketched part: flat fill plus ink outline. */
  private part(geo: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = this.root) {
    this.disposables.push(geo);
    const mesh = new THREE.Mesh(geo, material);
    mesh.add(new THREE.Mesh(geo, this.outline));
    parent.add(mesh);
    return mesh;
  }

  /** A limb between two points. */
  private limb(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, material: THREE.Material) {
    const len = a.distanceTo(b);
    const geo = new THREE.CylinderGeometry(r1, r0, len, 28, 1);
    const mesh = this.part(geo, material);
    mesh.position.copy(a).lerp(b, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    const cap0 = this.part(new THREE.SphereGeometry(r0, 24, 16), material);
    cap0.position.copy(a);
    const cap1 = this.part(new THREE.SphereGeometry(r1, 24, 16), material);
    cap1.position.copy(b);
    return mesh;
  }

  /** What a camera sees: a tinted fan with a coloured edge. */
  private fan(color: string, radius: number, angle: number, opacity: number) {
    const group = new THREE.Group();
    const geo = new THREE.CircleGeometry(radius, 48, Math.PI / 2 - angle / 2, angle);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
    for (let i = 0; i <= 48; i++) {
      const t = Math.PI / 2 - angle / 2 + (angle * i) / 48;
      pts.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0));
    }
    pts.push(new THREE.Vector3(0, 0, 0));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 });
    this.disposables.push(geo, mat, lineGeo, lineMat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 2;
    group.add(mesh, new THREE.Line(lineGeo, lineMat));
    return group;
  }

  private mark(id: string, parent: THREE.Object3D, x: number, y: number, z: number) {
    const obj = new THREE.Object3D();
    obj.position.set(x, y, z);
    parent.add(obj);
    this.marks.push({ id, obj });
    this.anchors.push({ id, x: 0, y: 0 });
  }

  private build() {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

    /* Mannequin: bust, neck and head */
    const torso = this.part(new THREE.CylinderGeometry(1.75, 1.35, 3.6, 40, 1), this.fill);
    torso.scale.z = 0.62;
    torso.position.y = -0.5;
    const chest = this.part(new THREE.SphereGeometry(1.75, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), this.fill);
    chest.scale.set(1, 0.42, 0.62);
    chest.position.y = 1.3;
    const neck = this.part(new THREE.CylinderGeometry(0.46, 0.56, 0.9, 24), this.fill);
    neck.position.y = 2.1;
    const head = this.part(new THREE.SphereGeometry(1, 40, 28), this.fill);
    head.scale.set(0.92, 1.18, 1.04);
    head.position.set(0, 3.45, 0.12);

    /* Head camera: strap around the head, housing with two lenses and a depth module */
    const strap = this.part(new THREE.TorusGeometry(0.97, 0.07, 10, 64), this.fill);
    strap.rotation.x = Math.PI / 2 + 0.12;
    strap.scale.set(0.96, 1.08, 1);
    strap.position.set(0, 3.86, 0.12);
    const cam = new THREE.Group();
    cam.position.set(0, 3.82, 1.1);
    cam.rotation.x = 0.16;
    this.root.add(cam);
    this.part(new THREE.BoxGeometry(1.3, 0.32, 0.3), this.fill, cam);
    for (const x of [-0.44, 0.44]) {
      const lens = this.part(new THREE.CylinderGeometry(0.085, 0.085, 0.08, 20), this.dark, cam);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 0, 0.17);
    }
    const depth = this.part(new THREE.BoxGeometry(0.26, 0.13, 0.06), this.dark, cam);
    depth.position.set(0, 0, 0.17);
    const headFan = this.fan(BLUE, 6.6, 1.7, 0.1);
    headFan.rotation.x = Math.PI / 2 + 0.62; // lies forward and tilts down to the hands
    headFan.position.set(0, 0, 0.15);
    cam.add(headFan);
    this.mark("head", cam, 1.2, 0.6, 0.2);

    /* Arms reaching forward, a glove on each hand, a camera under each wrist */
    for (const side of [-1, 1]) {
      const shoulder = V(side * 2.05, 1.05, 0);
      const elbow = V(side * 2.5, -1.25, 0.9);
      const wrist = V(side * 1.75, -1.0, 3.7);
      this.limb(shoulder, elbow, 0.62, 0.5, this.fill);
      this.limb(elbow, wrist, 0.5, 0.36, this.fill);

      const hand = new THREE.Group();
      hand.position.copy(wrist);
      hand.rotation.set(0.12, -side * 0.28, 0);
      this.root.add(hand);

      // Glove: cuff, palm, fingers and thumb, toned to read as fabric
      const cuff = this.part(new THREE.CylinderGeometry(0.42, 0.46, 0.5, 24), this.tone, hand);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.z = -0.05;
      const palm = this.part(new THREE.SphereGeometry(1, 28, 18), this.tone, hand);
      palm.scale.set(0.56, 0.24, 0.62);
      palm.position.z = 0.72;
      for (let f = 0; f < 4; f++) {
        const x = (f - 1.5) * 0.25;
        const len = [0.62, 0.74, 0.7, 0.54][side === 1 ? f : 3 - f]!;
        const finger = this.part(new THREE.CapsuleGeometry(0.115, len, 6, 14), this.tone, hand);
        finger.rotation.x = Math.PI / 2 + 0.18;
        finger.position.set(x, -0.08, 1.3 + len / 2);
      }
      const thumb = this.part(new THREE.CapsuleGeometry(0.125, 0.5, 6, 14), this.tone, hand);
      thumb.rotation.set(Math.PI / 2, 0, side * 0.75);
      thumb.position.set(-side * 0.62, -0.04, 0.9);
      this.mark("gloves", hand, side * 1.05, 0.55, 1.5);

      // Wrist camera, looking forward under the hand
      const wcam = new THREE.Group();
      wcam.position.set(0, -0.5, -0.1);
      hand.add(wcam);
      this.part(new THREE.BoxGeometry(0.62, 0.34, 0.56), this.fill, wcam);
      const lens = this.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 18), this.dark, wcam);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, -0.02, 0.3);
      const fan = this.fan(GREEN, 2.5, 1.2, 0.14);
      fan.rotation.x = Math.PI / 2 + 0.1;
      fan.position.set(0, -0.02, 0.3);
      wcam.add(fan);
      this.mark("wrist", wcam, side * 0.85, -0.6, -0.3);
    }
  }

  resize(width: number, height: number) {
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    this.camera.aspect = aspect;
    // Pull back on narrow canvases so both hands stay in frame.
    const pull = aspect < 1.5 ? 1.5 / aspect : 1;
    this.camera.position.set(8.4 * pull, 8.6 * pull, 18.6 * pull);
    this.camera.lookAt(0, 0.7, 2.2);
    this.camera.updateProjectionMatrix();
    // A hairline: about 0.75 CSS px on screen, whatever the canvas size.
    this.outline.uniforms.uWidth!.value = 29 / height;
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

  private readonly _v = new THREE.Vector3();

  render(dt: number) {
    if (!this.still) this.time += dt;
    this.yawNow = damp(this.yawNow, this.yaw, dt === 0 ? 1e6 : 8, dt || 1);
    const sway = this.still ? 0 : Math.sin(this.time * 0.5) * 0.1;
    this.root.rotation.y = this.yawNow + sway - 0.12;
    this.scene.updateMatrixWorld(true);
    this.marks.forEach((m, i) => {
      m.obj.getWorldPosition(this._v).project(this.camera);
      this.anchors[i]!.x = this._v.x * 0.5 + 0.5;
      this.anchors[i]!.y = 0.5 - this._v.y * 0.5;
    });
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
