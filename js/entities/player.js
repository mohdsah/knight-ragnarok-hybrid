import Character from './character.js';

class Player extends Character {
  constructor(config) {
    super(config);
    
    // Player-Specific Properties
    this.job = config.job || 'novice';
    this.jobLevel = 1;
    this.skillPoints = 0;
    this.inventory = [];
    this.quests = [];
    this.party = null;
    this.clan = null;

    // KO-Style Player Features
    this.comboCount = 0;
    this.lastAttackTime = 0;
    this.rage = 0; // Berserker mode resource

    // RO-Style Player Features
    this.element = config.element || 'neutral';
    this.homunculus = null;
    this.cart = []; // Merchant cart system
  }

  // ======================
  // JOB SYSTEM (RO-Style)
  // ======================
  changeJob(newJob) {
    if (this.job === 'novice' && this.level >= 10) {
      this.job = newJob;
      this.jobLevel = 1;
      
      // Job-specific bonuses
      switch(newJob) {
        case 'swordsman': // KO-Style
          this.stats.str += 5;
          this.stats.vit += 3;
          break;
        case 'mage': // RO-Style
          this.stats.int += 5;
          this.maxSp += 30;
          break;
      }
      
      return true;
    }
    return false;
  }

  // ======================
  // COMBAT (Hybrid System)
  // ======================
  attack(target) {
    const now = Date.now();
    const isCombo = (now - this.lastAttackTime) < 500; // KO-Style combo window
    
    let damage = GameUtils.calculateDamage(
      this, 
      target, 
      { 
        power: isCombo ? 1.2 : 1.0, // Combo bonus
        element: this.element 
      }
    );

    if (isCombo) {
      this.comboCount++;
      this.rage += 5; // KO-Style rage buildup
      damage *= 1 + (this.comboCount * 0.1);
    } else {
      this.comboCount = 0;
    }

    this.lastAttackTime = now;
    return target.takeDamage(damage, this);
  }

  useSkill(skill, target) {
    if (this.currentSp < skill.spCost) return false;
    
    this.currentSp -= skill.spCost;
    
    // RO-Style Cast Time Calculation
    const castTime = skill.castTime * (1 - (this.stats.dex * 0.01));
    
    // Apply skill effects
    setTimeout(() => {
      if (skill.type === 'attack') {
        const damage = GameUtils.calculateDamage(this, target, skill);
        target.takeDamage(damage, this);
      } else if (skill.type === 'heal') {
        this.currentHp = Math.min(this.maxHp, this.currentHp + skill.power);
      }
    }, castTime * 1000);

    return true;
  }

  // ======================
  // INVENTORY (Hybrid System)
  // ======================
  addItem(item) {
    // RO-Style stacking for consumables
    if (item.stackable) {
      const existing = this.inventory.find(i => i.id === item.id);
      if (existing && existing.quantity < existing.maxStack) {
        existing.quantity++;
        return true;
      }
    }
    
    // KO-Style equipment check
    if (this.inventory.length < 40) { // KO-style inventory limit
      this.inventory.push(item);
      return true;
    }
    
    return false;
  }

  equip(item) {
    if (item.requiredJob && item.requiredJob !== this.job) {
      return false;
    }
    
    // Unequip existing item
    if (this.equipment[item.slot]) {
      this.unequip(item.slot);
    }
    
    this.equipment[item.slot] = item;
    
    // Apply stat bonuses
    for (const stat in item.stats) {
      this.stats[stat] += item.stats[stat];
    }
    
    return true;
  }
}

export default Player;