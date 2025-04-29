import { GameUtils } from '../core/utils.js';

class Character {
  constructor(config) {
    // Core Properties
    this.id = GameUtils.generateId();
    this.name = config.name || 'Unknown';
    this.level = config.level || 1;
    this.exp = config.exp || 0;
    this.gold = config.gold || 0;

    // KO-RO Hybrid Stats
    this.stats = {
      // KO-Style
      str: config.stats?.str || 10,  // Physical attack
      vit: config.stats?.vit || 8,   // Defense/HP
      agi: config.stats?.agi || 5,   // Attack speed
      
      // RO-Style
      dex: config.stats?.dex || 5,   // Hit/Critical
      int: config.stats?.int || 3,   // Magic attack
      luk: config.stats?.luk || 1    // Rare drops
    };

    // Combat Properties
    this.currentHp = config.maxHp || 100;
    this.maxHp = config.maxHp || 100 + (this.stats.vit * 5);
    this.currentSp = config.maxSp || 50;
    this.maxSp = config.maxSp || 50 + (this.stats.int * 3);

    // Position/Rendering
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 40;
    this.height = config.height || 60;
    this.direction = config.direction || 'down';

    // Equipment (KO-Style Slots + RO-Style Cards)
    this.equipment = {
      weapon: null,
      armor: null,
      helmet: null,
      gloves: null,
      boots: null,
      accessory: null,
      card: null
    };

    // State
    this.isMoving = false;
    this.isAttacking = false;
    this.target = null;
    this.skills = [];
  }

  // ======================
  // CORE METHODS
  // ======================
  gainExp(amount) {
    this.exp += amount;
    const expNeeded = this.getExpToNextLevel();
    
    if (this.exp >= expNeeded) {
      this.levelUp();
      return true;
    }
    return false;
  }

  getExpToNextLevel() {
    // KO-style exponential curve with RO-style job modifiers
    return Math.floor(100 * Math.pow(1.2, this.level - 1));
  }

  levelUp() {
    this.level++;
    this.exp = 0;

    // KO-Style HP growth
    this.maxHp += 20 + (this.stats.vit * 2);
    this.currentHp = this.maxHp;

    // RO-Style SP growth
    this.maxSp += 10 + (this.stats.int * 1.5);
    this.currentSp = this.maxSp;

    // Stat increases (Hybrid)
    this.stats.str += 2;  // KO
    this.stats.vit += 1;  // KO
    this.stats.dex += 1;  // RO
    this.stats.int += 1;  // RO

    return true;
  }

  // ======================
  // COMBAT METHODS
  // ======================
  takeDamage(damage, attacker) {
    // KO-Style Defense Calculation
    const defense = this.stats.vit * 0.8;
    const finalDamage = Math.max(1, damage - defense);
    
    this.currentHp -= finalDamage;
    this.target = attacker;

    if (this.currentHp <= 0) {
      this.die();
    }

    return finalDamage;
  }

  die() {
    // RO-Style Death Penalty
    this.exp = Math.max(0, this.exp - (this.getExpToNextLevel() * 0.05));
    this.currentHp = this.maxHp * 0.3;
    this.currentSp = this.maxSp * 0.3;
  }

  // ======================
  // MOVEMENT METHODS
  // ======================
  moveTo(x, y) {
    this.isMoving = true;
    this.targetPosition = { x, y };
    this.direction = this.calculateDirection(x, y);
  }

  calculateDirection(targetX, targetY) {
    const angle = GameUtils.angleBetween(this.x, this.y, targetX, targetY);
    const pi = Math.PI;
    
    if (angle >= -pi/4 && angle < pi/4) return 'right';
    if (angle >= pi/4 && angle < 3*pi/4) return 'down';
    if (angle >= -3*pi/4 && angle < -pi/4) return 'up';
    return 'left';
  }

  update(deltaTime) {
    if (this.isMoving && this.targetPosition) {
      const speed = 100 * (1 + this.stats.agi * 0.01);
      const dx = this.targetPosition.x - this.x;
      const dy = this.targetPosition.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        this.x += (dx / distance) * speed * deltaTime;
        this.y += (dy / distance) * speed * deltaTime;
      } else {
        this.isMoving = false;
      }
    }
  }
}

export default Character;