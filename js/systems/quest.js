class QuestSystem {
  constructor(game) {
    this.game = game;
    this.activeQuests = [];
    this.completedQuests = [];
  }

  // ======================
  // QUEST MANAGEMENT
  // ======================
  startQuest(questId) {
    const quest = this.game.data.quests.find(q => q.id === questId);
    if (!quest || this.activeQuests.some(q => q.id === questId)) {
      return false;
    }

    // KO-Style: Check level requirements
    if (quest.minLevel > this.game.player.level) {
      return false;
    }

    // RO-Style: Check prerequisite quests
    if (quest.requires && !quest.requires.every(id => 
      this.completedQuests.some(q => q.id === id))
    {
      return false;
    }

    this.activeQuests.push({
      ...quest,
      progress: this.createProgress(quest)
    });

    return true;
  }

  createProgress(quest) {
    // Initialize progress based on objectives
    return quest.objectives.map(obj => ({
      type: obj.type,
      target: obj.target,
      current: 0,
      required: obj.amount
    }));
  }

  // ======================
  // PROGRESS TRACKING
  // ======================
  onEnemyDefeated(enemy) {
    this.activeQuests.forEach(quest => {
      quest.progress.forEach(prog => {
        if (prog.type === 'kill' && prog.target === enemy.type) {
          prog.current++;
          this.checkCompletion(quest);
        }
      });
    });
  }

  onItemCollected(itemId) {
    this.activeQuests.forEach(quest => {
      quest.progress.forEach(prog => {
        if (prog.type === 'collect' && prog.target === itemId) {
          prog.current++;
          this.checkCompletion(quest);
        }
      });
    });
  }

  checkCompletion(quest) {
    if (quest.progress.every(prog => prog.current >= prog.required)) {
      this.completeQuest(quest.id);
    }
  }

  // ======================
  // REWARDS
  // ======================
  completeQuest(questId) {
    const index = this.activeQuests.findIndex(q => q.id === questId);
    if (index === -1) return false;

    const quest = this.activeQuests[index];
    
    // RO-Style: Give rewards
    if (quest.rewards.exp) {
      this.game.player.gainExp(quest.rewards.exp);
    }
    if (quest.rewards.gold) {
      this.game.player.gold += quest.rewards.gold;
    }
    quest.rewards.items?.forEach(item => {
      this.game.inventory.addItem(item);
    });

    // KO-Style: Unlock features
    quest.rewards.unlocks?.forEach(unlock => {
      this.game.unlockSystem.unlock(unlock);
    });

    this.completedQuests.push(quest);
    this.activeQuests.splice(index, 1);
    return true;
  }
}