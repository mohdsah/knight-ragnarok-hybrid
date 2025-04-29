class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Battle' });
    this.battleType = null; // 'arena', 'dungeon', 'pvp'
  }

  preload() {
    // Load battle assets
    this.load.image('battle_bg', 'assets/battle/backgrounds/default.png');
    this.load.spritesheet('skills', 'assets/battle/skills.png', {
      frameWidth: 64, frameHeight: 64
    });
  }

  create(data) {
    // Initialize battle type
    this.battleType = data.type || 'dungeon';
    
    // Create background (KO or RO style)
    const isKO = this.battleType === 'pvp' || this.battleType === 'arena';
    this.add.image(400, 300, isKO ? 'ko_battle_bg' : 'ro_battle_bg');
    
    // Setup battle systems
    this.systems = {
      turnManager: new TurnSystem(this),
      actionQueue: new ActionQueue(this),
      rewardSystem: new RewardSystem(this)
    };
    
    // Create battle UI
    this.createBattleUI(isKO);
    
    // Start battle music
    this.sound.play(isKO ? 'ko_battle' : 'ro_battle', { loop: true });
  }

  createBattleUI(koStyle) {
    if (koStyle) {
      // KO-Style action bar
      this.actionBar = this.add.container(400, 550);
      
      ['attack', 'skill', 'item', 'flee'].forEach((action, i) => {
        const btn = this.add.sprite(i * 80 - 120, 0, 'action_buttons', i)
          .setInteractive();
        btn.on('pointerdown', () => this.selectAction(action));
        this.actionBar.add(btn);
      });
    } else {
      // RO-Style command window
      this.commandWindow = new Window(this, 50, 400, 200, 150);
      this.commandWindow.addButton('Attack', () => this.selectAction('attack'));
      this.commandWindow.addButton('Skill', () => this.openSkillMenu());
      this.commandWindow.addButton('Item', () => this.openItemMenu());
    }
  }

  update() {
    // Update battle systems
    this.systems.turnManager.update();
    this.systems.actionQueue.update();
  }
}