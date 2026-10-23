
const PREMIUM_KEY = "fullpagecapture_premium";

async function getPremiumStatus() {
  const result = await chrome.storage.local.get(PREMIUM_KEY);
  const premium = result[PREMIUM_KEY];

  if (!premium) {
    return { active: false, plan: null, expiresAt: null };
  }

  // Lifetime access has no expiry date.
  if (premium.plan === "lifetime" && premium.verified === true) {
    return { active: true, plan: "lifetime", expiresAt: null };
  }

  const active =
    premium.verified === true &&
    typeof premium.expiresAt === "number" &&
    premium.expiresAt > Date.now();

  return {
    active,
    plan: active ? premium.plan : null,
    expiresAt: active ? premium.expiresAt : null
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_PREMIUM_STATUS") {
    getPremiumStatus()
      .then(sendResponse)
      .catch(() => sendResponse({ active: false, plan: null, expiresAt: null }));

    return true;
  }
});
