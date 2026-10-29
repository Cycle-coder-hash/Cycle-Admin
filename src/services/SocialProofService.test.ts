if (!import.meta.env) {
  (import.meta as any).env = { DEV: true };
}

async function run() {
  const {
    normalizeAdminSocialProofEntry,
    mapBadgeToLegacy,
    mapBadgeToManual,
  } = await import("./SocialProofService");

  console.log("Running standalone Admin Operations Console Social Proof tests...");

  // Test 1: mapBadgeToManual
  if (mapBadgeToManual("PRO") !== "pro") throw new Error("mapBadgeToManual PRO failed");
  if (mapBadgeToManual("PREMIUM") !== "premium") throw new Error("mapBadgeToManual PREMIUM failed");
  if (mapBadgeToManual("STUDENT") !== "none") throw new Error("mapBadgeToManual STUDENT failed");
  if (mapBadgeToManual("FREE") !== "none") throw new Error("mapBadgeToManual FREE failed");
  console.log("✓ Test 1: mapBadgeToManual passed");

  // Test 2: mapBadgeToLegacy
  if (mapBadgeToLegacy("pro") !== "PRO") throw new Error("mapBadgeToLegacy pro failed");
  if (mapBadgeToLegacy("premium") !== "PREMIUM") throw new Error("mapBadgeToLegacy premium failed");
  if (mapBadgeToLegacy("none") !== "FREE") throw new Error("mapBadgeToLegacy none failed");
  console.log("✓ Test 2: mapBadgeToLegacy passed");

  // Test 3: Normalization of x_neuron from Admin Console
  const rawAdmin = {
    id: "sp_x_neuron_999",
    name: "x_neuron",
    avatarUrl: "https://example.com/avatar.png",
    badge: "PRO" as const,
    reviewText: "Great journal",
    hasConsent: true,
    isActive: true,
    order: 1,
  };

  const norm = normalizeAdminSocialProofEntry(rawAdmin);
  if (norm.name !== "x_neuron") throw new Error("Name mismatch");
  if (norm.hasConsent !== true || norm.isConsentConfirmed !== true) throw new Error("Consent mismatch");
  if (norm.photoUrl !== "https://example.com/avatar.png" || norm.avatarUrl !== "https://example.com/avatar.png") throw new Error("Avatar mismatch");
  if (norm.reviewText !== "Great journal" || norm.testimonialQuote !== "Great journal") throw new Error("Review mismatch");
  if (norm.manualBadge !== "pro" || norm.badge !== "PRO") throw new Error("Badge mismatch");
  if (norm.order !== 1 || norm.displayOrder !== 1) throw new Error("Order mismatch");
  if (norm.role !== "Trader") throw new Error("Default role mismatch");
  console.log("✓ Test 3: normalizeAdminSocialProofEntry passed");

  // Test 4: Missing consent is NEVER treated as true
  const noConsent = normalizeAdminSocialProofEntry({
    name: "No Consent",
    isActive: true,
  });
  if (noConsent.hasConsent !== false || noConsent.isConsentConfirmed !== false) {
    throw new Error("Missing consent was incorrectly treated as true!");
  }
  console.log("✓ Test 4: Missing consent strictly defaults to false passed");

  console.log("All standalone Admin Console tests passed successfully!");
}

run().catch((err) => {
  console.error(err);
  throw err;
});
