/**
 * KOYO Perfume Atelier - Main Application Controller (10ml Pure Perfume Oil Edition)
 * Workflow: 2 x 10ml Bottles per person (Bottle 1 Initial Formulation -> Tweak -> Bottle 2)
 * Pure Oil Only (No ethanol/alcohol). Dual Drops & Precision Scale (Grams) tracking.
 */

class KoyoApp {
  constructor() {
    this.engine = new FormulaEngine();
    this.labelEngine = null;

    // Navigation & View
    this.currentTab = "accords";
    this.currentFilter = "all";
    this.inputMode = "drops"; // 'drops' | 'scale'
    this.hideZeroDrops = false;

    // Dual 10ml Bottle Workshop State
    this.activeBottle = 1;
    this.bottles = {
      1: {
        id: 1,
        name: "L'ÉTOILE NOIRE",
        creator: "WORKSHOP GUEST",
        targetDrops: 100,
        drops: { ...STARTING_PRESETS[0].drops },
        notes: ""
      },
      2: {
        id: 2,
        name: "L'ÉTOILE NOIRE (ELIXIR)",
        creator: "WORKSHOP GUEST",
        targetDrops: 100,
        drops: {},
        notes: ""
      }
    };

    this.studentNotes = {};
    this.activeReadyMade = null;

    this.loadState();
    this.init();
  }

  init() {
    // Initialize Label Engine
    const canvas = document.getElementById("labelCanvas");
    if (canvas) {
      this.labelEngine = new LabelCanvasEngine(canvas);
    }

    this.renderAccords();
    this.renderReadyMades();
    this.renderPresets();
    this.renderLabSteppers();
    this.renderTargetSelectors();
    this.updateAllCalculations();
    this.setupEventListeners();
    this.setupQRModal();
    this.setupMobileDrawer();

    if (document.fonts) {
      document.fonts.ready.then(() => {
        this.updateLabel();
      });
    }
  }

  // -------------------------------------------------------------
  // STATE MANAGEMENT & LOCAL STORAGE
  // -------------------------------------------------------------
  loadState() {
    try {
      const savedBottles = localStorage.getItem("koyo_oil_bottles");
      if (savedBottles) {
        const parsed = JSON.parse(savedBottles);
        if (parsed[1] && parsed[2]) {
          this.bottles = parsed;
        }
      }

      const savedActive = localStorage.getItem("koyo_active_bottle");
      if (savedActive && (savedActive === "1" || savedActive === "2")) {
        this.activeBottle = parseInt(savedActive);
      }

      const savedNotes = localStorage.getItem("koyo_student_notes");
      if (savedNotes) this.studentNotes = JSON.parse(savedNotes);

      const savedMode = localStorage.getItem("koyo_input_mode");
      if (savedMode && ["drops", "scale"].includes(savedMode)) {
        this.inputMode = savedMode;
      }
    } catch (e) {
      console.warn("Could not load state from localStorage:", e);
    }
  }

  saveState() {
    try {
      localStorage.setItem("koyo_oil_bottles", JSON.stringify(this.bottles));
      localStorage.setItem("koyo_active_bottle", String(this.activeBottle));
      localStorage.setItem("koyo_student_notes", JSON.stringify(this.studentNotes));
      localStorage.setItem("koyo_input_mode", this.inputMode);
    } catch (e) {
      console.warn("Could not save state to localStorage:", e);
    }
  }

  getActiveBottle() {
    return this.bottles[this.activeBottle];
  }

  // -------------------------------------------------------------
  // DUAL BOTTLE CONTROLS (Bottle 1 vs Bottle 2)
  // -------------------------------------------------------------
  switchBottle(num) {
    if (num !== 1 && num !== 2) return;
    this.activeBottle = num;

    // Update active button styles
    document.querySelectorAll(".bottle-switch-btn").forEach((btn) => {
      btn.classList.toggle("active", parseInt(btn.dataset.bottle) === num);
    });

    // Sync input fields in Label studio
    const b = this.getActiveBottle();
    const inputName = document.getElementById("inputPerfumeName");
    if (inputName) inputName.value = b.name;
    const inputCreator = document.getElementById("inputCreatorName");
    if (inputCreator) inputCreator.value = b.creator;

    this.renderLabSteppers();
    this.updateAllCalculations();
    this.updateLabel();
    this.renderRecipe();
    this.saveState();

    this.showToast(`Switched to Bottle #${num} (${b.name})`);
  }

  copyBottle1ToBottle2() {
    // Clone Bottle 1 into Bottle 2
    const b1 = this.bottles[1];
    this.bottles[2].drops = { ...b1.drops };
    this.bottles[2].targetDrops = b1.targetDrops;
    if (!this.bottles[2].name || this.bottles[2].name === "L'ÉTOILE NOIRE (ELIXIR)") {
      this.bottles[2].name = `${b1.name} (TWEAKED)`;
    }

    this.switchBottle(2);
    this.showToast("✨ Cloned Bottle 1 into Bottle 2! Now tweak your drops to refine the scent.");
  }

  setInputMode(mode) {
    if (mode !== "drops" && mode !== "scale") return;
    this.inputMode = mode;

    document.querySelectorAll(".mode-toggle-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    this.renderLabSteppers();
    this.saveState();
  }

  // -------------------------------------------------------------
  // ACCORD SELECTION & FORMULA MODIFICATIONS
  // -------------------------------------------------------------
  changeDrops(accordId, delta) {
    const b = this.getActiveBottle();
    const current = parseInt(b.drops[accordId]) || 0;
    const next = Math.max(0, current + delta);

    if (next === 0) {
      delete b.drops[accordId];
    } else {
      b.drops[accordId] = next;
    }

    this.updateAccordStepperCount(accordId, next);
    this.updateAllCalculations();
    this.saveState();
  }

  setDropsDirect(accordId, value) {
    const b = this.getActiveBottle();
    const next = Math.max(0, parseInt(value) || 0);
    if (next === 0) {
      delete b.drops[accordId];
    } else {
      b.drops[accordId] = next;
    }

    this.updateAccordStepperCount(accordId, next);
    this.updateAllCalculations();
    this.saveState();
  }

  setGramsDirect(accordId, gramsValue) {
    const accord = ACCORDS_DATA.find((a) => a.id === accordId);
    const density = accord && accord.densityGramsPerDrop ? accord.densityGramsPerDrop : 0.035;
    const grams = Math.max(0, parseFloat(gramsValue) || 0);
    const drops = Math.round(grams / density);

    this.setDropsDirect(accordId, drops);
  }

  clearActiveFormula() {
    if (confirm(`Reset all accord drops for Bottle #${this.activeBottle}?`)) {
      this.getActiveBottle().drops = {};
      this.renderLabSteppers();
      this.updateAllCalculations();
      this.saveState();
      this.showToast(`Cleared Bottle #${this.activeBottle}`);
    }
  }

  autoBalanceFormula() {
    const b = this.getActiveBottle();
    const target = b.targetDrops || 100;
    const currentTotal = Object.values(b.drops).reduce((a, b) => a + (parseInt(b) || 0), 0);

    if (currentTotal === 0) {
      this.showToast("Add some drops first before auto-balancing!");
      return;
    }

    const ratio = target / currentTotal;
    const newDrops = {};
    let runningTotal = 0;

    const entries = Object.entries(b.drops).sort((a, b) => b[1] - a[1]);
    entries.forEach(([id, count], idx) => {
      if (idx === entries.length - 1) {
        newDrops[id] = Math.max(1, target - runningTotal);
      } else {
        const scaled = Math.max(1, Math.round(count * ratio));
        newDrops[id] = scaled;
        runningTotal += scaled;
      }
    });

    b.drops = newDrops;
    this.renderLabSteppers();
    this.updateAllCalculations();
    this.saveState();
    this.showToast(`Auto-balanced Bottle #${this.activeBottle} to ${target} drops!`);
  }

  loadPreset(presetId) {
    const preset = STARTING_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const b = this.getActiveBottle();
    b.drops = { ...preset.drops };
    b.targetDrops = preset.defaultTarget || 100;
    b.name = preset.title.toUpperCase();

    this.renderLabSteppers();
    this.updateAllCalculations();
    this.switchTab("lab");
    this.saveState();
    this.showToast(`Loaded "${preset.title}" into Bottle #${this.activeBottle}`);
  }

  loadReadyMadeOil(oilId) {
    const oil = READY_MADE_OILS.find((o) => o.id === oilId);
    if (!oil) return;

    const b = this.getActiveBottle();
    b.drops = { [oilId]: 80, "white-musk": 10, "hedione": 10 };
    b.targetDrops = 100;
    b.name = oil.title.toUpperCase();

    this.renderLabSteppers();
    this.updateAllCalculations();
    this.switchTab("lab");
    this.saveState();
    this.showToast(`Loaded ${oil.title} into Bottle #${this.activeBottle}`);
  }

  // -------------------------------------------------------------
  // RENDERING: Scent Menu, Presets, Lab, Recipe, Label
  // -------------------------------------------------------------
  renderAccords() {
    const container = document.getElementById("accordsGrid");
    if (!container) return;

    let accords = ACCORDS_DATA;
    if (this.currentFilter !== "all") {
      accords = accords.filter((a) => {
        if (this.currentFilter === "top") return a.role === "TOP";
        if (this.currentFilter === "heart") return a.role === "HEART";
        if (this.currentFilter === "base") return a.role === "BASE";
        return a.family.toLowerCase().includes(this.currentFilter);
      });
    }

    container.innerHTML = accords
      .map((accord) => {
        const savedNote = this.studentNotes[accord.id] || "";
        const roleClass = `role-${accord.role.toLowerCase()}`;
        return `
          <div class="glass-card accord-card" data-accord-id="${accord.id}">
            <div class="accord-card-header">
              <div>
                <span class="role-pill ${roleClass}">${accord.roleLabel}</span>
                <span class="family-tag">${accord.family}</span>
              </div>
              <div class="accord-color-indicator" style="background:${accord.color};" title="${accord.family}"></div>
            </div>

            <h3 class="accord-card-title">${accord.name}</h3>
            <p class="accord-card-desc">${accord.shortDescription}</p>

            <div class="accord-meta-specs">
              <div class="spec-row">
                <span class="spec-label">Tenacity:</span>
                <span class="spec-val">${accord.volatility}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Ideal Dose:</span>
                <span class="spec-val">${accord.recommendedPct}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Harmonizes:</span>
                <span class="spec-val">${accord.pairsWith.join(", ")}</span>
              </div>
            </div>

            <div class="perfumer-tip-box">
              <span>💡</span>
              <p><b>Perfumer Tip:</b> ${accord.perfumerTip}</p>
            </div>

            <!-- Student Smelling Journal Note -->
            <div class="student-note-area">
              <label class="student-note-label">📝 My Smelling Notes & Impressions:</label>
              <textarea 
                class="student-note-input" 
                placeholder="What does this smell like to you? (e.g. crisp green, sweet skin, smoky suede...)"
                data-note-id="${accord.id}">${savedNote}</textarea>
            </div>

            <div class="accord-card-footer">
              <button class="btn-outline-gold" style="width:100%; font-size:0.82rem;" onclick="window.koyoApp.addAndGoToLab('${accord.id}');">
                + Add to Bottle #${this.activeBottle} Lab →
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    // Setup Note Saving Listeners
    container.querySelectorAll(".student-note-input").forEach((txt) => {
      txt.addEventListener("input", (e) => {
        const id = e.target.dataset.noteId;
        this.studentNotes[id] = e.target.value;
        this.saveState();
      });
    });
  }

  addAndGoToLab(accordId) {
    this.changeDrops(accordId, 5);
    this.switchTab("lab");
  }

  renderReadyMades() {
    const container = document.getElementById("readyMadesGrid");
    if (!container) return;

    container.innerHTML = READY_MADE_OILS.map((oil) => `
      <div class="glass-card preset-card">
        <div class="preset-card-header">
          <span class="preset-badge" style="background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.4);">
            ${oil.badge}
          </span>
          <span class="preset-category">${oil.profileCategory}</span>
        </div>
        <h3 class="preset-title">${oil.title}</h3>
        <p class="preset-tagline">${oil.tagline}</p>

        <div style="font-size:0.78rem; margin:10px 0; background:rgba(0,0,0,0.3); padding:8px; border-radius:6px;">
          <div><b>Top:</b> ${oil.notes.top}</div>
          <div><b>Heart:</b> ${oil.notes.heart}</div>
          <div><b>Base:</b> ${oil.notes.base}</div>
        </div>

        <div style="font-size:0.75rem; color:#cbd5e1; margin-bottom:12px;">
          <b>Recommended Workshop Boosters:</b>
          <ul style="padding-left:16px; margin-top:4px;">
            ${oil.idealBoosters.map((b) => `<li>${b.label}</li>`).join("")}
          </ul>
        </div>

        <button class="btn-gold" style="width:100%; font-size:0.84rem;" onclick="window.koyoApp.loadReadyMadeOil('${oil.id}')">
          Load into Bottle #${this.activeBottle} →
        </button>
      </div>
    `).join("");
  }

  renderPresets() {
    const container = document.getElementById("presetsGrid");
    if (!container) return;

    container.innerHTML = STARTING_PRESETS.map((preset) => `
      <div class="glass-card preset-card">
        <div class="preset-card-header">
          <span class="preset-badge" style="background:rgba(212,175,55,0.18); color:var(--gold-light); border:1px solid var(--border-medium);">
            10ml Pure Oil Template
          </span>
          <span class="preset-category">100 Drops Total</span>
        </div>
        <h3 class="preset-title">${preset.title}</h3>
        <p class="preset-tagline">${preset.tagline}</p>
        <p style="font-size:0.8rem; color:#94a3b8; margin:8px 0 14px;">${preset.description}</p>

        <button class="btn-outline-gold" style="width:100%; font-size:0.84rem;" onclick="window.koyoApp.loadPreset('${preset.id}')">
          Load Formula into Bottle #${this.activeBottle} →
        </button>
      </div>
    `).join("");
  }

  renderTargetSelectors() {
    const container = document.getElementById("concentrationGrid");
    if (!container) return;

    const b = this.getActiveBottle();
    const currentTarget = b.targetDrops || 100;

    container.innerHTML = WORKSHOP_TARGET_PROFILES.map((prof) => {
      const isSel = prof.targetDrops === currentTarget;
      return `
        <div class="glass-card target-card ${isSel ? "active" : ""}" data-target-drops="${prof.targetDrops}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h4 style="font-family:var(--font-serif); font-size:1.0rem; color:#ffffff;">${prof.name}</h4>
            <span class="role-pill" style="background:rgba(212,175,55,0.2); color:var(--gold-light);">${prof.badge}</span>
          </div>
          <div style="font-size:0.78rem; font-weight:700; color:var(--gold-light); margin-bottom:4px;">${prof.subtitle}</div>
          <p style="font-size:0.78rem; color:#cbd5e1;">${prof.description}</p>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".target-card").forEach((card) => {
      card.addEventListener("click", () => {
        const td = parseInt(card.dataset.targetDrops);
        this.getActiveBottle().targetDrops = td;
        this.renderTargetSelectors();
        this.updateAllCalculations();
        this.saveState();
      });
    });
  }

  // -------------------------------------------------------------
  // LAB STEPPERS (All 17 Notes Grouped by Top, Heart, Base)
  // -------------------------------------------------------------
  renderLabSteppers() {
    const container = document.getElementById("labSteppersContainer");
    if (!container) return;

    const b = this.getActiveBottle();
    const b1Drops = this.bottles[1].drops || {};
    const bDrops = b.drops || {};

    const groups = [
      { key: "TOP", title: "⚡ Top Notes (Sparkling Opening Lift · 3 Notes)", items: ACCORDS_DATA.filter((a) => a.role === "TOP") },
      { key: "HEART", title: "🌸 Heart Notes (Floral & Character Body · 5 Notes)", items: ACCORDS_DATA.filter((a) => a.role === "HEART") },
      { key: "BASE", title: "🔥 Base Notes & Fixatives (Longevity & Trail · 9 Notes)", items: ACCORDS_DATA.filter((a) => a.role === "BASE") },
    ];

    let html = "";

    // If Bottle 2 is active, render the live Tweak Comparison Inspector banner first!
    if (this.activeBottle === 2) {
      html += this.renderTweakInspectorHTML();
    }

    groups.forEach((g) => {
      let visibleItems = g.items;
      if (this.hideZeroDrops) {
        visibleItems = visibleItems.filter((item) => (bDrops[item.id] || 0) > 0);
      }

      if (visibleItems.length === 0) return;

      html += `
        <div style="margin-top:20px; margin-bottom:8px;">
          <h4 style="font-family:var(--font-serif); font-size:0.96rem; color:var(--gold-light); text-transform:uppercase; letter-spacing:0.08em; display:flex; align-items:center; gap:8px;">
            ${g.title}
          </h4>
        </div>
      `;

      visibleItems.forEach((accord) => {
        const count = bDrops[accord.id] || 0;
        const density = accord.densityGramsPerDrop || 0.035;
        const grams = (count * density).toFixed(2);

        // Tweak comparison against Bottle 1
        let tweakBadge = "";
        if (this.activeBottle === 2) {
          const b1Count = b1Drops[accord.id] || 0;
          const diff = count - b1Count;
          if (b1Count === 0 && count > 0) {
            tweakBadge = `<span class="tweak-comparison-pill tweak-diff-new">★ Added in Bottle 2 (+${count}d)</span>`;
          } else if (diff > 0) {
            tweakBadge = `<span class="tweak-comparison-pill tweak-diff-plus">▲ +${diff}d from Bottle 1 (was ${b1Count}d)</span>`;
          } else if (diff < 0) {
            tweakBadge = `<span class="tweak-comparison-pill tweak-diff-minus">▼ ${diff}d from Bottle 1 (was ${b1Count}d)</span>`;
          } else if (count > 0) {
            tweakBadge = `<span class="tweak-comparison-pill" style="color:#94a3b8;">= Same as Bottle 1 (${count}d)</span>`;
          }
        }

        html += `
          <div class="drop-stepper-row" id="stepper-row-${accord.id}">
            <div class="stepper-info">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span class="accord-color-indicator" style="background:${accord.color}; width:10px; height:10px;"></span>
                <span class="stepper-name">${accord.name}</span>
                <span class="stepper-family-tag">${accord.family}</span>
                <span class="stepper-gram-readout" id="gram-badge-${accord.id}">${grams}g</span>
              </div>
              <div class="stepper-desc">${accord.shortDescription}</div>
              ${tweakBadge}
            </div>

            <div class="stepper-controls">
              <button class="step-btn btn-minus" onclick="window.koyoApp.changeDrops('${accord.id}', -1)" title="Remove 1 Drop">−</button>
              
              <div class="drop-count-display">
                <input 
                  type="number" 
                  class="stepper-input" 
                  id="input-drops-${accord.id}" 
                  value="${count}" 
                  min="0" 
                  max="120"
                  onchange="window.koyoApp.setDropsDirect('${accord.id}', this.value)"
                >
                <span class="drop-count-unit">${this.inputMode === "scale" ? "d (~" + grams + "g)" : "drops"}</span>
              </div>

              <button class="step-btn btn-plus" onclick="window.koyoApp.changeDrops('${accord.id}', 1)" title="Add 1 Drop">+</button>
              <button class="step-btn-quick" onclick="window.koyoApp.changeDrops('${accord.id}', 5)" title="Add 5 Drops">+5</button>
            </div>
          </div>
        `;
      });
    });

    container.innerHTML = html;
  }

  updateAccordStepperCount(accordId, count) {
    const input = document.getElementById(`input-drops-${accordId}`);
    if (input) input.value = count;

    const accord = ACCORDS_DATA.find((a) => a.id === accordId);
    const density = accord && accord.densityGramsPerDrop ? accord.densityGramsPerDrop : 0.035;
    const grams = (count * density).toFixed(2);

    const gramBadge = document.getElementById(`gram-badge-${accordId}`);
    if (gramBadge) gramBadge.innerText = `${grams}g`;
  }

  // -------------------------------------------------------------
  // TWEAK INSPECTOR (Bottle 1 vs Bottle 2 Comparison)
  // -------------------------------------------------------------
  renderTweakInspectorHTML() {
    const b1 = this.bottles[1].drops || {};
    const b2 = this.bottles[2].drops || {};
    const comp = this.engine.compareBottles(b1, b2);

    if (!comp.hasChanges) {
      return `
        <div class="tweak-inspector-card">
          <div class="tweak-inspector-header">
            <span class="tweak-inspector-title">🔬 Bottle 2 Tweak Inspector</span>
            <span style="font-size:0.78rem; color:#94a3b8;">Currently Identical to Bottle 1</span>
          </div>
          <p style="font-size:0.8rem; color:#cbd5e1; margin-bottom:10px;">
            Bottle 2 has the exact same formula as Bottle 1. Adjust any accord drops below to refine your blend, and your tweaks will be tracked here live!
          </p>
        </div>
      `;
    }

    const changed = comp.tweaks.filter((t) => t.status !== "same");

    return `
      <div class="tweak-inspector-card">
        <div class="tweak-inspector-header">
          <span class="tweak-inspector-title">🔬 Bottle 2 Tweaks vs Bottle 1</span>
          <span style="font-size:0.78rem; color:var(--gold-light); font-weight:700;">${changed.length} Notes Modified</span>
        </div>
        <div class="tweak-tags-grid">
          ${changed.map((t) => {
            let badgeClass = "tweak-diff-plus";
            if (t.status === "decreased" || t.status === "removed") badgeClass = "tweak-diff-minus";
            if (t.status === "added") badgeClass = "tweak-diff-new";

            return `
              <div class="tweak-tag-item">
                <span style="font-weight:700;">${t.name}:</span>
                <span class="${badgeClass}">${t.diffFormatted} drops</span>
                <span style="font-size:0.72rem; color:#94a3b8;">(${t.b1Drops}d → ${t.b2Drops}d)</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // CALCULATIONS, PYRAMID & BOTTLE STATS
  // -------------------------------------------------------------
  updateAllCalculations() {
    const b = this.getActiveBottle();
    const target = b.targetDrops || 100;
    const analysis = this.engine.analyzeFormula(b.drops, target);

    // 1. Capacity Bar
    const capCount = document.getElementById("capacityCount");
    if (capCount) {
      capCount.innerHTML = `<b>${analysis.totalDrops}</b> / ${target} drops &nbsp;·&nbsp; <b>${analysis.totalGrams} g</b> &nbsp;·&nbsp; ${analysis.fillPercent}%`;
    }
    const capFill = document.getElementById("capacityFill");
    if (capFill) {
      capFill.style.width = `${Math.min(100, analysis.fillPercent)}%`;
      if (analysis.totalDrops > target) {
        capFill.style.background = "#f59e0b"; // Overfilled indicator
      } else {
        capFill.style.background = "var(--gold-gradient)";
      }
    }

    // Header Status Pill
    const headerPill = document.getElementById("headerDropCount");
    if (headerPill) {
      headerPill.innerHTML = `🧴 Bottle ${this.activeBottle}: <b>${analysis.totalDrops}</b>/${target}d (${analysis.totalGrams}g)`;
    }

    // Mobile Summary Text
    const mobSummary = document.getElementById("mobileSummaryText");
    if (mobSummary) {
      mobSummary.innerText = `B${this.activeBottle}: ${analysis.totalDrops}/${target}d · ${analysis.totalGrams}g (${analysis.fillPercent}%)`;
    }

    // 2. Olfactory Pyramid Tiers
    const pTop = document.getElementById("pyramidTop");
    if (pTop) {
      pTop.querySelector(".tier-label").innerText = `Top: ${analysis.topPct}% (${analysis.topDrops}d)`;
      pTop.style.opacity = analysis.topPct > 0 ? "1" : "0.5";
    }
    const pHeart = document.getElementById("pyramidHeart");
    if (pHeart) {
      pHeart.querySelector(".tier-label").innerText = `Heart: ${analysis.heartPct}% (${analysis.heartDrops}d)`;
      pHeart.style.opacity = analysis.heartPct > 0 ? "1" : "0.5";
    }
    const pBase = document.getElementById("pyramidBase");
    if (pBase) {
      pBase.querySelector(".tier-label").innerText = `Base: ${analysis.basePct}% (${analysis.baseDrops}d)`;
      pBase.style.opacity = analysis.basePct > 0 ? "1" : "0.5";
    }

    // 3. Perfumer Diagnostics Message
    const diagBox = document.getElementById("diagnosticBox");
    if (diagBox) {
      diagBox.className = `diagnostic-box status-${analysis.diagnostic.status}`;
      diagBox.innerHTML = `
        <div class="diagnostic-title">${analysis.diagnostic.title}</div>
        <p class="diagnostic-desc">${analysis.diagnostic.desc}</p>
      `;
    }

    // 4. Bottle Specs Readout
    const statDrops = document.getElementById("statTotalDrops");
    if (statDrops) statDrops.innerText = `${analysis.totalDrops} drops`;
    const statGrams = document.getElementById("statConcentration");
    if (statGrams) statGrams.innerText = `${analysis.totalGrams} g`;
    const statType = document.getElementById("statOilVol");
    if (statType) statType.innerText = `100% Pure Oil`;
    const statTarget = document.getElementById("statEthanol");
    if (statTarget) statTarget.innerText = `${target} drops`;

    this.renderRecipe();
  }

  // -------------------------------------------------------------
  // RECIPE SHEET (10ml Oil Workflow Steps)
  // -------------------------------------------------------------
  renderRecipe() {
    const container = document.getElementById("recipeContainer");
    if (!container) return;

    const b = this.getActiveBottle();
    const target = b.targetDrops || 100;
    const analysis = this.engine.analyzeFormula(b.drops, target);

    let html = `
      <div class="glass-card" style="padding:24px; max-width:820px; margin:0 auto; box-shadow:var(--shadow-lg);">
        <div style="border-bottom:1px solid var(--border-medium); padding-bottom:16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <span class="role-pill" style="background:var(--gold-gradient-subtle); color:var(--gold-light); font-weight:800; border:1px solid var(--gold-primary);">
              10ML BESPOKE PERFUME OIL · BOTTLE #${this.activeBottle} OF 2
            </span>
            <h3 style="font-family:var(--font-serif); font-size:1.5rem; color:#ffffff; margin-top:6px;">${b.name}</h3>
            <p style="font-size:0.84rem; color:var(--gold-light);">Formulated by: <b>${b.creator || "Workshop Guest"}</b></p>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:1.1rem; color:var(--gold-light); font-weight:700;">
              ${analysis.totalDrops} Drops &nbsp;·&nbsp; ${analysis.totalGrams} g
            </div>
            <div style="font-size:0.78rem; color:#94a3b8;">100% Pure Oil Blend</div>
          </div>
        </div>

        <!-- Formula Table -->
        <h4 style="font-family:var(--font-serif); color:var(--gold-light); margin-bottom:10px;">Accords & Dropper / Scale Formula</h4>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.86rem; margin-bottom:24px;">
            <thead>
              <tr style="border-bottom:1px solid rgba(212,175,55,0.3); text-align:left; color:#94a3b8;">
                <th style="padding:8px 6px;">Accord / Ingredient</th>
                <th style="padding:8px 6px;">Note Role</th>
                <th style="padding:8px 6px; text-align:center;">Drops</th>
                <th style="padding:8px 6px; text-align:center;">Scale Weight</th>
                <th style="padding:8px 6px; text-align:right;">Percentage</th>
              </tr>
            </thead>
            <tbody>
    `;

    if (analysis.accordBreakdown.length === 0) {
      html += `<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">No drops added yet. Go to Lab to build your formula!</td></tr>`;
    } else {
      analysis.accordBreakdown.forEach((item) => {
        html += `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
            <td style="padding:10px 6px; font-weight:600; color:#ffffff;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${item.color}; margin-right:6px;"></span>
              ${item.name}
            </td>
            <td style="padding:10px 6px; color:#cbd5e1; font-size:0.78rem;">${item.roleLabel}</td>
            <td style="padding:10px 6px; text-align:center; font-family:var(--font-mono); font-weight:700; color:var(--gold-light);">${item.drops}</td>
            <td style="padding:10px 6px; text-align:center; font-family:var(--font-mono); color:#cbd5e1;">${item.grams.toFixed(2)} g</td>
            <td style="padding:10px 6px; text-align:right; font-family:var(--font-mono); color:#94a3b8;">${item.percentage}%</td>
          </tr>
        `;
      });
    }

    html += `
            </tbody>
            <tfoot>
              <tr style="border-top:2px solid rgba(212,175,55,0.4); font-weight:700;">
                <td style="padding:10px 6px; color:#ffffff;">Total Formulation</td>
                <td style="padding:10px 6px; color:var(--gold-light);">${analysis.topPct}% Top · ${analysis.heartPct}% Heart · ${analysis.basePct}% Base</td>
                <td style="padding:10px 6px; text-align:center; color:var(--gold-light); font-family:var(--font-mono);">${analysis.totalDrops} drops</td>
                <td style="padding:10px 6px; text-align:center; color:#ffffff; font-family:var(--font-mono);">${analysis.totalGrams} g</td>
                <td style="padding:10px 6px; text-align:right; color:#ffffff; font-family:var(--font-mono);">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Step-by-Step Oil Workshop Instructions -->
        <h4 style="font-family:var(--font-serif); color:var(--gold-light); margin-bottom:12px;">Step-by-Step 10ml Bottle Mixing Guide</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:20px;">
          <div style="background:rgba(0,0,0,0.4); padding:12px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">1. Tare Scale or Vial</div>
            <p style="font-size:0.78rem; color:#cbd5e1;">Place your clean 10ml bottle on the table scale and press Tare to zero, or hold securely upright for pipetting.</p>
          </div>
          <div style="background:rgba(0,0,0,0.4); padding:12px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">2. Add Base Notes First</div>
            <p style="font-size:0.78rem; color:#cbd5e1;">Pipette your Base Notes (Oud, Musks, Vanilla, Iso E Super) to establish the fixative foundation.</p>
          </div>
          <div style="background:rgba(0,0,0,0.4); padding:12px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">3. Heart Florals & Top Lift</div>
            <p style="font-size:0.78rem; color:#cbd5e1;">Add your Heart florals (Rose, White Floral, Hedione) followed by sparkling Top Notes (Citrus, Pineapple).</p>
          </div>
          <div style="background:rgba(0,0,0,0.4); padding:12px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">4. Cap & Test On Skin</div>
            <p style="font-size:0.78rem; color:#cbd5e1;">Insert rollerball/dropper cap, gently swirl to blend, and roll onto wrist. Evaluate on skin, then prepare Bottle #2!</p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // -------------------------------------------------------------
  // LABEL STUDIO (Option 3: Modern Niche Capsule)
  // -------------------------------------------------------------
  updateLabel() {
    if (!this.labelEngine) return;

    const b = this.getActiveBottle();
    const inputName = document.getElementById("inputPerfumeName");
    const name = inputName ? inputName.value : b.name;
    b.name = name;

    const inputCreator = document.getElementById("inputCreatorName");
    const creator = inputCreator ? inputCreator.value : b.creator;
    b.creator = creator;

    this.labelEngine.render({
      perfumeName: name,
      bottleNum: this.activeBottle,
      creatorName: creator,
      showBottleBadge: true
    });
  }

  downloadLabelPNG() {
    if (!this.labelEngine) return;
    const b = this.getActiveBottle();
    const dataUrl = this.labelEngine.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `KOYO_10ml_Bottle${this.activeBottle}_${b.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    a.click();
  }

  downloadLabelSVG() {
    if (!this.labelEngine) return;
    const b = this.getActiveBottle();
    const svgStr = this.labelEngine.toSVG({
      perfumeName: b.name,
      bottleNum: this.activeBottle
    });
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KOYO_10ml_Bottle${this.activeBottle}_${b.name.replace(/[^a-zA-Z0-9]/g, "_")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printThermalSticker() {
    if (!this.labelEngine) return;
    const statusDiv = document.getElementById("printStatusText");
    if (statusDiv) statusDiv.innerText = "⏳ Sending to thermal printer...";

    const b = this.getActiveBottle();
    const dataUrl = this.labelEngine.toDataURL("image/png");

    fetch("/api/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: dataUrl,
        label: b.name,
        bottleNum: this.activeBottle
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (statusDiv) statusDiv.innerText = "✅ Label printed successfully!";
          this.showToast(`Printed sticker for Bottle #${this.activeBottle}!`);
        } else {
          if (statusDiv) statusDiv.innerText = "⚠️ Printer error: " + (data.error || "Check printer connection");
          this.showToast("Printer not connected on server. Label saved!");
        }
      })
      .catch((err) => {
        console.warn("Print error:", err);
        if (statusDiv) statusDiv.innerText = "💾 Saved! (Local printer server not detected)";
        this.downloadLabelPNG();
      });
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS & UI SETUP
  // -------------------------------------------------------------
  setupEventListeners() {
    // Navigation Tabs
    document.querySelectorAll(".nav-tab-btn, .mobile-nav-item, .flow-step").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab || e.currentTarget.dataset.targetTab;
        if (tab) this.switchTab(tab);
      });
    });

    // Accord Filter Chips
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentFilter = e.currentTarget.dataset.filter;
        this.renderAccords();
      });
    });

    // Bottle Switcher Bar Buttons
    document.querySelectorAll(".bottle-switch-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const num = parseInt(btn.dataset.bottle);
        this.switchBottle(num);
      });
    });

    // Clone Bottle 1 to Bottle 2
    const btnClone = document.getElementById("btnCloneBottle1");
    if (btnClone) {
      btnClone.addEventListener("click", () => this.copyBottle1ToBottle2());
    }

    // Drops vs Scale Mode Switcher
    document.querySelectorAll(".mode-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setInputMode(btn.dataset.mode);
      });
    });

    // Auto-balance & Clear
    const btnAuto = document.getElementById("btnAutoBalance");
    if (btnAuto) btnAuto.addEventListener("click", () => this.autoBalanceFormula());
    const btnReset = document.getElementById("btnResetFormula");
    if (btnReset) btnReset.addEventListener("click", () => this.clearActiveFormula());

    // Toggle 0 Drops Notes
    const btnToggleZero = document.getElementById("btnToggleZeroDrops");
    if (btnToggleZero) {
      btnToggleZero.addEventListener("click", () => {
        this.hideZeroDrops = !this.hideZeroDrops;
        btnToggleZero.innerText = this.hideZeroDrops ? "👁️ Show All 17 Notes" : "👁️ Hide 0-Drop Notes";
        this.renderLabSteppers();
      });
    }

    // Label Studio Inputs
    const inputName = document.getElementById("inputPerfumeName");
    if (inputName) {
      inputName.addEventListener("input", () => this.updateLabel());
    }
    const inputCreator = document.getElementById("inputCreatorName");
    if (inputCreator) {
      inputCreator.addEventListener("input", () => this.updateLabel());
    }

    const btnPrint = document.getElementById("btnPrintLabel");
    if (btnPrint) btnPrint.addEventListener("click", () => this.printThermalSticker());
    const btnDl = document.getElementById("btnDownloadLabel");
    if (btnDl) btnDl.addEventListener("click", () => this.downloadLabelPNG());
    const btnDlSvg = document.getElementById("btnDownloadSvgLabel");
    if (btnDlSvg) btnDlSvg.addEventListener("click", () => this.downloadLabelSVG());

    // Recipe Print
    const btnPrintRecipe = document.getElementById("btnPrintRecipe");
    if (btnPrintRecipe) {
      btnPrintRecipe.addEventListener("click", () => window.print());
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabId}`);
    });

    document.querySelectorAll(".nav-tab-btn, .mobile-nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    document.querySelectorAll(".flow-step").forEach((step) => {
      step.classList.toggle("active", step.dataset.targetTab === tabId);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (tabId === "label") {
      this.updateLabel();
    } else if (tabId === "recipe") {
      this.renderRecipe();
    }
  }

  setupQRModal() {
    const btnOpen = document.getElementById("btnOpenQR");
    const modal = document.getElementById("qrModal");
    const btnClose = document.getElementById("btnCloseQR");

    if (btnOpen && modal) {
      btnOpen.addEventListener("click", () => {
        modal.classList.add("active");
        this.renderQRInModal();
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener("click", () => modal.classList.remove("active"));
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
      });
    }
  }

  renderQRInModal() {
    const display = document.getElementById("qrCodeDisplay");
    const urlDisp = document.getElementById("qrUrlDisplay");
    const currentUrl = window.location.href;

    if (urlDisp) urlDisp.innerText = currentUrl;
    if (display) {
      // Use qr-server API for quick client-side QR rendering
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&color=d4af37&bgcolor=0c100e`;
      display.innerHTML = `<img src="${qrApiUrl}" alt="Workshop QR Code" style="border-radius:10px; border:2px solid var(--gold-primary); box-shadow:0 0 20px rgba(212,175,55,0.3);">`;
    }
  }

  setupMobileDrawer() {
    const btnOpen = document.getElementById("btnOpenPyramidDrawer");
    const overlay = document.getElementById("mobileDrawerOverlay");
    const sheet = document.getElementById("mobileDrawerSheet");
    const btnClose = document.getElementById("btnCloseMobileDrawer");

    if (btnOpen && sheet && overlay) {
      btnOpen.addEventListener("click", () => {
        this.syncMobileDrawer();
        overlay.classList.add("active");
        sheet.classList.add("active");
      });
    }

    const close = () => {
      if (overlay) overlay.classList.remove("active");
      if (sheet) sheet.classList.remove("active");
    };

    if (btnClose) btnClose.addEventListener("click", close);
    if (overlay) overlay.addEventListener("click", close);
  }

  syncMobileDrawer() {
    const src = document.querySelector(".lab-sidebar");
    const target = document.getElementById("mobileDrawerContent");
    if (src && target) {
      target.innerHTML = src.innerHTML;
    }
  }

  showToast(msg) {
    let toast = document.getElementById("appToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.style.position = "fixed";
      toast.style.bottom = "80px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.background = "rgba(14, 20, 18, 0.95)";
      toast.style.border = "1px solid var(--gold-primary)";
      toast.style.color = "var(--gold-light)";
      toast.style.padding = "10px 20px";
      toast.style.borderRadius = "30px";
      toast.style.fontSize = "0.85rem";
      toast.style.fontWeight = "700";
      toast.style.zIndex = "9999";
      toast.style.boxShadow = "0 8px 30px rgba(0,0,0,0.7)";
      toast.style.transition = "all 0.3s ease";
      document.body.appendChild(toast);
    }

    toast.innerText = msg;
    toast.style.opacity = "1";
    toast.style.visibility = "visible";

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.visibility = "hidden";
    }, 2800);
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.koyoApp = new KoyoApp();
});
