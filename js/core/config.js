const GameConfig = {
  // Core settings
  version: "1.0.0",
  debugMode: true,
  online: false,
  hybridMode: true, // Blend KO and RO features

  // Display settings
  resolution: {
    width: 1280,
    height: 720,
    fullscreen: false,
    scaleMode: "FIT" // FIT, FILL, STRETCH
  },

  // Physics
  physics: {
    gravity: 9.8,
    collisionPrecision: 2,
    knockbackMultiplier: 1.5
  },

  // Combat balance
  combat: {
    // KO-style parameters
    ko: {
      meleeRange: 1.2,
      comboWindow: 0.5, // seconds
      critMultiplier: 2.0
    },

    // RO-style parameters
    ro: {
      castTimeReduction: 0.05, // per DEX point
      fleeThreshold: 0.8,
      elementAdvantage: 1.3
    }
  },

  // Paths
  paths: {
    assets: "./assets",
    saves: "./saves",
    logs: "./logs"
  },

  // Hybrid-specific settings
  hybrid: {
    jobSystem: "RO", // RO, KO, or HYBRID
    pvpMode: "KO",   // KO-style PvP
    guildSystem: "HYBRID",
    dropSystem: "RO"
  },

  // Debug settings
  debug: {
    showHitboxes: true,
    logPhysics: false,
    godMode: false,
    unlimitedMana: false
  },

  // Initialize with custom settings
  init(customConfig = {}) {
    return Object.assign({}, this, customConfig);
  }
};

// Example of platform-specific config
if (typeof cordova !== 'undefined') {
  GameConfig.resolution.width = window.screen.width;
  GameConfig.resolution.height = window.screen.height;
  GameConfig.resolution.fullscreen = true;
  GameConfig.mobile = true;
}

export default GameConfig;