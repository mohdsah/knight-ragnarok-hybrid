class GameEngine {
  constructor(config) {
    // Core systems
    this.config = config;
    this.scenes = {};
    this.currentScene = null;
    this.gameTime = 0;
    this.frameCount = 0;
    this.isPaused = false;

    // Hybrid systems
    this.systems = {
      entity: new EntitySystem(this),
      render: new RenderSystem(this),
      physics: new PhysicsSystem(this),
      combat: new CombatSystem(this),
      network: config.online ? new NetworkSystem(this) : null,
      sound: new SoundSystem(this)
    };

    // Initialize core modules
    this.initEventHandlers();
    this.loadBaseAssets();
  }

  initEventHandlers() {
    // Keyboard input
    this.keys = {};
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.currentScene?.handleInput('keydown', e.key);
    });
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.currentScene?.handleInput('keyup', e.key);
    });

    // Gamepad support
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad);
      this.gamepad = e.gamepad;
    });
  }

  loadBaseAssets() {
    // Load essential assets for loading screen
    this.assets = {
      fonts: {
        ragnarok: 'assets/fonts/ragnarok.ttf',
        knight: 'assets/fonts/knight.woff'
      },
      ui: {
        loadingBar: 'assets/ui/loading_bar.png'
      }
    };

    // Font loading example
    const font = new FontFace('Ragnarok', `url(${this.assets.fonts.ragnarok})`);
    font.load().then(() => document.fonts.add(font));
  }

  start() {
    console.log('Starting KnightRagnarok Hybrid Engine');
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  gameLoop(timestamp) {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    this.gameTime += deltaTime;
    this.frameCount++;

    if (!this.isPaused) {
      // Update systems
      this.systems.entity.update(deltaTime);
      this.systems.physics.update(deltaTime);
      this.systems.combat.update(deltaTime);
      
      // Update current scene
      this.currentScene?.update(deltaTime);

      // Render
      this.systems.render.update(deltaTime);
    }

    // Network sync (if online)
    if (this.systems.network && this.frameCount % 10 === 0) {
      this.systems.network.sync();
    }

    requestAnimationFrame(t => this.gameLoop(t));
  }

  switchScene(sceneName) {
    if (this.scenes[sceneName]) {
      this.currentScene?.onExit();
      this.currentScene = this.scenes[sceneName];
      this.currentScene.onEnter();
      return true;
    }
    return false;
  }

  registerScene(scene) {
    this.scenes[scene.name] = scene;
    scene.engine = this;
  }

  // Utility methods
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  lerp(a, b, t) {
    return a + (b - a) * Math.min(1, Math.max(0, t));
  }
}