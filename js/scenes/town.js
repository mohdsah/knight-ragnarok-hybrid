class TownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Town' });
    this.currentTown = null;
  }

  preload() {
    // Load town-specific assets
    this.load.tilemapTiledJSON('prontera', 'assets/maps/towns/prontera.json');
    this.load.image('prontera_tiles', 'assets/maps/towns/prontera_tiles.png');
    this.load.tilemapTiledJSON('elmorad', 'assets/maps/towns/elmorad.json');
    this.load.image('elmorad_tiles', 'assets/maps/towns/elmorad_tiles.png');
  }

  create(data) {
    // Load appropriate town (RO or KO style)
    this.currentTown = data.town || 'prontera';
    const isKO = this.currentTown === 'elmorad';
    
    const map = this.make.tilemap({ key: this.currentTown });
    const tileset = map.addTilesetImage(`${this.currentTown}_tiles`);
    
    this.layers = {
      ground: map.createLayer('Ground', tileset),
      buildings: map.createLayer('Buildings', tileset).setCollisionByProperty({ collides: true }),
      decor: map.createLayer('Decor', tileset)
    };
    
    // Create NPCs
    this.createNPCs(isKO ? 'ko' : 'ro');
    
    // Setup town music
    this.sound.play(isKO ? 'ko_town' : 'ro_town', { loop: true });
    
    // Initialize UI
    this.createTownUI();
  }

  createNPCs(style) {
    const npcData = this.cache.json.get('npcs')[style];
    
    npcData.forEach(npc => {
      const sprite = this.physics.add.sprite(npc.x, npc.y, `${style}_npc`, npc.frame);
      sprite.setInteractive();
      sprite.on('pointerdown', () => this.interactWithNPC(npc.id));
      
      // Add floating name (RO-style)
      const nameText = this.add.text(npc.x, npc.y - 30, npc.name, {
        fontFamily: style === 'ko' ? 'Knight' : 'Ragnarok',
        fontSize: '16px'
      }).setOrigin(0.5);
    });
  }

  createTownUI() {
    // KO-Style quick access panel
    if (this.currentTown === 'elmorad') {
      this.add.rectangle(50, 50, 200, 400, 0x000000, 0.7)
        .setScrollFactor(0)
        .setDepth(100);
    }
    // RO-Style menu button
    else {
      const menuBtn = this.add.sprite(750, 50, 'ui_buttons', 0)
        .setScrollFactor(0)
        .setInteractive();
    }
  }
}