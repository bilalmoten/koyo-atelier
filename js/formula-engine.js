/**
 * KOYO Perfume Atelier - Formula Calculation Engine (10ml Pure Perfume Oil Edition)
 * Pure fragrance oil calculations: Drops & Precision Scale Grams (No ethanol / alcohol).
 *
 * Calibration:
 * Average drop = 0.035 grams (~0.04 mL)
 * 100 drops = ~3.50 grams (1 drop = 1.0% of formula)
 * Strict Single Category Pyramid: TOP, HEART, BASE.
 */

class FormulaEngine {
  constructor() {
    this.gramsPerDropDefault = 0.035; // Standard pipette drop of fragrance oil ~0.035g
    this.bottleSizeMl = 10.0;
  }

  /**
   * Analyze bottle formula drops
   * @param {Object} dropsMap - e.g. { 'fresh-citrus': 15, 'oud': 10, ... }
   * @param {number} targetDrops - default 100
   * @param {string|null} selectedReadyMadeId - optional ready-made oil ID
   */
  analyzeFormula(dropsMap, targetDrops = 100, selectedReadyMadeId = null) {
    const activeDrops = {};
    let totalDrops = 0;
    let totalGrams = 0;

    for (const [key, count] of Object.entries(dropsMap || {})) {
      const drops = Math.max(0, parseInt(count) || 0);
      if (drops > 0) {
        activeDrops[key] = drops;
        totalDrops += drops;
      }
    }

    let topDrops = 0;
    let heartDrops = 0;
    let baseDrops = 0;

    const accordBreakdown = [];

    for (const [key, count] of Object.entries(activeDrops)) {
      const accord = ACCORDS_DATA.find((a) => a.id === key);
      const readyMade = READY_MADE_OILS.find((r) => r.id === key || (selectedReadyMadeId && r.id === selectedReadyMadeId && key === selectedReadyMadeId));

      const name = accord ? accord.name : (readyMade ? `${readyMade.title} (Premixed Oil)` : key);
      const role = accord ? accord.role : "BALANCED";
      const roleLabel = accord ? accord.roleLabel : "READY-MADE OIL";
      const family = accord ? accord.family : "Premixed Ready Oil";
      const color = accord ? accord.color : "#d4af37";
      const density = accord && accord.densityGramsPerDrop ? accord.densityGramsPerDrop : this.gramsPerDropDefault;

      const pctOfOil = totalDrops > 0 ? (count / totalDrops) * 100 : 0;
      const grams = Math.round(count * density * 100) / 100;
      totalGrams += grams;

      accordBreakdown.push({
        id: key,
        name,
        role,
        roleLabel,
        family,
        color,
        drops: count,
        percentage: Math.round(pctOfOil * 10) / 10,
        grams: grams
      });

      // Strict single category accumulation
      if (accord) {
        if (accord.role === "TOP") {
          topDrops += count;
        } else if (accord.role === "HEART") {
          heartDrops += count;
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

    totalGrams = Math.round(totalGrams * 100) / 100;

    // Pyramid Percentages
    const topPct = totalDrops > 0 ? Math.round((topDrops / totalDrops) * 100) : 0;
    const heartPct = totalDrops > 0 ? Math.round((heartDrops / totalDrops) * 100) : 0;
    const basePct = totalDrops > 0 ? Math.max(0, 100 - topPct - heartPct) : 0;

    // Fill Progress relative to target
    const fillPercent = targetDrops > 0 ? Math.min(100, Math.round((totalDrops / targetDrops) * 100)) : 0;

    // Perfumer Diagnostic & Suggestions
    const diagnostic = this.generateDiagnostic(topPct, heartPct, basePct, totalDrops, targetDrops, activeDrops);

    return {
      totalDrops,
      targetDrops,
      fillPercent,
      totalGrams,
      topDrops: Math.round(topDrops),
      heartDrops: Math.round(heartDrops),
      baseDrops: Math.round(baseDrops),
      topPct,
      heartPct,
      basePct,
      accordBreakdown,
      diagnostic
    };
  }

  /**
   * Compare two bottles to show exact tweaks (Bottle 1 vs Bottle 2)
   */
  compareBottles(bottle1Drops, bottle2Drops) {
    const allKeys = new Set([
      ...Object.keys(bottle1Drops || {}),
      ...Object.keys(bottle2Drops || {})
    ]);

    const tweaks = [];
    let hasChanges = false;

    for (const key of allKeys) {
      const b1 = parseInt(bottle1Drops[key]) || 0;
      const b2 = parseInt(bottle2Drops[key]) || 0;
      const diff = b2 - b1;

      if (b1 > 0 || b2 > 0) {
        const accord = ACCORDS_DATA.find((a) => a.id === key);
        const name = accord ? accord.name : key;
        const color = accord ? accord.color : "#d4af37";
        const role = accord ? accord.role : "";

        let status = "same";
        if (b1 === 0 && b2 > 0) status = "added";
        else if (b1 > 0 && b2 === 0) status = "removed";
        else if (diff > 0) status = "increased";
        else if (diff < 0) status = "decreased";

        if (diff !== 0) hasChanges = true;

        tweaks.push({
          id: key,
          name,
          role,
          color,
          b1Drops: b1,
          b2Drops: b2,
          diff: diff,
          diffFormatted: diff > 0 ? `+${diff}` : `${diff}`,
          status
        });
      }
    }

    // Sort tweaks: changed items first
    tweaks.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    return {
      hasChanges,
      tweaks
    };
  }

  /**
   * Generate Perfumer Diagnostic Advice for 100% Perfume Oil
   */
  generateDiagnostic(topPct, heartPct, basePct, totalDrops, targetDrops, activeDrops) {
    if (totalDrops === 0) {
      return {
        title: "✨ Begin Crafting Your 10ml Perfume Oil",
        desc: "Add drops from Top, Heart, or Base notes. Ideal master ratio: ~20% Top, ~35% Heart, ~45% Base.",
        status: "neutral"
      };
    }

    if (totalDrops < targetDrops * 0.4) {
      return {
        title: `🌱 Building Formula (${totalDrops}/${targetDrops} Drops)`,
        desc: "Good start! Continue building your accords to reach your target 10ml bottle volume.",
        status: "building"
      };
    }

    // Check for fixative musks
    const hasMusk = (activeDrops["white-musk"] || 0) + (activeDrops["galaxolide"] || 0) + (activeDrops["ethylene-brassylate"] || 0) + (activeDrops["iso-e-super"] || 0);

    if (hasMusk < 10) {
      return {
        title: "💡 Perfumer Tip: Boost Longevity with Musks & Iso E Super",
        desc: "In pure perfume oil, musks and Iso E Super prevent rapid evaporation and create an all-day luxury skin trail.",
        status: "warning"
      };
    }

    // Check Pyramid Balance
    if (topPct > 45) {
      return {
        title: "⚡ High Top-Note Opening",
        desc: "Your opening will be sparkling and vibrant, but might fade into the base quickly. Consider adding 5–10 drops of Heart florals or Base woods.",
        status: "caution"
      };
    }

    if (basePct > 65) {
      return {
        title: "🔥 Deep Resinous Heavy Base",
        desc: "Very rich, warm, and tenacious! If it feels too dense, lift it with a few drops of Fresh Citrus, Pineapple, or Hedione for radiant projection.",
        status: "caution"
      };
    }

    if (heartPct < 15 && totalDrops > 50) {
      return {
        title: "🌸 Missing Floral / Heart Body",
        desc: "Top and Base are strong, but the blend lacks a middle bridge. Consider 6–10 drops of Rose Honey, White Floral, or Hedione.",
        status: "caution"
      };
    }

    // Balanced
    return {
      title: "👑 Master Olfactory Balance Achieved",
      desc: `Harmonious pure oil distribution (${topPct}% Top · ${heartPct}% Heart · ${basePct}% Base). Ready for bottling & testing!`,
      status: "perfect"
    };
  }
}
