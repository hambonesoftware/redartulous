import * as THREE from "three";
import type { GameState, ThrowResult } from "../../shared/types/game";
import type {
  ApiError,
  NewGameResponse,
  ThrowResponse,
  StateResponse,
  LeaderboardResponse,
} from "../../shared/types/api";
import { makeDartboardTexture } from "./boardTexture";
import { formatLastHit } from "./scoringViz";
import { makeCarnivalLayerTexture } from "./carnivalTextures";

/**
 * Main gameplay class. Handles all client-side rendering and interaction.
 * Communicates with the server via /api endpoints. Designed for a flat
 * orthographic board so that the game remains legible inside a Reddit post.
 */
export class DartGame {
  // DOM hooks
  private container: HTMLElement;
  private hud: {
    scoreEl: HTMLElement;
    dartsEl: HTMLElement;
    dartsPipsEl: HTMLElement;
    lastEl: HTMLElement;
    btnNewEl: HTMLButtonElement;
    btnLbEl: HTMLButtonElement;
    toastEl: HTMLElement;
    cooldownEl: HTMLElement;
  };
  private lbPanel: HTMLElement;
  private summaryPanel: HTMLElement;

  // Three.js renderer, scene and camera
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private boardMesh: THREE.Mesh;
  private aimRing: THREE.Mesh;
  private aimCross: THREE.Line;
  private probRing: THREE.Mesh;
  private dartMesh: THREE.Object3D | null = null;
  private dartAnimating = false;

  // --- Begin custom dart properties ---
  /**
   * Procedurally generated flight textures. These are created at runtime
   * rather than being loaded from image files. Each is a triangular “kite”
   * shape drawn on a canvas with a simple gradient or stripe pattern. They
   * are assigned to the flight material before each throw and regenerated
   * when alternating between red and blue themes.
   */
  private flightTextureRed!: THREE.CanvasTexture;
  private flightTextureBlue!: THREE.CanvasTexture;

  /** Accent material applied to the coloured band of the dart. We update its
   * colour before each throw to swap between the red and blue variants.
   */
  private dartAccentMaterial: THREE.MeshStandardMaterial | null = null;

  /** Material applied to the flight planes. We update its texture map before
   * each throw to change colours without recreating geometry.
   */
  private dartFlightMaterial: THREE.MeshStandardMaterial | null = null;

  /**
   * Reference to the group containing the dart body, tip, shaft and flights.
   * Stored so that we can apply spin to the group while the holder positions
   * and rotates the entire dart toward the target point. See animateDartTo().
   */
  private dartGroup: THREE.Group | null = null;

  /**
   * Background textures used for parallax animation. Two layers drift at
   * different speeds to create depth. The textures are created from the
   * same canvas as the original background pattern. These properties
   * are initialised in the constructor.
   */
  private bgTex1: THREE.Texture | null = null;
  private bgTex2: THREE.Texture | null = null;
  private bgMesh1: THREE.Mesh | null = null;
  private bgMesh2: THREE.Mesh | null = null;
  private bgSeed = 1337;

  /**
   * Angular velocity in radians per second for the current throw. Set in
   * prepareDartForThrow() and used during the animation step in
   * animateDartTo() to spin the dart about its local z-axis.
   */
  private currentSpinVel = 0;

  /**
   * Flag used to alternate dart colours between throws. Starts with red and
   * flips on each prepareDartForThrow() call.
   */
  private nextIsRed = true;
  /** Store previous darts left to detect decrements and animate pips. */
  private lastDartsLeft: number | null = null;
  /** Store previous last hit label to trigger slide animation on change. */
  private lastLastLabel: string | null = null;

  /**
   * Active sparkle systems. Each entry represents a burst of particles
   * spawned when the player hits a double bull. Sparkles are lightweight
   * point sprites that drift outward and upward before fading. Systems
   * self‑remove after their lifespan expires. See spawnSparkles() and
   * updateSparkles() for implementation details.
   */
  private sparkleSystems: {
    mesh: THREE.Points;
    velocities: Float32Array;
    life: number;
    startTime: number;
    material: THREE.PointsMaterial;
  }[] = [];

  /** Timestamp of the last frame (ms). Used to compute delta time for
   * updating sparkle particle positions. This is initialised in the
   * animation loop on the first frame.
   */
  private lastSparkleFrameTime: number | null = null;
  // --- End custom dart properties ---

  // When a throw is in-flight (waiting for server / animating), we lock the
  // on-screen probability circle to the exact aim+radius used for that throw.
  private pendingShot: { aimX: number; aimY: number; radius: number } | null = null;

  // Game state from server
  private state: GameState | null = null;
  private gameStartClientMs = 0;

  // Aim and probability circle parameters
  private aim = { x: 0, y: 0 };

  /**
   * Highlight mesh showing the wedge currently aimed at. This semi‑transparent
   * overlay sits slightly above the board and rotates to align with the
   * currently targeted 1/20th segment. It is created once at construction
   * time and reused on every frame. See loop() for rotation updates.
   */
  private wedgeHighlight: THREE.Mesh | null = null;

  // Stardew-style large aiming/probability circle (normalized to board radius ~= 1.0)
  private probRadiusBase = 0.48;

  // Hold-to-throw aiming state.
  private holding = false;
  private holdStartMs = 0;
  private holdAimX = 0;
  private holdAimY = 0;

  // Capture the radius at the moment the player begins holding.
  private holdStartRadius = this.probRadiusBase;

  // Current probability radius (normalized units, board outer radius ~= 1.0).
  private probRadiusCurrent = this.probRadiusBase;

  // Tuning for the hold-to-shrink mechanic.
  private probRadiusMin = 0.03;
  private holdShrinkDurationMs = 1500;

  private cooldownUntil = 0;
  private rafId = 0;

  constructor(container: HTMLElement, hud: any, lbPanel: HTMLElement, summaryPanel: HTMLElement) {
    this.container = container;
    this.hud = hud;
    this.lbPanel = lbPanel;
    this.summaryPanel = summaryPanel;

    this.scene = new THREE.Scene();

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const aspect = w / h;
    const viewSize = 2.2;

    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect,
      viewSize * aspect,
      viewSize,
      -viewSize,
      0.01,
      10
    );
    this.camera.position.set(0, 0, 2);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Procedurally generate flight textures instead of loading images. These
    // textures are drawn at runtime using a canvas. The colours can be
    // customised by adjusting the arguments to makeFlightTexture().
    this.flightTextureRed = this.makeFlightTexture("#d32f2f", "#f57c00");
    this.flightTextureBlue = this.makeFlightTexture("#1976d2", "#64b5f6");

    // Create carnival parallax background. Two layers drift at different speeds.
    this.setBackgroundTextures(this.bgSeed);

    // Lighting: warm key light from above, a rim light to pick out edges and
    // a gentle ambient fill. Using MeshStandardMaterial on the darts and
    // background makes them respond to these lights.
    const keyLight = new THREE.DirectionalLight(0xfff2e0, 0.9);
    keyLight.position.set(-1, 2, 2);
    this.scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(1, -1, 2);
    this.scene.add(rimLight);
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Board
    const tex = makeDartboardTexture(1024);
    const boardMat = new THREE.MeshBasicMaterial({ map: tex });
    const boardGeo = new THREE.PlaneGeometry(2, 2);
    this.boardMesh = new THREE.Mesh(boardGeo, boardMat);
    this.boardMesh.position.set(0, 0, 0);
    this.scene.add(this.boardMesh);

    // Wedge highlight overlay. Build a single wedge shape covering one
    // twentieth of the board (18°). The shape starts at the same angular
    // offset as the dartboard's wedge 0 (centred on the 20 at the top) and
    // extends to the full board radius. It will be rotated each frame to
    // align with the current aimed wedge. The geometry uses a transparent
    // MeshBasicMaterial so it glows softly over the board without
    // interfering with lighting.
    {
      const wedge = (Math.PI * 2) / 20;
      const start = -Math.PI / 2 - wedge / 2;
      const outer = 1.0;
      const shape = new THREE.Shape();
      shape.moveTo(Math.cos(start) * outer, Math.sin(start) * outer);
      shape.absarc(0, 0, outer, start, start + wedge, false);
      shape.lineTo(0, 0);
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      this.wedgeHighlight = new THREE.Mesh(geo, mat);
      this.wedgeHighlight.position.set(0, 0, 0.02);
      this.scene.add(this.wedgeHighlight);
    }

    // Aim ring
    this.aimRing = new THREE.Mesh(
      new THREE.RingGeometry(0.02, 0.03, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    this.aimRing.position.set(0, 0, 0.01);
    this.scene.add(this.aimRing);

    // Aim crosshair
    const crossPts = new Float32Array([
      -0.05, 0, 0.012, 0.05, 0, 0.012,
      0, -0.05, 0.012, 0, 0.05, 0.012,
    ]);
    const crossGeo = new THREE.BufferGeometry();
    crossGeo.setAttribute("position", new THREE.BufferAttribute(crossPts, 3));
    this.aimCross = new THREE.LineSegments(
      crossGeo,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 })
    );
    this.scene.add(this.aimCross);

    // Probability ring (filled circle)
    this.probRing = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffd500,
        transparent: true,
        opacity: 0.45,
        depthTest: false,
        side: THREE.DoubleSide,
      })
    );
    this.probRing.position.set(0, 0, 0.009);
    this.scene.add(this.probRing);

    // HUD event listeners
    this.hud.btnNewEl.addEventListener("click", () => {
      void this.newGame();
    });

    this.hud.btnLbEl.addEventListener("click", () => {
      void this.showLeaderboard();
    });

    this.lbPanel.addEventListener("click", (ev) => {
      const target = ev.target as HTMLElement;
      if (target.tagName === "BUTTON" || target === this.lbPanel) {
        this.hideLeaderboard();
      }
    });

    this.summaryPanel.addEventListener("click", (ev) => {
      const target = ev.target as HTMLElement;
      if (target.tagName === "BUTTON" || target === this.summaryPanel) {
        this.hideSummary();
        void this.newGame();
      }
    });

    // Input: hold to aim (shrink), release to throw
    this.renderer.domElement.style.touchAction = "none";
    this.renderer.domElement.addEventListener("pointerdown", (ev) => {
      this.startHold(ev as PointerEvent);
    });
    window.addEventListener("pointerup", () => this.releaseHold());
    window.addEventListener("pointercancel", () => this.releaseHold());

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        void this.throwAt(this.aim.x, this.aim.y, this.probRadiusCurrent);
      }
    });

    window.addEventListener("resize", () => this.onResize());
  }

  /** Start the game. Attempts to resume existing state before starting a new one. */
  async start(): Promise<void> {
    const resumed = await this.fetchState();
    if (!resumed) {
      await this.newGame();
    }
    this.gameStartClientMs = performance.now();
    this.loop();
  }

  /** Stop the animation loop. */
  stop(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  /** Handle window resize to update the camera and renderer. */
  private onResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const aspect = w / h;
    const viewSize = 2.2;

    this.camera.left = -viewSize * aspect;
    this.camera.right = viewSize * aspect;
    this.camera.top = viewSize;
    this.camera.bottom = -viewSize;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
  }

  private hashGameId(gameId: string): number {
    let hash = 2166136261;
    for (let i = 0; i < gameId.length; i += 1) {
      hash ^= gameId.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  private resolveBackgroundSeed(): number {
    if (this.state?.seed32 !== undefined) {
      return this.state.seed32 >>> 0;
    }
    if (this.state?.gameId) {
      return this.hashGameId(this.state.gameId);
    }
    return 1337;
  }

  private setBackgroundTextures(seed: number): void {
    const resolvedSeed = seed >>> 0;
    this.bgSeed = resolvedSeed;

    const tex1 = makeCarnivalLayerTexture(1, resolvedSeed);
    tex1.wrapS = THREE.RepeatWrapping;
    tex1.wrapT = THREE.RepeatWrapping;
    tex1.repeat.set(3.5, 2.6);

    const tex2 = makeCarnivalLayerTexture(3, resolvedSeed + 11);
    tex2.wrapS = THREE.RepeatWrapping;
    tex2.wrapT = THREE.RepeatWrapping;
    tex2.repeat.set(4, 3);

    if (!this.bgMesh1) {
      const mat1 = new THREE.MeshBasicMaterial({ map: tex1 });
      const geo1 = new THREE.PlaneGeometry(30, 20);
      this.bgMesh1 = new THREE.Mesh(geo1, mat1);
      this.bgMesh1.position.set(0, 0, -6);
      this.scene.add(this.bgMesh1);
    } else {
      const mat1 = this.bgMesh1.material as THREE.MeshBasicMaterial;
      if (this.bgTex1) this.bgTex1.dispose();
      mat1.map = tex1;
      mat1.needsUpdate = true;
    }

    if (!this.bgMesh2) {
      const mat2 = new THREE.MeshBasicMaterial({ map: tex2, transparent: true, opacity: 0.6 });
      const geo2 = new THREE.PlaneGeometry(32, 22);
      this.bgMesh2 = new THREE.Mesh(geo2, mat2);
      this.bgMesh2.position.set(0, 0, -7);
      this.scene.add(this.bgMesh2);
    } else {
      const mat2 = this.bgMesh2.material as THREE.MeshBasicMaterial;
      if (this.bgTex2) this.bgTex2.dispose();
      mat2.map = tex2;
      mat2.needsUpdate = true;
    }

    this.bgTex1 = tex1;
    this.bgTex2 = tex2;
  }

  /** Main animation loop. Updates the floating target, probability circle and renders. */
  private loop = (): void => {
    this.rafId = requestAnimationFrame(this.loop);

    const t = performance.now() * 0.001;

    if (this.pendingShot) {
      // Lock visuals to exact server-used aim+radius.
      this.aim.x = this.pendingShot.aimX;
      this.aim.y = this.pendingShot.aimY;
      this.probRadiusCurrent = this.pendingShot.radius;
    } else if (!this.holding) {
      // Idle drift
      const ax = Math.sin(t * 1.15) * 0.55;
      const ay = Math.sin(t * 0.93 + 1.2) * 0.55;
      this.aim.x = ax * 0.75;
      this.aim.y = ay * 0.75;

      const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
      this.probRadiusCurrent = this.probRadiusBase * (0.92 + pulse * 0.10);
    } else {
      // Holding: freeze and shrink
      this.aim.x = this.holdAimX;
      this.aim.y = this.holdAimY;

      const nowMs = performance.now();
      const tr = (nowMs - this.holdStartMs) / this.holdShrinkDurationMs;
      const tt = Math.max(0, Math.min(1, tr));
      const ease = 1 - Math.pow(1 - tt, 3);

      this.probRadiusCurrent =
        this.holdStartRadius + (this.probRadiusMin - this.holdStartRadius) * ease;

      if (tt >= 1) {
        this.releaseHold(true);
      }
    }

    const worldX = this.aim.x;
    const worldY = this.aim.y;

    this.aimRing.position.set(worldX, worldY, 0.01);
    this.aimCross.position.set(worldX, worldY, 0.012);

    this.probRing.position.set(worldX, worldY, 0.009);
    this.probRing.scale.set(this.probRadiusCurrent, this.probRadiusCurrent, 1);

    const aimOffset = Math.max(-0.03, Math.min(0.03, this.aim.x * 0.03));
    // Animate background textures for a subtle parallax drift. Offsets
    // wrap around automatically because repeat wrapping is enabled.
    if (this.bgTex1) {
      // Drift the far layer slowly
      this.bgTex1.offset.x = (t * 0.01 + aimOffset) % 1;
    }
    if (this.bgTex2) {
      // Drift the mid layer slightly faster for parallax
      this.bgTex2.offset.x = (t * 0.02 + aimOffset * 1.3) % 1;
    }

    // Rotate the wedge highlight to follow the current aim. Compute the
    // polar angle of the aim relative to the board centre and map it to a
    // wedge index [0, 19]. The dartboard wedges begin at an angle of
    // -90° - 9° (i.e. the top wedge centred on the 20). We normalise
    // the angle into the 0–2π range and then rotate the highlight.
    if (this.wedgeHighlight) {
      const wedgeSize = (Math.PI * 2) / 20;
      const top = -Math.PI / 2 - wedgeSize / 2;
      let angle = Math.atan2(worldY, worldX);
      // Normalize angle into [0, 2π)
      angle = (angle - top) % (Math.PI * 2);
      if (angle < 0) angle += Math.PI * 2;
      const idx = Math.floor(angle / wedgeSize);
      this.wedgeHighlight.rotation.z = idx * wedgeSize;
      // If the aim is outside the board (radius > 1), reduce opacity to 0
      const r = Math.sqrt(worldX * worldX + worldY * worldY);
      const mat = this.wedgeHighlight.material as THREE.MeshBasicMaterial;
      mat.opacity = r <= 1.0 ? 0.15 : 0.0;
    }

    // Update sparkle systems: compute delta time since last frame and
    // advance all particles. Initialise lastSparkleFrameTime on first call.
    const nowMs = performance.now();
    if (this.lastSparkleFrameTime === null) {
      this.lastSparkleFrameTime = nowMs;
    }
    const dtSec = (nowMs - this.lastSparkleFrameTime) / 1000;
    this.lastSparkleFrameTime = nowMs;
    if (dtSec > 0) {
      this.updateSparkles(dtSec);
    }

    this.renderer.render(this.scene, this.camera);

    const now = performance.now();
    const remaining = Math.max(0, this.cooldownUntil - now);
    if (remaining > 0) {
      this.hud.cooldownEl.textContent = `Cooldown: ${(remaining / 1000).toFixed(2)}s`;
      this.hud.cooldownEl.style.opacity = "1";
    } else {
      this.hud.cooldownEl.style.opacity = "0";
    }
  };

  private startHold(ev: PointerEvent): void {
    const now = performance.now();
    if (this.state && this.state.dartsLeft <= 0) return;
    if (now < this.cooldownUntil) return;
    if (this.holding) return;
    if (this.dartAnimating) return;

    this.holding = true;
    this.holdStartMs = now;
    this.holdAimX = this.aim.x;
    this.holdAimY = this.aim.y;
    this.holdStartRadius = this.probRadiusCurrent;

    try {
      ev.preventDefault();
    } catch {
      // ignore
    }
  }

  private releaseHold(_autoFire: boolean = false): void {
    if (!this.holding) return;

    const aimX = this.holdAimX;
    const aimY = this.holdAimY;
    const radius = this.probRadiusCurrent;

    this.holding = false;

    const now = performance.now();
    if (now < this.cooldownUntil) return;

    void this.throwAt(aimX, aimY, radius);
  }

  /** Show a transient message at the bottom of the screen. */
  private setToast(text: string, show: boolean): void {
    this.hud.toastEl.textContent = text;
    this.hud.toastEl.style.opacity = show ? "1" : "0";
  }

  /** Update the HUD elements based on the current game state. */
  private renderHud(): void {
    const score = this.state?.totalScore ?? 0;
    const darts = this.state?.dartsLeft ?? 0;
    const last = this.state?.history?.length
      ? this.state!.history[this.state!.history.length - 1]
      : null;

    // Update HUD values
    // Score label always updates and pops
    this.hud.scoreEl.textContent = String(score);
    this.animatePop(this.hud.scoreEl);
    // Numeric darts left for accessibility (not as prominent)
    this.hud.dartsEl.textContent = String(darts);

    // Update pip row: render one pip per total dart; mark used ones as 'used'
    const total = this.state?.dartsTotal ?? 0;
    const pips: string[] = [];
    for (let i = 0; i < total; i++) {
      const used = i >= darts;
      pips.push(`<span class="pip${used ? " used" : ""}"></span>`);
    }
    this.hud.dartsPipsEl.innerHTML = pips.join("");
    // If darts decreased, pulse the pip that just became used
    if (this.lastDartsLeft !== null && darts < this.lastDartsLeft) {
      const idx = darts; // the index that changed to used
      const pipEl = this.hud.dartsPipsEl.children.item(idx) as HTMLElement | null;
      if (pipEl) {
        this.animatePulse(pipEl);
      }
    }
    this.lastDartsLeft = darts;

    // Update last hit text and slide in on change
    const newLast = !last ? "-" : formatLastHit(last.segment.label, last.segment.points);
    if (this.lastLastLabel !== newLast) {
      this.hud.lastEl.textContent = newLast;
      this.animateSlideIn(this.hud.lastEl);
      this.lastLastLabel = newLast;
    }

    this.hud.btnNewEl.textContent = darts <= 0 ? "Play again" : "New game";
  }

  /**
   * Apply a pop animation to an element by toggling a CSS class. This
   * method removes the class first to restart the animation on
   * successive calls. See style.css for the .pop keyframes.
   */
  private animatePop(el: HTMLElement): void {
    el.classList.remove("pop");
    // Force reflow to restart the animation
    void el.clientWidth;
    el.classList.add("pop");
  }

  /**
   * Apply a pulse animation to an element by toggling a CSS class.
   * Used to emphasise pip changes when darts decrement.
   */
  private animatePulse(el: HTMLElement): void {
    el.classList.remove("pulse");
    void el.clientWidth;
    el.classList.add("pulse");
  }

  /**
   * Apply a slide‑in animation to an element. Used for last hit updates.
   */
  private animateSlideIn(el: HTMLElement): void {
    el.classList.remove("slide-in");
    void el.clientWidth;
    el.classList.add("slide-in");
  }

  /**
   * Spawn a burst of sparkles at the given world-space coordinates. This is
   * called when the player hits a double bull (DBULL). The sparkles are
   * generated procedurally as a Points mesh with random initial velocities
   * and a fixed lifespan. They drift outward and upward from the hit
   * position and fade out over time using the material’s opacity.
   *
   * @param x Normalised board x-coordinate of the hit
   * @param y Normalised board y-coordinate of the hit
   */
  private spawnSparkles(x: number, y: number): void {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    // Randomise positions around the hit point within a small offset so
    // particles do not all originate from the exact same location. This
    // offset keeps the burst visually dense near the hit and avoids
    // z‑fighting with the board plane.
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Spread initial positions within a radius of 0.015 units in the XY plane
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.015;
      positions[idx] = x + Math.cos(angle) * dist;
      positions[idx + 1] = y + Math.sin(angle) * dist;
      // Spawn slightly above the board to prevent clipping
      positions[idx + 2] = 0.06;

      // Velocity: random direction in XY plane with an upward component
      const speed = 0.5 + Math.random() * 0.8; // units per second
      const dirAngle = Math.random() * Math.PI * 2;
      velocities[idx] = Math.cos(dirAngle) * speed;
      velocities[idx + 1] = Math.sin(dirAngle) * speed;
      // Upward z velocity to create lift; range 0.3–0.8 units/s
      velocities[idx + 2] = 0.3 + Math.random() * 0.5;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    // Store velocities in a custom attribute for easy access; we keep the
    // array separately to avoid having to copy typed arrays from the
    // geometry each frame.
    geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
    // Points material: additive blending for glow, no depth write so
    // sparkles render on top of the board. Size attenuation off since we
    // are in an orthographic camera and want a constant pixel size.
    const material = new THREE.PointsMaterial({
      color: 0xffe57f,
      size: 0.05,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    });
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.sparkleSystems.push({
      mesh: points,
      velocities,
      life: 0.7 + Math.random() * 0.3,
      startTime: performance.now(),
      material,
    });
  }

  /**
   * Update all active sparkle systems. This method is called on every
   * animation frame to advance particle positions, fade them out and
   * remove them when their lifespans expire. Delta time is computed
   * relative to the last call to updateSparkles().
   *
   * @param dtSec Time elapsed since the previous update in seconds
   */
  private updateSparkles(dtSec: number): void {
    const now = performance.now();
    for (let i = this.sparkleSystems.length - 1; i >= 0; i--) {
      const sys = this.sparkleSystems[i];
      const elapsed = (now - sys.startTime) / 1000;
      const lifeFrac = elapsed / sys.life;
      if (lifeFrac >= 1) {
        // Remove expired system
        this.scene.remove(sys.mesh);
        this.sparkleSystems.splice(i, 1);
        continue;
      }
      // Update opacity to fade out over life
      sys.material.opacity = 1 - lifeFrac;
      // Update positions based on velocities
      const posAttr = sys.mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const velocities = sys.velocities;
      for (let j = 0; j < positions.length; j += 3) {
        positions[j] += velocities[j] * dtSec;
        positions[j + 1] += velocities[j + 1] * dtSec;
        positions[j + 2] += velocities[j + 2] * dtSec;
      }
      posAttr.needsUpdate = true;
    }
  }

  /** Attempt to fetch existing game state from the server. */
  private async fetchState(): Promise<boolean> {
    const resp = await fetch("/api/game/state", { method: "GET" });
    const data = (await resp.json()) as StateResponse;
    if (!data.ok || !data.state) return false;

    this.state = data.state;
    const seed = this.resolveBackgroundSeed();
    if (seed !== this.bgSeed) {
      this.setBackgroundTextures(seed);
    }

    if (this.state.dartsTotal > 0) {
      const ratio = this.state.dartsLeft / this.state.dartsTotal;
      this.probRadiusBase = 0.48 * (0.6 + ratio * 0.4);
    }

    this.renderHud();
    return true;
  }

  /** Start a fresh game by calling the server. */
  private async newGame(): Promise<void> {
    const resp = await fetch("/api/game/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dartsTotal: 10 }),
    });
    const data = (await resp.json()) as NewGameResponse;

    if (!data.ok) {
      this.setToast(`New game failed: ${(data as ApiError).error}`, true);
      setTimeout(() => this.setToast("", false), 1500);
      return;
    }

    this.state = data.state;
    const seed = this.resolveBackgroundSeed();
    if (seed !== this.bgSeed) {
      this.setBackgroundTextures(seed);
    }

    const ratio = this.state.dartsLeft / this.state.dartsTotal;
    this.probRadiusBase = 0.48 * (0.6 + ratio * 0.4);

    this.renderHud();
    this.setToast("New game!", true);
    setTimeout(() => this.setToast("", false), 800);
  }

  /** Submit a throw to the server. Handles local cooldown and animation. */
  private async throwAt(aimX: number, aimY: number, radius: number): Promise<void> {
    if (this.lbPanel.style.display === "block" || this.summaryPanel.style.display === "block") return;

    if (!this.state) {
      await this.newGame();
      return;
    }

    if (this.state.dartsLeft <= 0) {
      this.showSummary();
      this.dartAnimating = false;
      this.pendingShot = null;
      return;
    }

    const now = performance.now();
    if (now < this.cooldownUntil) return;
    if (this.dartAnimating) return;

    this.dartAnimating = true;

    const clientElapsedMs = Math.floor(performance.now() - this.gameStartClientMs);

    const payload = {
      gameId: this.state.gameId,
      aimX,
      aimY,
      radius,
      clientElapsedMs,
    };

    const resp = await fetch("/api/game/throw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await resp.json()) as ThrowResponse;

    if (!data.ok) {
      this.dartAnimating = false;
      this.pendingShot = null;
      this.setToast(`Throw failed: ${(data as ApiError).error}`, true);
      setTimeout(() => this.setToast("", false), 1500);
      return;
    }

    const result = data.result;

    // Lock visuals to EXACT server-used aim+radius while dart animates.
    this.pendingShot = {
      aimX: result.aim.x,
      aimY: result.aim.y,
      radius: result.aim.radius,
    };

    this.state.totalScore = result.totalScore;
    this.state.dartsLeft = result.dartsLeft;
    this.state.throwIndex = result.throwIndex + 1;
    this.state.history = [...(this.state.history ?? []), result];

    const ratio = this.state.dartsLeft / this.state.dartsTotal;
    this.probRadiusBase = 0.48 * (0.6 + ratio * 0.4);

    this.renderHud();

    // Prepare the dart's appearance and spin for this throw before animating.
    this.prepareDartForThrow();

    // Animate dart to the hit location (hit represents the RNG-sampled point)
    await this.animateDartTo(result.hit.x, result.hit.y);

    // Spawn sparkles if the hit segment is a double bull (DBULL). We check
    // the label rather than just the point value so that triples or other
    // segments that also score 50 do not trigger the burst. When
    // triggered, the sparkles originate at the hit location and drift.
    if (result.segment.label && result.segment.label.toUpperCase() === "DBULL") {
      this.spawnSparkles(result.hit.x, result.hit.y);
    }

    // Unlock visuals after dart lands.
    this.pendingShot = null;

    this.cooldownUntil = performance.now() + 500;
    this.dartAnimating = false;

    this.setToast(formatLastHit(result.segment.label, result.segment.points), true);
    setTimeout(() => this.setToast("", false), 700);

    if (this.state.dartsLeft <= 0) {
      setTimeout(() => this.showSummary(), 400);
    }
  }

  /**
   * Ensure a dart mesh exists and return it.
   *
   * IMPORTANT FIX:
   * We anchor the mesh so that the *TIP APEX* is at the object's local origin (0,0,0).
   * That way, when we place the object at (hitX, hitY), the visible tip lands exactly
   * on the server's sampled hit-point (and never appears outside the probability circle
   * due to forward tip offset + lookAt rotation).
   */
  private ensureDartMesh(): THREE.Object3D {
    if (this.dartMesh) return this.dartMesh;

    // Create a holder group. This object is positioned and oriented toward
    // the hit location during animation. Its local origin corresponds to the
    // tip apex of the dart, so placing the holder at (hitX, hitY, z) will
    // ensure the visible tip lands exactly on the sampled hit point.
    const holder = new THREE.Group();

    // Create a group to hold all parts of the dart. We store a reference
    // on the instance so that we can apply spin animation about the local
    // z‑axis without affecting the holder's orientation.
    const dartGroup = new THREE.Group();
    this.dartGroup = dartGroup;

    // --- BEGIN ORIENTATION TWEAK ---
    // Tilt the entire dart slightly downward so that even when the holder
    // faces horizontally toward the target, the tip points into the board.
    // Without this adjustment the dart will appear to fly with a shallow
    // downward pitch. Adjust the angle here to taste (negative values pitch
    // the tip toward the board). A value of about -22.5 degrees (−π/8) gives
    // a natural look.
    dartGroup.rotation.x = -Math.PI / 8;
    // --- END ORIENTATION TWEAK ---

    // Define sizes for the various components (in world units). The values
    // below were chosen to approximate a typical steel‑tip dart while
    // respecting the flat board scale used by the game. Adjustments to
    // radii and lengths will simply scale the overall appearance.
    const tipLen = 0.06;
    const tipRad = 0.008;

    const barrelLen = 0.18;
    const barrelRad = 0.013;

    const accentLen = 0.04;
    const accentRad = barrelRad;

    const shaftLen = 0.10;
    const shaftRad = 0.007;

    const flightW = 0.16;
    const flightH = 0.12;

    // Materials
    // Metallic tip and barrel use a light grey with moderate metalness and
    // roughness so they pick up the directional lights. The shaft is dark.
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd1d1d1, metalness: 0.7, roughness: 0.3 });
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.1, roughness: 0.8 });

    // Accent material will be recoloured before every throw. Initialise
    // to red; prepareDartForThrow() will update its colour. Store it on
    // the instance for later use.
    this.dartAccentMaterial = new THREE.MeshStandardMaterial({ color: 0xd32f2f, metalness: 0.4, roughness: 0.5 });

    // Flight material uses a transparent texture. We'll assign the red
    // texture by default and swap to blue when needed. DepthWrite is
    // disabled to prevent z‑fighting when the four planes overlap.
    this.dartFlightMaterial = new THREE.MeshStandardMaterial({
      map: this.flightTextureRed,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Construct tip (a cone). Apex is at the origin after positioning.
    const tip = new THREE.Mesh(new THREE.ConeGeometry(tipRad, tipLen, 12), metalMat);
    tip.rotation.x = Math.PI / 2;
    tip.position.z = -tipLen / 2;

    // Front portion of the barrel (silver body). Place so its front touches
    // the tip base at z = -tipLen. The geometry is centered on its own
    // local origin, so we offset it backward by half its length beyond
    // the tip base.
    const barrelFrontLen = barrelLen - accentLen;
    const barrelFront = new THREE.Mesh(new THREE.CylinderGeometry(barrelRad, barrelRad, barrelFrontLen, 16), metalMat);
    barrelFront.rotation.x = Math.PI / 2;
    barrelFront.position.z = -tipLen - barrelFrontLen / 2;

    // Accent ring (coloured band). Slightly larger radius to emphasise the
    // ring. We use dartAccentMaterial here so it can be recoloured.
    const accent = new THREE.Mesh(new THREE.CylinderGeometry(accentRad * 1.05, accentRad * 1.05, accentLen, 16), this.dartAccentMaterial);
    accent.rotation.x = Math.PI / 2;
    accent.position.z = -tipLen - barrelFrontLen - accentLen / 2;

    // Shaft (black). Positioned so its front touches the back of the accent
    // ring. Again, we offset by half its length.
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(shaftRad, shaftRad, shaftLen, 12), shaftMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -tipLen - barrelFrontLen - accentLen - shaftLen / 2;

    // Flights: four planes arranged radially around the dart's axis.
    // PlaneGeometry is created in the XY plane by default (normal +Z). To
    // resemble real fins we rotate each plane into the YZ plane so that
    // the fin extends backward along the z-axis. Then rotate about z to
    // distribute the fins evenly at 90° intervals. Without the extra
    // rotation, all four planes would overlap each other.
    for (let i = 0; i < 4; i++) {
      const flight = new THREE.Mesh(new THREE.PlaneGeometry(flightW, flightH), this.dartFlightMaterial);
      // Rotate the plane 90° around the Y‑axis so it lies in the YZ plane.
      flight.rotation.y = Math.PI / 2;
      // Rotate around the Z‑axis to create four fins 90° apart.
      flight.rotation.z = (Math.PI / 2) * i;
      // Position flights so that their front edge meets the shaft end
      flight.position.z = -tipLen - barrelFrontLen - accentLen - shaftLen - flightH / 2;
      dartGroup.add(flight);
    }

    // Assemble the components into the dart group. Order doesn't affect
    // transformations because they're children of the same group.
    dartGroup.add(tip);
    dartGroup.add(barrelFront);
    dartGroup.add(accent);
    dartGroup.add(shaft);

    // Add the assembled dart group to the holder. We do not rotate the
    // dart group here; orientation happens on the holder in animateDartTo().
    holder.add(dartGroup);

    // Start the holder below the board. This matches the existing game
    // behaviour where the dart launches upward from below the visible area.
    holder.position.set(0, -1.6, 0.2);

    this.scene.add(holder);
    this.dartMesh = holder;
    return holder;
  }

  /** Animate the dart flying to the hit location. Uses ease-out cubic. */
  private animateDartTo(hitX: number, hitY: number): Promise<void> {
    const dart = this.ensureDartMesh();

    const start = new THREE.Vector3(0, -1.6, 0.25);
    const end = new THREE.Vector3(hitX, hitY, 0.05);

    dart.position.copy(start);

    // Orient the holder toward a point in the same z‑plane as the launch
    // position. Using a target with the same z coordinate helps keep the
    // dart aligned horizontally in flight rather than pitching steeply
    // downward. We also define the up vector so that the flights remain
    // upright (positive z is “up” in our scene). See the three.js docs for
    // details on the up vector and lookAt limitations【246481083537729†L31-L35】.
    const flatTarget = new THREE.Vector3(end.x, end.y, start.z);
    (dart as any).up.set(0, 0, 1);
    (dart as any).lookAt(flatTarget);

    const startTime = performance.now();
    const duration = 220;

    return new Promise((resolve) => {
      const step = () => {
        const now = performance.now();
        const t = (now - startTime) / duration;
        if (t >= 1) {
          // Final placement
          dart.position.copy(end);
          // Reset rotation so the dart remains pointed correctly once landed
          if (this.dartGroup) {
            const totalTimeSec = duration / 1000;
            this.dartGroup.rotation.z = this.currentSpinVel * totalTimeSec;
          }
          resolve();
          return;
        }
        // Ease out cubic for position interpolation
        const e = 1 - Math.pow(1 - t, 3);
        dart.position.lerpVectors(start, end, e);
        // Apply spin based on elapsed real time
        if (this.dartGroup) {
          const elapsedSec = (now - startTime) / 1000;
          this.dartGroup.rotation.z = this.currentSpinVel * elapsedSec;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /**
   * Prepare the dart for the next throw by updating its colour, flight
   * texture and spin velocity. Alternates between red and blue darts on
   * successive calls. Must be invoked before animateDartTo().
   */
  private prepareDartForThrow(): void {
    // Ensure the dart mesh and materials exist
    this.ensureDartMesh();
    if (!this.dartAccentMaterial || !this.dartFlightMaterial) return;

    // Select colour based on the alternating flag
    const useRed = this.nextIsRed;
    if (useRed) {
      this.dartAccentMaterial.color.setHex(0xd32f2f);
      this.dartFlightMaterial.map = this.flightTextureRed;
    } else {
      this.dartAccentMaterial.color.setHex(0x1976d2);
      this.dartFlightMaterial.map = this.flightTextureBlue;
    }
    // Mark the flight material for re‑upload now that the map has changed
    this.dartFlightMaterial.needsUpdate = true;
    // Alternate for next throw
    this.nextIsRed = !this.nextIsRed;
    // Randomise angular velocity between 8 and 12 radians per second
    this.currentSpinVel = 8 + Math.random() * 4;
  }

  /** Fetch leaderboard and display it in the overlay panel. */
  private async showLeaderboard(): Promise<void> {
    if (this.lbPanel.style.display === "block") {
      this.hideLeaderboard();
      return;
    }

    const resp = await fetch("/api/leaderboard", { method: "GET" });
    const data = (await resp.json()) as LeaderboardResponse;

    const listEl = this.lbPanel.querySelector("ul");
    if (!listEl) return;

    listEl.innerHTML = "";

    if (!data.ok) {
      const li = document.createElement("li");
      li.textContent = `Error: ${(data as ApiError).error}`;
      listEl.appendChild(li);
    } else if (!data.entries.length) {
      const li = document.createElement("li");
      li.textContent = "No leaderboard entries yet.";
      listEl.appendChild(li);
    } else {
      data.entries.forEach((e) => {
        const li = document.createElement("li");
        const user = (e.userName ?? "").trim() || (e.userId ? `${e.userId.slice(0, 6)}…` : "Anon");
        li.innerHTML = `<span>#${e.rank} ${user}</span><span>${e.score}</span>`;
        listEl.appendChild(li);
      });
    }

    this.lbPanel.style.display = "block";
  }

  /** Hide the leaderboard overlay. */
  private hideLeaderboard(): void {
    this.lbPanel.style.display = "none";
  }

  /** Display a summary overlay when the game ends. Shows the last ten throws. */
  private showSummary(): void {
    if (!this.state) return;

    const listEl = this.summaryPanel.querySelector("ul");
    if (!listEl) return;

    listEl.innerHTML = "";

    const throws = this.state.history.slice(-10);
    throws.forEach((tr) => {
      const li = document.createElement("li");
      const label = formatLastHit(tr.segment.label, tr.segment.points);
      li.innerHTML = `<span>${label}</span><span>Total: ${tr.totalScore}</span>`;
      listEl.appendChild(li);
    });

    const titleEl = this.summaryPanel.querySelector("h2");
    if (titleEl) titleEl.textContent = `Round Complete – Score ${this.state.totalScore}`;

    this.summaryPanel.style.display = "block";
  }

  /** Hide summary overlay. */
  private hideSummary(): void {
    this.summaryPanel.style.display = "none";
  }

  /**
   * Create a procedurally generated texture for dart flights. The texture is
   * drawn on an off‑screen canvas as a triangular kite shape with a simple
   * gradient between two colours. Areas outside the triangle remain
   * transparent so that the flight geometry can remain a quad. Colours
   * should be provided as CSS colour strings (e.g. "#d32f2f").
   */
  private makeFlightTexture(primary: string, accent: string): THREE.CanvasTexture {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // Fallback: return a single pixel texture if canvas is unavailable
      const data = new Uint8Array([255, 255, 255, 255]);
      const tex = new THREE.DataTexture(data, 1, 1);
      tex.needsUpdate = true;
      return tex;
    }
    // Clear with transparent background
    ctx.clearRect(0, 0, size, size);
    // Define a triangular kite shape: top centre to bottom right to bottom left
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size, size);
    ctx.lineTo(0, size);
    ctx.closePath();
    // Create a simple diagonal gradient across the triangle
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, accent);
    ctx.fillStyle = grad;
    ctx.fill();
    // Optionally draw a few stripes for extra flair
    ctx.lineWidth = 2;
    ctx.strokeStyle = accent;
    for (let i = 1; i < 4; i++) {
      const y = (i / 4) * size;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + size * 0.15);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Create a fun, procedurally generated background texture. This uses an
   * off‑screen canvas to draw horizontal stripes of various bright colours.
   * The texture can be repeated across the background plane. Colours were
   * chosen to evoke a playful, vibrant feel. If you wish to change the
   * palette, modify the colours array below.
   */
  private makeBackgroundTexture(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      const data = new Uint8Array([255, 0, 0, 255]);
      const tex = new THREE.DataTexture(data, 1, 1);
      tex.needsUpdate = true;
      return tex;
    }
    // Define a palette of bright colours
    const colours = [
      "#f44336", // red
      "#e91e63", // pink
      "#9c27b0", // purple
      "#673ab7", // deep purple
      "#3f51b5", // indigo
      "#2196f3", // blue
      "#03a9f4", // light blue
      "#00bcd4", // cyan
    ];
    const stripeHeight = size / colours.length;
    colours.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, idx * stripeHeight, size, stripeHeight);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }
}
