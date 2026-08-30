/**
 * KOYO Perfume Atelier - Formula Calculation Engine (10ml Bottle Specialist)
 * Pure volume-based calculations (mL and drops).
 *
 * Calibration:
 * 1 drop = 0.05 mL
 * 40 drops = 2.0 mL Oil (20% conc) + 8.0 mL Ethanol = 10.0 mL Total
 * 60 drops = 3.0 mL Oil (30% conc) + 7.0 mL Ethanol = 10.0 mL Total
 * 80 drops = 4.0 mL Oil (40% conc) + 6.0 mL Ethanol = 10.0 mL Total
 */

class FormulaEngine {
  constructor() {
    this.mlPerDrop = 0.05; // 20 drops = 1.0 mL
    this.bottleSizeMl = 10.0;
  }

  /**
   * Analyze current formula drops
   * @param {Object} dropsMap - e.g. { 'fresh-citrus': 12, 'pineapple': 14, ... }
   * @param {string} concentrationId - 'airy' (40), 'balanced' (60), 'intense' (80)
   * @param {string|null} selectedReadyMadeId - if a ready-made oil is active
   */
  analyzeFormula(dropsMap, concentrationId = "balanced", selectedReadyMadeId = null) {
    const activeDrops = {};
    let totalDrops = 0;

    for (const [key, count] of Object.entries(dropsMap)) {
      const drops = Math.max(0, parseInt(count) || 0);
      if (drops > 0) {
        activeDrops[key] = drops;
        totalDrops += drops;
      }
    }

    // Role breakdown weights
    let topDrops = 0;
    let heartDrops = 0;
    let baseDrops = 0;

    const accordBreakdown = [];

    for (const [key, count] of Object.entries(activeDrops)) {
      const accord = ACCORDS_DATA.find((a) => a.id === key);
      const readyMade = READY_MADE_OILS.find((r) => r.id === key || (selectedReadyMadeId && r.id === selectedReadyMadeId && key === selectedReadyMadeId));

      let name = accord ? accord.name : (readyMade ? `${readyMade.title} (Premixed Oil)` : key);
      let role = accord ? accord.role : "BALANCED";
      let family = accord ? accord.family : "Premixed Ready Oil";
      let color = accord ? accord.color : "#d4af37";

      const pctOfOil = totalDrops > 0 ? (count / totalDrops) * 100 : 0;
      const volumeMl = count * this.mlPerDrop;

      accordBreakdown.push({
        id: key,
        name,
        role,
        family,
        color,
        drops: count,
        percentage: pctOfOil,
        volumeMl: Math.round(volumeMl * 100) / 100
      });

      // Role distribution
      if (accord) {
        if (accord.role === "TOP") {
          topDrops += count;
        } else if (accord.role === "TOP/HEART") {
          topDrops += count * 0.5;
          heartDrops += count * 0.5;
        } else if (accord.role === "HEART") {
          heartDrops += count;
        } else if (accord.role === "HEART/BASE") {
          heartDrops += count * 0.5;
          baseDrops += count * 0.5;
        } else if (accord.role === "BASE") {
          baseDrops += count;
        }
      } else {
        // Ready-made oil is pre-blended across the pyramid
        topDrops += count * 0.25;
        heartDrops += count * 0.35;
        baseDrops += count * 0.40;
      }
    }

    const topPct = totalDrops > 0 ? Math.round((topDrops / totalDrops) * 100) : 0;
    const heartPct = totalDrops > 0 ? Math.round((heartDrops / totalDrops) * 100) : 0;
    const basePct = totalDrops > 0 ? Math.max(0, 100 - topPct - heartPct) : 0;

    // Exact Calibrated Oil Volume & Concentration in 10ml Bottle
    const totalOilVolumeMl = Math.round(totalDrops * this.mlPerDrop * 100) / 100;
    const concentrationPercent = Math.min(100, Math.round((totalOilVolumeMl / this.bottleSizeMl) * 1000) / 10);
    const ethanolVolumeMl = Math.max(0, Math.round((this.bottleSizeMl - totalOilVolumeMl) * 100) / 100);

    // Target drops for selected profile (only 3 modes: airy=40, balanced=60, intense=80)
    const profile = CONCENTRATION_PROFILES.find((p) => p.id === concentrationId) || CONCENTRATION_PROFILES[1];
    const targetDrops = profile.targetDrops;
    const capacityPct = Math.min(150, Math.round((totalDrops / targetDrops) * 100));

    // Diagnostics & Guidance
    const diagnostics = this.evaluateBalance(topPct, heartPct, basePct, totalDrops, targetDrops, accordBreakdown);

    return {
      totalDrops,
      targetDrops,
      capacityPct,
      activeCount: Object.keys(activeDrops).length,
      accordBreakdown,
      topPct,
      heartPct,
      basePct,
      topDrops: Math.round(topDrops * 10) / 10,
      heartDrops: Math.round(heartDrops * 10) / 10,
      baseDrops: Math.round(baseDrops * 10) / 10,
      totalOilVolumeMl,
      ethanolVolumeMl,
      concentrationPercent,
      diagnostics
    };
  }

  /**
   * Auto-Balance / Scale current formula to target total drops without altering proportions
   */
  normalizeToTarget(dropsMap, targetTotalDrops = 60) {
    const currentTotal = Object.values(dropsMap).reduce((sum, d) => sum + (parseInt(d) || 0), 0);
    if (currentTotal === 0 || targetTotalDrops <= 0) return { ...dropsMap };

    const ratio = targetTotalDrops / currentTotal;
    const newDrops = {};
    let scaledSum = 0;

    const entries = Object.entries(dropsMap).filter(([_, v]) => v > 0);
    entries.forEach(([id, count]) => {
      const scaled = Math.max(1, Math.round(count * ratio));
      newDrops[id] = scaled;
      scaledSum += scaled;
    });

    // Adjust any rounding delta on highest accord
    const delta = targetTotalDrops - scaledSum;
    if (delta !== 0 && entries.length > 0) {
      const highestAccord = entries.sort((a, b) => b[1] - a[1])[0][0];
      newDrops[highestAccord] = Math.max(1, newDrops[highestAccord] + delta);
    }

    return newDrops;
  }

  /**
   * Perfumer Diagnostics without hours
   */
  evaluateBalance(topPct, heartPct, basePct, totalDrops, targetDrops, breakdown) {
    if (totalDrops === 0) {
      return {
        status: "empty",
        title: "Awaiting Your First Drops",
        message: `Add accords from the list or select a ready oil. Aim for ~${targetDrops} total drops for this profile in your 10ml bottle.`,
        tip: "Rule of thumb: 15 drops Top, 20 drops Heart, 25 drops Base.",
        badge: "Empty Lab",
        badgeClass: "badge-neutral"
      };
    }

    if (totalDrops < targetDrops * 0.65) {
      const remaining = targetDrops - totalDrops;
      return {
        status: "under",
        title: `🌱 Light Formulation (${totalDrops} / ${targetDrops} drops)`,
        message: `Currently at ${totalDrops} drops (${Math.round(totalDrops * 0.05 * 10) / 10} mL). Add ${remaining} more drops of heart or base notes to reach ${targetDrops} drops (${Math.round(targetDrops * 0.5)}% concentration).`,
        tip: "Consider adding White Musk or Galaxolide for room-filling presence.",
        badge: "Light Dose",
        badgeClass: "badge-warning"
      };
    }

    if (totalDrops > targetDrops * 1.15) {
      return {
        status: "over",
        title: `⚠️ Rich Concentration (${totalDrops} / ${targetDrops} drops)`,
        message: `Your formula has ${totalDrops} drops (${Math.round(totalDrops * 0.05 * 10) / 10} mL oil · ${Math.round(totalDrops * 0.5)}% concentration). Click 'Auto-Balance to Target' to scale ratios smoothly back to ${targetDrops} drops!`,
        tip: "Auto-balancing scales your formula without changing your scent ratios.",
        badge: "Rich Dose",
        badgeClass: "badge-gold"
      };
    }

    if (topPct > 45) {
      return {
        status: "top-heavy",
        title: "⚡ Sparkling & Radiant Opening",
        message: `High top note ratio (~${topPct}%). Your fragrance will burst with energetic sparkle when first sprayed.`,
        tip: "Add 4–6 drops of Ethylene Brassylate or White Musk to anchor the fresh opening.",
        badge: "High Radiance",
        badgeClass: "badge-accent"
      };
    }

    if (basePct > 55) {
      return {
        status: "base-heavy",
        title: "🔥 Deep, Warm & Long-Lasting",
        message: `Base note rich (~${basePct}%). Deeply tenacious with great staying power that sits close and velvety on skin.`,
        tip: "Add 3–5 drops of Fresh Citrus or Pineapple for an inviting fresh lift.",
        badge: "Deep Tenacity",
        badgeClass: "badge-gold"
      };
    }

    if (heartPct > 45) {
      return {
        status: "heart-dominant",
        title: "🌸 Opulent Floral & Sweet Body",
        message: `Heart note dominant (~${heartPct}%). Rich character with beautiful sillage that blooms after spraying.`,
        tip: "Pair with clean musks to give your floral/gourmand accords a soft cloud halo.",
        badge: "Rich Sillage",
        badgeClass: "badge-emerald"
      };
    }

    return {
      status: "balanced",
      title: "✨ Master Perfumer Harmonious Arch",
      message: `Ideal balance: ${topPct}% Top, ${heartPct}% Heart, ${basePct}% Base. Highly versatile, structured, and long-lasting on skin.`,
      tip: "Your formula is in perfect harmony! Ready for the recipe sheet.",
      badge: "Harmonious",
      badgeClass: "badge-success"
    };
  }
}
