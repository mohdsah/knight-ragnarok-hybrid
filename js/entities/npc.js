import Character from './character.js';

class NPC extends Character {
  constructor(config) {
    super(config);
    
    // NPC-Specific Properties
    this.npcType = config.npcType || 'vendor';
    this.dialog = config.dialog || [];
    this.services = config.services || [];
    this.isStationary = config.isStationary || true;
    
    // RO-Style NPC Features
    this.quests = config.quests || [];
    this.shopItems = config.shopItems || [];
    
    // KO-Style NPC Features
    this.clan = config.clan || null;
    this.isGuard = config.isGuard || false;
  }

  interact(player) {
    switch(this.npcType) {
      case 'vendor':
        return this.openShop(player);
      case 'quest':
        return this.offerQuests(player);
      case 'warper':
        return this.showWarpOptions(player);
      case 'blacksmith':
        return this.showCraftingMenu(player);
    }
  }

  openShop(player) {
    // RO-Style shop interface
    return {
      type: 'shop',
      items: this.shopItems,
      currency: 'gold'
    };
  }

  offerQuests(player) {
    // Hybrid quest system
    const availableQuests = this.quests.filter(quest => 
      !player.quests.some(q => q.id === quest.id) &&
      quest.requirements.level <= player.level
    );
    
    return {
      type: 'quest',
      npcName: this.name,
      quests: availableQuests
    };
  }

  showWarpOptions(player) {
    // KO-Style warping
    const destinations = [
      { map: 'prontera', cost: 100 },
      { map: 'elmorad', cost: 200 }
    ];
    
    return {
      type: 'warp',
      destinations,
      currentGold: player.gold
    };
  }

  update(deltaTime) {
    // RO-Style NPC movement patterns
    if (!this.isStationary && Math.random() < 0.005) {
      const wanderX = this.x + GameUtils.randomInt(-50, 50);
      const wanderY = this.y + GameUtils.randomInt(-50, 50);
      this.moveTo(wanderX, wanderY);
    }
  }
}

export default NPC;