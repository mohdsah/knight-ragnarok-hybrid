class SkillSystem {
  constructor(game) {
    this.game = game;
    this.skillCooldowns = {};
    this.skillLevels = {};
  }

  // ======================
  // SKILL USAGE
  // ======================
  useSkill(skillId, target) {
    const skill = this.game.data.skills[skillId];
    if (!skill || !this.canUseSkill(skillId)) {
      return false;
    }

    // RO-Style: Check SP
    if (this.game.player.currentSp < skill.spCost) {
      return false;
    }

    // KO-Style: Check weapon requirements
    if (skill.requiredWeapon && 
        this.game.player.equipment.weapon?.type !== skill.requiredWeapon) {
      return false;
    }

    // Deduce SP
    this.game.player.currentSp -= skill.spCost;

    // Start cooldown
    this.skillCooldowns[skillId] = skill.cooldown;

    // Apply skill effects
    switch(skill.type) {
      case 'damage':
        this.game.combat.attack(this.game.player, target, skill);
        break;
      case 'heal':
        this.game.player.currentHp = Math.min(
          this.game.player.maxHp,
          this.game.player.currentHp + skill.power
        );
        break;
      case 'buff':
        this.applyBuff(skill, target);
        break;
    }

    return true;
  }

  // ======================
  // SKILL PROGRESSION
  // ======================
  levelUpSkill(skillId) {
    if (this.game.player.skillPoints <= 0) return false;
    
    this.skillLevels[skillId] = (this.skillLevels[skillId] || 0) + 1;
    this.game.player.skillPoints--;
    return true;
  }

  getSkillPower(skillId) {
    const skill = this.game.data.skills[skillId];
    const level = this.skillLevels[skillId] || 1;
    return skill.basePower + (skill.powerPerLevel * (level - 1));
  }

  // ======================
  // COOLDOWN MANAGEMENT
  // ======================
  canUseSkill(skillId) {
    return !this.skillCooldowns[skillId] || this.skillCooldowns[skillId] <= 0;
  }

  update(deltaTime) {
    for (const skillId in this.skillCooldowns) {
      if (this.skillCooldowns[skillId] > 0) {
        this.skillCooldowns[skillId] -= deltaTime;
      }
    }
  }
}