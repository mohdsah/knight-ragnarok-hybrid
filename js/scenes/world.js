class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'World' });
    this.players = {};
    this.npcs = {};
    this.enemies = {};
  }

  preload() {
    // Load world-specific assets
    this.load.tilemapTiledJSON('world_map', 'assets/maps/world.json');
    this.load.image('world_tiles', 'assets/maps/world_tiles.png');
    
    // Load character spritesheets (KO and RO styles)
    this.load.spritesheet('player_ko', 'assets/characters/player_ko.png', {
      frameWidth: 64, frameHeight: 64
    });
    this.load.spritesheet('player_ro', 'assets/characters/player_ro.png', {
      frameWidth: 48, frameHeight: 64
    });
  }

  create() {
    // Create hybrid world map
    const map = this.make.tilemap({ key: 'world_map' });
    const tileset = map.addTilesetImage('world_tiles');
    this.layers = {
      ground: map.createLayer('Ground', tileset),
      walls: map.createLayer('Walls', tileset).setCollisionByProperty({ collides: true }),
      decor: map.createLayer('Decor', tileset)
    };
    
    // Initialize physics
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // Create player (hybrid style)
    this.player = this.physics.add.sprite(400, 300, 
      this.game.registry.get('config').koStyle ? 'player_ko' : 'player_ro'
    );
    this.cameras.main.startFollow(this.player);
    
    // Setup controls
    this.setupControls();
    
    // Initialize networking if online
    if (this.game.registry.get('config').online) {
      this.initNetwork();
    }
    
    // Start world systems
    this.systems = {
      dayNight: new DayNightCycle(this),
      weather: new WeatherSystem(this),
      spawner: new EnemySpawner(this)
    };
  }

  setupControls() {
    // Hybrid control scheme (WASD + mouse)
    this.keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      skill1: '1', skill2: '2', skill3: '3', skill4: '4'
    });
    
    // Mouse input for RO-style targeting
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.player.target = this.getTargetAt(pointer.worldX, pointer.worldY);
      }
    });
  }

  update(time, delta) {
    // Handle player movement
    const speed = 150;
    this.player.body.setVelocity(0);
    
    if (this.keys.up.isDown) {
      this.player.body.setVelocityY(-speed);
      this.player.direction = 'up';
    } else if (this.keys.down.isDown) {
      this.player.body.setVelocityY(speed);
      this.player.direction = 'down';
    }
    
    if (this.keys.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.direction = 'left';
    } else if (this.keys.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.direction = 'right';
    }
    
    // Normalize diagonal movement
    this.player.body.velocity.normalize().scale(speed);
    
    // Update systems
    Object.values(this.systems).forEach(sys => sys.update(delta));
  }
}