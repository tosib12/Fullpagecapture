
const PREMIUM_PLANS = Object.freeze({
  yearly: {
    id: "yearly",
    name: "12 Months",
    priceUSD: 1.00,
    durationDays: 365
  },

  threeYear: {
    id: "three-year",
    name: "36 Months",
    priceUSD: 1.50,
    durationDays: 1095
  },

  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    priceUSD: 5.00,
    durationDays: null
  }
});

if (typeof globalThis !== "undefined") {
  globalThis.PREMIUM_PLANS = PREMIUM_PLANS;
}
