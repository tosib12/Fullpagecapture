
const Premium = {
  KEY: "fullpagecapture_premium",

  async getStatus() {
    const data = await chrome.storage.local.get(this.KEY);
    const premium = data[this.KEY];

    if (!premium || !premium.expiresAt) {
      return {
        active: false,
        expiresAt: null
      };
    }

    const active = premium.expiresAt > Date.now();

    return {
      active,
      expiresAt: active ? premium.expiresAt : null
    };
  },

  async canUse(feature) {
    const status = await this.getStatus();

    if (!status.active) {
      return {
        allowed: false,
        reason: "premium_required"
      };
    }

    return {
      allowed: true,
      feature
    };
  },

  async activateForTesting(days = 7) {
    // Testing only — NOT secure for production.
    const expiresAt =
      Date.now() + days * 24 * 60 * 60 * 1000;

    await chrome.storage.local.set({
      [this.KEY]: {
        expiresAt,
        testMode: true
      }
    });

    return this.getStatus();
  },

  async deactivate() {
    await chrome.storage.local.remove(this.KEY);
    return this.getStatus();
  }
};

if (typeof globalThis !== "undefined") {
  globalThis.Premium = Premium;
}