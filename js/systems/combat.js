class CombatSystem {
  constructor(game) {
    this.game = game;
    this.attackQueue = [];
    this.areaEffects = [];
    this.comboTimer = 0;
    this.comboCount = 0;
  }

  // ======================
  // CORE COMBAT METHODS
  // ======================
  attack(attacker, target, skill = null) {
    // KO-Style: Combo system
    const now = this.game.time.now;
    const isCombo = now - this.comboTimer < 500 && attacker === this.lastAttacker;
    
    // Calculate base damage
    let damage = this.calculateDamage(attacker, target, skill, isCombo);
    
    // RO-Style: Elemental modifiers
    if (skill?.element) {
      damage *= this.getElementMultiplier(skill.element, target.element);
    }

    // Apply damage
    const finalDamage = target.takeDamage(damage, attacker);
    
    // KO-Style: Update combo
    if (isCombo) {
      this.comboCount++;
      if (attacker.rage) attacker.rage += 5;
    } else {
      this.comboCount = 1;
    }
    this.comboTimer = now;
    this.lastAttacker = attacker;

    // RO-Style: On-hit effects
    if (skill?.onHit) {
      skill.onHit(attacker, target, finalDamage);
    }

    return {
      damage: finalDamage,
      isCritical: damage.isCritical,
      isCombo
    };
  }

  calculateDamage(attacker, target, skill, isCombo) {
    // Hybrid damage formula
    const basePower = skill?.power || attacker.stats.str;
    const skillBonus = skill ? (attacker.stats.int * 0.5) : 0;
    const comboBonus = isCombo ? (this.comboCount * 0.1) : 0;
    
    // KO-Style: Critical hits
    const isCritical = Math.random() < (attacker.stats.dex * 0.01);
    const critMultiplier = isCritical ? this.game.config.combat.ko.critMultiplier : 1;
    
    // RO-Style: Defense calculation
    const defense = target.stats.vit * 0.8;
    
    const rawDamage = (basePower + skillBonus) * (1 + comboBonus) * critMultiplier;
    return Math.max(1, rawDamage - defense);
  }

  getElementMultiplier(attackElement, targetElement) {
    // RO-Style elemental chart
    const chart = {
      fire: { earth: 1.5, water: 0.5 },
      water: { fire: 1.5, wind: 0.5 },
      wind: { earth: 1.5, fire: 0.5 },
      earth: { wind: 1.5, water: 0.5 }
    };
    return chart[attackElement]?.[targetElement] || 1;
  }

  // ======================
  // SPECIAL SYSTEMS
  // ======================
  applyBerserk(character) {
    // KO-Style berserk mode
    if (character.rage >= 100) {
      character.stats.str *= 1.5;
      character.stats.vit *= 0.7;
      character.rage = 0;
      return true;
    }
    return false;
  }

  createAoeEffect(x, y, radius, damage, duration) {
    // RO-Style area skills
    this.areaEffects.push({
      x, y, radius, damage, duration,
      startTime: this.game.time.now
    });
  }

  update(deltaTime) {
    // Update combos
    if (this.game.time.now - this.comboTimer > 1000) {
      this.comboCount = 0;
    }

    // Update area effects
    this.areaEffects = this.areaEffects.filter(effect => {
      effect.duration -= deltaTime;
      
      // Damage entities in radius
      if (effect.duration > 0) {
        this.game.entities.forEach(entity => {
          if (GameUtils.distance(effect.x, effect.y, entity.x, entity.y) <= effect.radius) {
            entity.takeDamage(effect.damage * deltaTime);
          }
        });
      }
      
      return effect.duration > 0;
    });
  }
}