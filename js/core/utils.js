class GameUtils {
  // ======================
  // MATH UTILITIES
  // ======================
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  static angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  // ======================
  // COLOR UTILITIES
  // ======================
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  static rgbToHex(r, g, b) {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }

  // ======================
  // GAME-SPECIFIC UTILS
  // ======================
  static calculateDamage(attacker, target, skill) {
    // KO-style physical damage calculation
    const baseDamage = attacker.stats.str * (skill?.power || 1);
    const defenseReduction = target.stats.vit * 0.5;
    let damage = Math.max(1, baseDamage - defenseReduction);

    // RO-style critical chance
    if (Math.random() < (attacker.stats.dex * 0.01)) {
      damage *= GameConfig.combat.ko.critMultiplier;
      return { damage, isCritical: true };
    }

    return { damage, isCritical: false };
  }

  static generateLootTable(enemyType) {
    // RO-style drop system with KO-style high-value drops
    const drops = {
      slime: [
        { id: 301, chance: 0.3 }, // Health Potion
        { id: 402, chance: 0.1 }  // Jellopy (RO)
      ],
      orc: [
        { id: 101, chance: 0.05 }, // Gladius (KO)
        { id: 201, chance: 0.02 }  // Plate Armor (KO)
      ]
    };

    return drops[enemyType]?.filter(item => Math.random() < item.chance) || [];
  }

  // ======================
  // SAVE/LOAD UTILITIES
  // ======================
  static saveGame(key, data) {
    try {
      localStorage.setItem(`knightragnarok_${key}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  static loadGame(key) {
    try {
      const data = localStorage.getItem(`knightragnarok_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  // ======================
  // UI UTILITIES
  // ======================
  static createProgressBar(current, max, width = 200, height = 20) {
    const percent = GameUtils.clamp(current / max, 0, 1);
    return {
      background: `rgba(0,0,0,0.5)`,
      foreground: `linear-gradient(to right, #e74c3c, #f39c12 ${percent * 100}%, transparent ${percent * 100}%)`,
      width,
      height,
      text: `${Math.floor(current)}/${max}`
    };
  }

  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

// Additional helper functions
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export { GameUtils, throttle };