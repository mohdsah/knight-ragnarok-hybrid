class ChatSystem {
  constructor(game) {
    this.game = game;
    this.messages = [];
    this.channels = {
      global: [],
      party: [],
      clan: [],
      trade: []
    };
    this.lastMessageTime = {};
  }

  // ======================
  // MESSAGE HANDLING
  // ======================
  sendMessage(player, message, channel = 'global') {
    // Rate limiting
    const now = Date.now();
    if (now - (this.lastMessageTime[player.id] || 0) < 1000) {
      return false;
    }
    this.lastMessageTime[player.id] = now;

    // RO-Style: Format message
    const formatted = {
      sender: player.name,
      text: message,
      timestamp: now,
      channel,
      job: player.job,
      level: player.level
    };

    // KO-Style: Clan tags
    if (player.clan) {
      formatted.clan = this.game.clanSystem.clans[player.clan].name;
    }

    // Store message
    this.messages.push(formatted);
    this.channels[channel].push(formatted);

    // Trim old messages
    if (this.messages.length > 100) {
      this.messages.shift();
    }
    if (this.channels[channel].length > 50) {
      this.channels[channel].shift();
    }

    return true;
  }

  // ======================
  // SPECIAL COMMANDS
  // ======================
  handleCommand(player, command) {
    const args = command.slice(1).split(' ');
    switch(args[0]) {
      case 'party':
        if (args[1]) {
          this.sendMessage(player, args.slice(1).join(' '), 'party');
        }
        break;
      case 'clan':
        if (player.clan && args[1]) {
          this.sendMessage(player, args.slice(1).join(' '), 'clan');
        }
        break;
      case 'trade':
        this.sendMessage(player, args.slice(1).join(' '), 'trade');
        break;
      case 'me':
        this.sendEmote(player, args.slice(1).join(' '));
        break;
    }
  }

  // RO-Style: Emotes
  sendEmote(player, action) {
    this.sendMessage(player, `* ${player.name} ${action}`, 'global');
  }

  // ======================
  // NOTIFICATION SYSTEM
  // ======================
  notifySystem(message, type = 'info') {
    this.messages.push({
      system: true,
      text: message,
      type,
      timestamp: Date.now()
    });
  }
}