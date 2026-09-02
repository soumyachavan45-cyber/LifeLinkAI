/**
 * LifeLink AI - 3D Blood Dropping & Glass Vase Background Engine
 * Implemented with Three.js (WebGL) + Viscous Droplet Physics & Erythrocyte Particles
 */

(function() {
  'use strict';

  class Blood3DScene {
    constructor() {
      this.container = document.getElementById('threejs-bg-container');
      if (!this.container) return;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();

      // Mouse parallax coordinates
      this.mouseX = 0;
      this.mouseY = 0;
      this.targetMouseX = 0;
      this.targetMouseY = 0;

      // 3D Objects
      this.glassVase = null;
      this.liquidPool = null;
      this.upperDropper = null;
      this.droplets = [];
      this.activeRipples = [];
      this.erythrocytes = [];
      this.ambientGlowParticles = null;

      // Physics params
      this.gravity = 0.015;
      this.dripInterval = 1.4; // seconds between drops
      this.lastDripTime = 0;
      this.poolLevelY = -3.2;
      this.dropOriginY = 4.2;

      this.isAnimationActive = true;
      this.isLowPowerMode = false;

      this.init();
    }

    init() {
      // 1. Scene Setup
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x07090e, 0.045);

      // 2. Camera Setup
      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
      this.camera.position.set(0, 0, 11);

      // 3. Renderer Setup
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;
      this.container.appendChild(this.renderer.domElement);

      // 4. Lighting Rig
      this.setupLights();

      // 5. Build 3D Mesh Elements
      this.buildGlassVase();
      this.buildUpperDropper();
      this.buildLiquidPool();
      this.buildFloatingErythrocytes(35);
      this.buildAmbientDust();

      // 6. Event Listeners
      window.addEventListener('resize', this.onWindowResize.bind(this));
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
      document.addEventListener('visibilitychange', () => {
        this.isAnimationActive = !document.hidden;
      });
      window.addEventListener('lifelink:theme-change', (e) => {
        this.onThemeChange(e.detail.theme);
      });

      // 7. Start Render Loop
      this.animate();
    }

    onThemeChange(theme) {
      if (!this.scene) return;
      if (theme === 'light') {
        this.scene.fog = new THREE.FogExp2(0xf4f7fb, 0.035);
      } else {
        this.scene.fog = new THREE.FogExp2(0x07090e, 0.045);
      }
    }

    setupLights() {
      // Soft Ambient Light
      const ambientLight = new THREE.AmbientLight(0x2a0812, 1.8);
      this.scene.add(ambientLight);

      // Primary Crimson Key Light (Top Left)
      const keyLight = new THREE.DirectionalLight(0xff1744, 2.8);
      keyLight.position.set(-5, 8, 5);
      this.scene.add(keyLight);

      // Cyan Accent Rim Light (Bottom Right for Glass Specular)
      const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.4);
      rimLight.position.set(6, -4, 4);
      this.scene.add(rimLight);

      // Point Light inside the collection vase
      const pointGlow = new THREE.PointLight(0xff0033, 3.5, 8);
      pointGlow.position.set(0, -2.8, 0);
      this.scene.add(pointGlow);
    }

    buildGlassVase() {
      // Create sleek anatomical crystal vase profile curve
      const points = [];
      points.push(new THREE.Vector2(0.0, -3.8));
      points.push(new THREE.Vector2(1.8, -3.7));
      points.push(new THREE.Vector2(2.4, -3.2));
      points.push(new THREE.Vector2(2.1, -1.8));
      points.push(new THREE.Vector2(1.2, -0.4));
      points.push(new THREE.Vector2(0.9, 0.8));
      points.push(new THREE.Vector2(1.3, 1.8));
      points.push(new THREE.Vector2(1.4, 2.0));

      const latheGeo = new THREE.LatheGeometry(points, 48);

      // Translucent Glass Physical Material
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.08,
        transmission: 0.92, // Glass look
        thickness: 1.2,
        transparent: true,
        opacity: 0.75,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: 0x330008,
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide
      });

      this.glassVase = new THREE.Mesh(latheGeo, glassMat);
      this.glassVase.position.set(0, 0, 0);
      this.scene.add(this.glassVase);

      // Outer delicate neon wireframe contour
      const wireframeGeo = new THREE.WireframeGeometry(latheGeo);
      const wireframeMat = new THREE.LineBasicMaterial({
        color: 0xff1744,
        transparent: true,
        opacity: 0.08
      });
      const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
      this.glassVase.add(wireframeMesh);
    }

    buildUpperDropper() {
      // Stylized glass delivery pipette at the top
      const tubeGeo = new THREE.CylinderGeometry(0.35, 0.18, 2.2, 32, 1, true);
      const tubeMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.6
      });
      this.upperDropper = new THREE.Mesh(tubeGeo, tubeMat);
      this.upperDropper.position.set(0, 4.8, 0);
      this.scene.add(this.upperDropper);
    }

    buildLiquidPool() {
      // The blood reservoir at the base of the glass vase
      const poolGeo = new THREE.CylinderGeometry(2.1, 1.6, 1.2, 48);
      const poolMat = new THREE.MeshPhysicalMaterial({
        color: 0xd32f2f,
        emissive: 0x880e4f,
        emissiveIntensity: 0.6,
        roughness: 0.15,
        metalness: 0.2,
        clearcoat: 0.8,
        transparent: true,
        opacity: 0.92
      });

      this.liquidPool = new THREE.Mesh(poolGeo, poolMat);
      this.liquidPool.position.set(0, -3.2, 0);
      this.scene.add(this.liquidPool);
    }

    createTeardropGeometry() {
      // Procedural biconical teardrop geometry
      const geom = new THREE.SphereGeometry(0.24, 24, 24);
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i);
        if (y > 0) {
          // Stretch upper half into teardrop cone
          pos.setY(i, y * 1.8);
          pos.setX(i, pos.getX(i) * (1 - y * 0.4));
          pos.setZ(i, pos.getZ(i) * (1 - y * 0.4));
        }
      }
      geom.computeVertexNormals();
      return geom;
    }

    spawnBloodDrop() {
      const dropGeo = this.createTeardropGeometry();
      const dropMat = new THREE.MeshPhysicalMaterial({
        color: 0xff1744,
        emissive: 0xbf0000,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        transmission: 0.4,
        transparent: true,
        opacity: 0.95
      });

      const dropMesh = new THREE.Mesh(dropGeo, dropMat);
      dropMesh.position.set(0, this.dropOriginY, 0);

      const dropObj = {
        mesh: dropMesh,
        vy: 0,
        scale: 0.2,
        isDetached: false,
        formTimer: 0
      };

      this.scene.add(dropMesh);
      this.droplets.push(dropObj);
    }

    spawnRipple(x, y, z) {
      // Expanding glowing ripple ring on pool impact
      const ringGeo = new THREE.RingGeometry(0.1, 0.22, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff5252,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });

      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(x, y + 0.6, z);

      this.scene.add(ringMesh);
      this.activeRipples.push({
        mesh: ringMesh,
        radius: 0.2,
        opacity: 0.85,
        maxRadius: 1.9
      });
    }

    buildFloatingErythrocytes(count) {
      // 3D Red Blood Cells (Biconcave Discs)
      const rbcGeo = new THREE.TorusGeometry(0.3, 0.15, 16, 32);
      // Slight scale squashing to make it an authentic biconcave disc
      rbcGeo.scale(1, 1, 0.45);

      const rbcMat = new THREE.MeshPhysicalMaterial({
        color: 0xd50000,
        emissive: 0x800000,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 0.6
      });

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(rbcGeo, rbcMat);
        const radius = 3.5 + Math.random() * 5.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI * 0.8;

        mesh.position.set(
          radius * Math.sin(theta) * Math.cos(phi),
          (Math.random() - 0.5) * 10,
          radius * Math.cos(theta) * Math.cos(phi) - 2
        );

        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        const scale = 0.5 + Math.random() * 0.6;
        mesh.scale.set(scale, scale, scale);

        this.scene.add(mesh);
        this.erythrocytes.push({
          mesh: mesh,
          rotSpeedX: (Math.random() - 0.5) * 0.015,
          rotSpeedY: (Math.random() - 0.5) * 0.015,
          floatSpeed: 0.005 + Math.random() * 0.008,
          floatOffset: Math.random() * Math.PI * 2
        });
      }
    }

    buildAmbientDust() {
      // Soft micro glowing plasma particles
      const particleCount = 120;
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 16;
        positions[i + 2] = (Math.random() - 0.5) * 12;
      }

      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color: 0xff1744,
        size: 0.08,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });

      this.ambientGlowParticles = new THREE.Points(geom, mat);
      this.scene.add(this.ambientGlowParticles);
    }

    onMouseMove(e) {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    onWindowResize() {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updatePhysics(delta, elapsed) {
      // 1. Spawning Periodic Viscous Drops
      if (elapsed - this.lastDripTime > this.dripInterval) {
        this.spawnBloodDrop();
        this.lastDripTime = elapsed;
      }

      // 2. Animate Droplets
      for (let i = this.droplets.length - 1; i >= 0; i--) {
        const drop = this.droplets[i];

        if (!drop.isDetached) {
          // Forming phase at pipette tip
          drop.formTimer += delta;
          drop.scale = Math.min(1.0, drop.formTimer * 1.8);
          drop.mesh.scale.set(drop.scale, drop.scale * 1.2, drop.scale);

          if (drop.scale >= 1.0) {
            drop.isDetached = true;
          }
        } else {
          // Falling under gravity
          drop.vy += this.gravity;
          drop.mesh.position.y -= drop.vy;

          // Subtle stretch during fast descent
          drop.mesh.scale.y = 1.0 + drop.vy * 1.5;

          // Impact with pool
          if (drop.mesh.position.y <= this.poolLevelY + 0.6) {
            this.spawnRipple(drop.mesh.position.x, this.poolLevelY, drop.mesh.position.z);
            this.scene.remove(drop.mesh);
            this.droplets.splice(i, 1);
          }
        }
      }

      // 3. Animate Ripples
      for (let i = this.activeRipples.length - 1; i >= 0; i--) {
        const rip = this.activeRipples[i];
        rip.radius += 0.045;
        rip.opacity -= 0.022;
        rip.mesh.scale.set(rip.radius, rip.radius, 1);
        rip.mesh.material.opacity = Math.max(0, rip.opacity);

        if (rip.opacity <= 0 || rip.radius >= rip.maxRadius) {
          this.scene.remove(rip.mesh);
          this.activeRipples.splice(i, 1);
        }
      }

      // 4. Floating Erythrocytes (Red Blood Cells)
      this.erythrocytes.forEach(rbc => {
        rbc.mesh.rotation.x += rbc.rotSpeedX;
        rbc.mesh.rotation.y += rbc.rotSpeedY;
        rbc.mesh.position.y += Math.sin(elapsed * 2 + rbc.floatOffset) * 0.003;
      });

      // 5. Ambient Dust Drift
      if (this.ambientGlowParticles) {
        this.ambientGlowParticles.rotation.y = elapsed * 0.03;
      }

      // 6. Liquid Pool Subtle Breathing Pulse
      if (this.liquidPool) {
        this.liquidPool.scale.y = 1.0 + Math.sin(elapsed * 3) * 0.025;
      }
    }

    animate() {
      requestAnimationFrame(this.animate.bind(this));

      if (!this.isAnimationActive) return;

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Smooth mouse parallax damping (lerp)
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

      this.camera.position.x = this.mouseX * 1.5;
      this.camera.position.y = -this.mouseY * 1.2;
      this.camera.lookAt(0, 0, 0);

      // Subtle vase rotation
      if (this.glassVase) {
        this.glassVase.rotation.y = Math.sin(elapsed * 0.4) * 0.15;
      }

      this.updatePhysics(delta, elapsed);
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Initialize once DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Only init if Three.js is loaded
    if (typeof THREE !== 'undefined') {
      window.LifeLink3DScene = new Blood3DScene();
    }
  });
})();
