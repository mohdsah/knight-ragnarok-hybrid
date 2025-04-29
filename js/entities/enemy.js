import Character from './character.js';

class Enemy extends Character {
  constructor(config) {
    super(config);
    
    // Enemy-Specific Properties
    this.type = config.type || 'normal';
    this.aiType = config.aiType || 'passive';
    this.respawnTime = config.respawnTime || 30000; // ms
    this.expReward = config.expReward || 50;
    this.dropTable = config.dropTable || [];
    
    // KO-Style Enemy Features
    this.isBoss = config.isBoss || false;
    this.aggroRange = config.aggroRange || 200;
    
    // RO-Style Enemy Features
    this.element = config.element || 'neutral';
    this.race = config.race || 'formless';
    this.size = config.size || 'medium';
  }

  // ======================
  // AI SYSTEM (Hybrid)
  // ======================
  update(deltaTime, player) {
    super.update(deltaTime);
    
    switch(this.aiType) {
      case 'aggressive':
        this.aggressiveAI(player);
        break;
      case 'patrol':
        this.patrolAI();
        break;
      case 'boss':
        this.bossAI(player);
        break;
    }
  }

  aggressiveAI(player) {
    const distance = GameUtils.distance(this.x, this.y, player.x, player.y);
    
    if (distance < this.aggroRange) {
      if (distance > 50) { // Chase player
        this.moveTo(player.x, player.y);
      } else { // Attack
        this.attack(player);
      }
    } else {
      this.isMoving = false;
    }
  }

  patrolAI() {
    // RO-Style random movement
    if (!this.isMoving && Math.random() < 0.01) {
      const patrolX = this.x + GameUtils.randomInt(-200, 200);
      const patrolY = this.y + GameUtils.randomInt(-200, 200);
      this.moveTo(patrolX, patrolY);
    }
  }

  bossAI(player) {
    // KO-Style boss mechanics
    if (this.currentHp < this.maxHp * 0.3) {
      // Enrage mode
      this.stats.str *= 1.5;
      this.speed *= 1.2;
    }
    
    this.aggressiveAI(player);
  }

  // ======================
  // LOOT SYSTEM (RO-Style)
  // ======================
  generateDrops() {
    const drops = [];
    
    this.dropTable.forEach(item => {
      if (Math.random() < item.chance) {
        // RO-Style luck modifier
        const luckMod = 1 + (player?.stats.luk * 0.01 || 0);
        if (Math.random() < item.chance * luckMod) {
          drops.push({ ...item });
        }
      }
    });
    
    // KO-Style guaranteed drop for bosses
    if (this.isBoss && drops.length === 0) {
      drops.push(this.dropTable[0]);
    }
    
    return drops;
  }
}

export default Enemy;