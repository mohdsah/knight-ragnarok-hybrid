class ClanSystem {
  constructor(game) {
    this.game = game;
    this.clans = {};
    this.clanWar = null;
  }

  // ======================
  // CLAN MANAGEMENT
  // ======================
  createClan(name, leader) {
    const clanId = `clan_${Date.now()}`;
    this.clans[clanId] = {
      id: clanId,
      name,
      leader: leader.id,
      members: [leader.id],
      level: 1,
      reputation: 0,
      treasury: 0,
      skills: {}
    };
    leader.clan = clanId;
    return clanId;
  }

  joinClan(player, clanId) {
    if (!this.clans[clanId] || player.clan) return false;
    
    this.clans[clanId].members.push(player.id);
    player.clan = clanId;
    return true;
  }

  // ======================
  // CLAN WARS (KO-Style)
  // ======================
  declareWar(clanId, targetClanId) {
    if (this.clanWar) return false;

    this.clanWar = {
      attacker: clanId,
      defender: targetClanId,
      startTime: Date.now(),
      duration: 3600000, // 1 hour
      score: { [clanId]: 0, [targetClanId]: 0 }
    };
    return true;
  }

  updateWarScore(clanId, points) {
    if (!this.clanWar || !this.clanWar.score[clanId]) return;
    
    this.clanWar.score[clanId] += points;
    
    // Check for victory
    if (this.clanWar.score[clanId] >= 1000) {
      this.endWar(clanId);
    }
  }

  // ======================
  // CLAN SKILLS
  // ======================
  unlockClanSkill(clanId, skillId) {
    const clan = this.clans[clanId];
    if (!clan || clan.skills[skillId]) return false;
    
    clan.skills[skillId] = 1;
    return true;
  }

  getClanBonus(player, bonusType) {
    const clan = this.clans[player.clan];
    if (!clan) return 0;

    let bonus = 0;
    // KO-Style: Basic clan level bonus
    bonus += clan.level * 0.01;
    
    // RO-Style: Clan skill bonuses
    if (clan.skills['exp_bonus']) {
      bonus += 0.05 * clan.skills['exp_bonus'];
    }

    return bonus;
  }
}