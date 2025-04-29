class InventorySystem {
  constructor(game) {
    this.game = game;
    this.maxSlots = 40; // KO-style limit
    this.equipmentSlots = {
      // KO-Style
      weapon: null,
      armor: null,
      helmet: null,
      gloves: null,
      boots: null,
      // RO-Style
      accessory: [null, null], // Two slots
      card: [null, null, null, null] // Four card slots
    };
  }

  // ======================
  // ITEM MANAGEMENT
  // ======================
  addItem(item) {
    // RO-Style stacking
    if (item.stackable) {
      const stack = this.findStack(item.id);
      if (stack && stack.quantity < stack.maxStack) {
        stack.quantity++;
        return true;
      }
    }

    // KO-Style inventory limit
    if (this.getItemCount() >= this.maxSlots) {
      return false;
    }

    this.game.player.inventory.push(item);
    return true;
  }

  findStack(itemId) {
    return this.game.player.inventory.find(i => 
      i.id === itemId && i.stackable && i.quantity < i.maxStack
    );
  }

  getItemCount() {
    return this.game.player.inventory.reduce((count, item) => 
      count + (item.stackable ? 1 : item.quantity), 0);
  }

  // ======================
  // EQUIPMENT SYSTEM
  // ======================
  equip(item) {
    // Check requirements
    if (item.requiredLevel > this.game.player.level) return false;
    if (item.requiredJob && item.requiredJob !== this.game.player.job) return false;

    // Handle different slot types
    if (Array.isArray(this.equipmentSlots[item.slot])) {
      // RO-Style multi-slot (cards/accessories)
      const slots = this.equipmentSlots[item.slot];
      const emptySlot = slots.findIndex(s => !s);
      if (emptySlot !== -1) {
        slots[emptySlot] = item;
        this.applyItemStats(item);
        return true;
      }
    } else if (!this.equipmentSlots[item.slot]) {
      // KO-Style single slot
      this.equipmentSlots[item.slot] = item;
      this.applyItemStats(item);
      return true;
    }

    return false;
  }

  applyItemStats(item) {
    for (const stat in item.stats) {
      this.game.player.stats[stat] += item.stats[stat];
    }
  }

  // ======================
  // CRAFTING (RO-Style)
  // ======================
  craft(recipe) {
    // Check ingredients
    if (!this.hasIngredients(recipe.ingredients)) {
      return false;
    }

    // Remove ingredients
    recipe.ingredients.forEach(ing => {
      this.removeItem(ing.id, ing.amount);
    });

    // Add result
    this.addItem(recipe.result);
    return true;
  }

  hasIngredients(ingredients) {
    return ingredients.every(ing => 
      this.getItemQuantity(ing.id) >= ing.amount
    );
  }
}