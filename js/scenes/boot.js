class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    // Load minimal assets for loading screen
    this.load.image('loading_bg', 'assets/ui/loading_bg.png');
    this.load.image('loading_bar', 'assets/ui/loading_bar.png');
    
    // Load fonts
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    
    // Load core configuration
    this.load.json('game_config', 'assets/data/config.json');
  }

  create() {
    // Initialize core systems
    this.game.registry.set('config', this.cache.json.get('game_config'));
    
    // Setup loading progress display
    const { width, height } = this.scale;
    this.add.image(width/2, height/2, 'loading_bg');
    const progressBar = this.add.sprite(width/2, height/2 + 50, 'loading_bar')
      .setOrigin(0.5, 0.5);
    
    // Load remaining assets
    this.scene.launch('Preloader');
    
    // Webfont loading
    WebFont.load({
      custom: {
        families: ['Ragnarok', 'Knight'],
        urls: ['assets/fonts/fonts.css']
      },
      active: () => {
        this.scene.start('Preloader');
      }
    });
  }
}