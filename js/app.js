/**
 * KOYO Perfume Atelier - Main Application Controller
 * Color Palette: Obsidian Velvet Dark & Champagne Gold
 */

class KoyoApp {
  constructor() {
    this.engine = new FormulaEngine();
    this.labelEngine = null;

    // State
    this.currentTab = "accords";
    this.currentFilter = "all";
    this.selectedConcentration = "balanced"; // 'airy', 'balanced', 'intense'
    this.targetDrops = 60;
    this.formulaDrops = {};
    this.studentNotes = {};
    this.hideZeroDrops = false;

    // Label State
    this.perfumeName = "L'ÉTOILE NOIRE";
    this.creatorName = "WORKSHOP GUEST";
    this.labelStyle = "pure_bar";
    this.showLogo = true;
    this.showSubtitle = false;
    this.showConcentration = true;
    this.showDate = false;

    this.activeReadyMade = null;

    this.loadState();
    this.init();
  }

  init() {
    // Sync initial target drops from concentration profile (only 3 modes)
    const prof = CONCENTRATION_PROFILES.find((p) => p.id === this.selectedConcentration) || CONCENTRATION_PROFILES[1];
    this.targetDrops = prof.targetDrops;

    // Initialize Label Engine
    const canvas = document.getElementById("labelCanvas");
    if (canvas) {
      this.labelEngine = new LabelCanvasEngine(canvas);
    }

    this.renderAccords();
    this.renderReadyMades();
    this.renderPresets();
    this.renderLabSteppers();
    this.renderConcentrationSelectors();
    this.updateAllCalculations();
    this.setupEventListeners();
    this.setupQRModal();
    this.setupMobileDrawer();

    // Re-render label on font load
    if (document.fonts) {
      document.fonts.ready.then(() => {
        this.updateLabel();
      });
    }
  }

  loadState() {
    try {
      const savedNotes = localStorage.getItem("koyo_student_notes");
      if (savedNotes) this.studentNotes = JSON.parse(savedNotes);

      const savedFormula = localStorage.getItem("koyo_formula_drops");
      if (savedFormula) {
        this.formulaDrops = JSON.parse(savedFormula);
      } else {
        this.formulaDrops = { ...STARTING_PRESETS[0].drops };
      }

      const savedName = localStorage.getItem("koyo_perfume_name");
      if (savedName) this.perfumeName = savedName;

      const savedCreator = localStorage.getItem("koyo_creator_name");
      if (savedCreator) this.creatorName = savedCreator;

      const savedConc = localStorage.getItem("koyo_concentration");
      if (savedConc && ["airy", "balanced", "intense"].includes(savedConc)) {
        this.selectedConcentration = savedConc;
      }

      const savedStyle = localStorage.getItem("koyo_label_style");
      if (savedStyle) this.labelStyle = savedStyle;

      const savedReady = localStorage.getItem("koyo_active_ready_made");
      if (savedReady) {
        this.activeReadyMade = READY_MADE_OILS.find((r) => r.id === savedReady) || null;
      }
    } catch (e) {
      console.warn("Could not load localStorage:", e);
    }
  }

  saveState() {
    try {
      localStorage.setItem("koyo_student_notes", JSON.stringify(this.studentNotes));
      localStorage.setItem("koyo_formula_drops", JSON.stringify(this.formulaDrops));
      localStorage.setItem("koyo_perfume_name", this.perfumeName);
      localStorage.setItem("koyo_creator_name", this.creatorName);
      localStorage.setItem("koyo_concentration", this.selectedConcentration);
      localStorage.setItem("koyo_label_style", this.labelStyle);
      if (this.activeReadyMade) {
        localStorage.setItem("koyo_active_ready_made", this.activeReadyMade.id);
      } else {
        localStorage.removeItem("koyo_active_ready_made");
      }
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  setupEventListeners() {
    // Desktop Navigation Tabs
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Mobile Bottom Navigation Items
    document.querySelectorAll(".mobile-nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Workflow Banner Steps (Desktop)
    document.querySelectorAll(".flow-step").forEach((step) => {
      step.addEventListener("click", () => {
        const tab = step.dataset.targetTab;
        if (tab) this.switchTab(tab);
      });
    });

    // Accord Filter Chips
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        this.currentFilter = chip.dataset.filter;
        this.renderAccords();
      });
    });

    // Toggle Hide 0-Drop Notes Button
    const btnToggleZero = document.getElementById("btnToggleZeroDrops");
    if (btnToggleZero) {
      btnToggleZero.addEventListener("click", () => {
        this.hideZeroDrops = !this.hideZeroDrops;
        btnToggleZero.textContent = this.hideZeroDrops ? "👁️ Show All Notes" : "👁️ Hide 0-Drop Notes";
        this.applyZeroDropFilter();
      });
    }

    // Perfume Name Input
    const nameInput = document.getElementById("inputPerfumeName");
    if (nameInput) {
      nameInput.value = this.perfumeName;
      const onNameChange = (e) => {
        this.perfumeName = e.target.value;
        this.saveState();
        this.updateLabel();
        this.updateRecipeSheet();
      };
      nameInput.addEventListener("input", onNameChange);
      nameInput.addEventListener("change", onNameChange);
      nameInput.addEventListener("keyup", onNameChange);
    }

    // Creator Name Input
    const creatorInput = document.getElementById("inputCreatorName");
    if (creatorInput) {
      creatorInput.value = this.creatorName;
      const onCreatorChange = (e) => {
        this.creatorName = e.target.value;
        this.saveState();
        this.updateLabel();
        this.updateRecipeSheet();
      };
      creatorInput.addEventListener("input", onCreatorChange);
      creatorInput.addEventListener("change", onCreatorChange);
      creatorInput.addEventListener("keyup", onCreatorChange);
    }

    // Label Checkbox Customizations
    const chkLogo = document.getElementById("chkShowLogo");
    if (chkLogo) {
      chkLogo.checked = this.showLogo;
      chkLogo.addEventListener("change", (e) => {
        this.showLogo = e.target.checked;
        this.updateLabel();
      });
    }

    const chkSub = document.getElementById("chkShowSubtitle");
    if (chkSub) {
      chkSub.checked = this.showSubtitle;
      chkSub.addEventListener("change", (e) => {
        this.showSubtitle = e.target.checked;
        this.updateLabel();
      });
    }

    const chkConc = document.getElementById("chkShowConcentration");
    if (chkConc) {
      chkConc.checked = this.showConcentration;
      chkConc.addEventListener("change", (e) => {
        this.showConcentration = e.target.checked;
        this.updateLabel();
      });
    }

    const chkDate = document.getElementById("chkShowDate");
    if (chkDate) {
      chkDate.checked = this.showDate;
      chkDate.addEventListener("change", (e) => {
        this.showDate = e.target.checked;
        this.updateLabel();
      });
    }

    // Label Style Buttons
    document.querySelectorAll(".style-pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".style-pill-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.labelStyle = btn.dataset.style;
        this.saveState();
        this.updateLabel();
      });
    });

    // Auto-Balance Button
    const btnAutoBalance = document.getElementById("btnAutoBalance");
    if (btnAutoBalance) {
      btnAutoBalance.addEventListener("click", () => {
        const profile = CONCENTRATION_PROFILES.find((p) => p.id === this.selectedConcentration) || CONCENTRATION_PROFILES[1];
        const target = profile.targetDrops;
        this.targetDrops = target;
        this.formulaDrops = this.engine.normalizeToTarget(this.formulaDrops, target);
        this.saveState();
        this.renderLabSteppers();
        this.updateAllCalculations();
        this.renderAccords();
        this.showToast(`✨ Formula balanced to exact ${target} drops (${Math.round(target * 0.5)}% concentration)!`);
      });
    }

    // Reset Lab Button
    const btnReset = document.getElementById("btnResetFormula");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("Reset all accord drops to 0?")) {
          this.formulaDrops = {};
          this.activeReadyMade = null;
          this.saveState();
          this.renderLabSteppers();
          this.updateAllCalculations();
          this.renderAccords();
          this.showToast("Lab formula cleared.");
        }
      });
    }

    // Print Label Button
    const btnPrint = document.getElementById("btnPrintLabel");
    if (btnPrint) {
      btnPrint.addEventListener("click", () => this.handlePrintLabel());
    }

    // Download Label Button
    const btnDownload = document.getElementById("btnDownloadLabel");
    if (btnDownload) {
      btnDownload.addEventListener("click", () => this.handleDownloadLabel());
    }

    // Print Recipe Sheet Button
    const btnPrintRecipe = document.getElementById("btnPrintRecipe");
    if (btnPrintRecipe) {
      btnPrintRecipe.addEventListener("click", () => window.print());
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Desktop tabs
    document.querySelectorAll(".nav-tab-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tabId);
    });

    // Mobile bottom nav items
    document.querySelectorAll(".mobile-nav-item").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tabId);
    });

    // Tab Panels
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.toggle("active", p.id === `tab-${tabId}`);
    });

    // Desktop workflow steps
    document.querySelectorAll(".flow-step").forEach((s) => {
      s.classList.toggle("active", s.dataset.targetTab === tabId);
    });

    // Floating mobile bar ONLY visible on Lab tab on small screens
    const mobileBar = document.getElementById("mobilePyramidBar");
    if (mobileBar) {
      if (window.innerWidth <= 768 && tabId === "lab") {
        mobileBar.style.display = "flex";
      } else {
        mobileBar.style.display = "none";
      }
    }

    // Close any open mobile drawer
    const overlay = document.getElementById("mobileDrawerOverlay");
    const sheet = document.getElementById("mobileDrawerSheet");
    if (overlay) overlay.classList.remove("open");
    if (sheet) sheet.classList.remove("open");

    if (tabId === "accords") {
      this.renderAccords();
    } else if (tabId === "label") {
      this.syncLabelControls();
      this.updateLabel();
    } else if (tabId === "recipe") {
      this.updateRecipeSheet();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  syncLabelControls() {
    const nameInput = document.getElementById("inputPerfumeName");
    if (nameInput) nameInput.value = this.perfumeName || "";

    const creatorInput = document.getElementById("inputCreatorName");
    if (creatorInput) creatorInput.value = this.creatorName || "";

    const chkLogo = document.getElementById("chkShowLogo");
    if (chkLogo) chkLogo.checked = this.showLogo;

    const chkSub = document.getElementById("chkShowSubtitle");
    if (chkSub) chkSub.checked = this.showSubtitle;

    const chkConc = document.getElementById("chkShowConcentration");
    if (chkConc) chkConc.checked = this.showConcentration;

    const chkDate = document.getElementById("chkShowDate");
    if (chkDate) chkDate.checked = this.showDate;

    document.querySelectorAll(".style-pill-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.style === this.labelStyle);
    });
  }

  applyZeroDropFilter() {
    document.querySelectorAll(".drop-stepper-row").forEach((row) => {
      const input = row.querySelector(".drop-number-input");
      const drops = input ? parseInt(input.value) || 0 : 0;
      if (this.hideZeroDrops && drops === 0) {
        row.classList.add("hidden-zero");
      } else {
        row.classList.remove("hidden-zero");
      }
    });
  }

  renderAccords() {
    const container = document.getElementById("accordsGrid");
    if (!container) return;

    let accords = [...ACCORDS_DATA];
    if (this.currentFilter === "top") accords = accords.filter((a) => a.role.includes("TOP"));
    else if (this.currentFilter === "heart") accords = accords.filter((a) => a.role.includes("HEART"));
    else if (this.currentFilter === "base") accords = accords.filter((a) => a.role.includes("BASE"));
    else if (this.currentFilter !== "all") accords = accords.filter((a) => a.family.toLowerCase().includes(this.currentFilter));

    container.innerHTML = accords
      .map((accord) => {
        const roleClass = accord.role.toLowerCase().replace("/", "-");
        const savedNote = this.studentNotes[accord.id] || "";
        const activeDrops = this.formulaDrops[accord.id] || 0;

        return `
        <div class="glass-card accord-card" style="--card-accent: ${accord.color}">
          <div class="accord-card-header">
            <div>
              <h3 class="accord-card-title">${accord.name}</h3>
              <span class="accord-family-tag">${accord.family} Family · ${accord.role}</span>
            </div>
            <span class="badge-role ${roleClass}">${accord.role}</span>
          </div>

          <p class="accord-desc-short">${accord.shortDescription}</p>
          <p class="accord-desc-full">${accord.fullDescription}</p>

          <div class="accord-pairings-box">
            <b>✨ Best Pairings:</b> ${accord.pairsWith.join(", ")}
          </div>

          <div class="smelling-notes-box">
            <div class="notes-label">
              <span>✍️ My Smelling Impression</span>
              <span class="in-formula-indicator" id="accord-drops-badge-${accord.id}">
                ${activeDrops > 0 ? `In Formula: ${activeDrops} drops` : "0 drops added"}
              </span>
            </div>
            <textarea 
              class="smelling-input" 
              placeholder="What does it smell like to you? (e.g. sparkling, warm, cozy...)" 
              data-accord-id="${accord.id}">${savedNote}</textarea>
          </div>

          <div class="accord-card-actions">
            <div style="display:flex; align-items:center; gap:6px;">
              <button class="btn-step" data-action="quick-dec" data-id="${accord.id}">-</button>
              <span style="font-family:var(--font-mono); font-weight:700; min-width:28px; text-align:center; color:var(--gold-light);" id="accord-quick-count-${accord.id}">${activeDrops}</span>
              <button class="btn-step" data-action="quick-inc" data-id="${accord.id}">+</button>
            </div>
            <button class="btn-outline-gold" data-action="add-5-drops" data-id="${accord.id}">
              +5 Drops
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    // Bind impression note auto-saves
    container.querySelectorAll(".smelling-input").forEach((textarea) => {
      textarea.addEventListener("input", (e) => {
        const id = e.target.dataset.accordId;
        this.studentNotes[id] = e.target.value;
        this.saveState();
      });
    });

    // Quick Stepper Events
    container.querySelectorAll("[data-action='quick-inc']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        this.updateAccordDrops(id, (this.formulaDrops[id] || 0) + 1);
        this.updateAccordCardBadge(id);
      });
    });

    container.querySelectorAll("[data-action='quick-dec']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const current = this.formulaDrops[id] || 0;
        this.updateAccordDrops(id, Math.max(0, current - 1));
        this.updateAccordCardBadge(id);
      });
    });

    // Add 5 drops button
    container.querySelectorAll("[data-action='add-5-drops']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        this.updateAccordDrops(id, (this.formulaDrops[id] || 0) + 5);
        this.updateAccordCardBadge(id);
        const accord = ACCORDS_DATA.find((a) => a.id === id);
        this.showToast(`+5 drops of ${accord ? accord.name : id} added!`);
      });
    });
  }

  updateAccordCardBadge(accordId) {
    const drops = this.formulaDrops[accordId] || 0;
    const badge = document.getElementById(`accord-drops-badge-${accordId}`);
    if (badge) {
      badge.textContent = drops > 0 ? `In Formula: ${drops} drops` : "0 drops added";
      badge.style.color = drops > 0 ? "var(--gold-light)" : "var(--text-muted)";
    }
    const countSpan = document.getElementById(`accord-quick-count-${accordId}`);
    if (countSpan) countSpan.textContent = drops;
  }

  renderReadyMades() {
    const container = document.getElementById("readyMadesGrid");
    if (!container) return;

    container.innerHTML = READY_MADE_OILS.map((frag) => {
      const isSelected = this.activeReadyMade && this.activeReadyMade.id === frag.id;

      return `
        <div class="glass-card preset-card" style="${isSelected ? "border-color:var(--gold-primary); background:rgba(212,175,55,0.08);" : ""}">
          <span class="preset-badge" style="background:rgba(16,185,129,0.15); color:#34d399; border-color:rgba(16,185,129,0.4);">
            ${frag.badge}
          </span>
          <h3 class="preset-title">${frag.title}</h3>
          <p class="preset-tagline">${frag.profileCategory} · ${frag.tagline}</p>
          <p class="preset-desc">${frag.description}</p>

          <div class="preset-notes-summary">
            <div style="font-size:0.75rem; color:var(--gold-light); margin-bottom:4px; font-weight:700;">PYRAMID PROFILE:</div>
            <div class="preset-note-row"><span>Top:</span> <b>${frag.notes.top}</b></div>
            <div class="preset-note-row"><span>Heart:</span> <b>${frag.notes.heart}</b></div>
            <div class="preset-note-row"><span>Base:</span> <b>${frag.notes.base}</b></div>
          </div>

          <div style="margin-top:auto; display:flex; flex-direction:column; gap:8px;">
            <button class="btn-gold" data-action="select-ready-oil" data-id="${frag.id}">
              ${isSelected ? "✓ Selected for 10ml Bottle" : "Select for 10ml Bottle"}
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll("[data-action='select-ready-oil']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const frag = READY_MADE_OILS.find((r) => r.id === btn.dataset.id);
        if (frag) {
          this.activeReadyMade = frag;
          const target = this.targetDrops || 60;
          this.formulaDrops = {
            [frag.id]: target
          };
          this.perfumeName = frag.title;
          const nameInput = document.getElementById("inputPerfumeName");
          if (nameInput) nameInput.value = this.perfumeName;

          this.saveState();
          this.renderReadyMades();
          this.renderLabSteppers();
          this.updateAllCalculations();
          this.renderAccords();
          this.switchTab("lab");
          this.showToast(`Selected ${frag.title} for your 10ml bottle!`);
        }
      });
    });
  }

  renderPresets() {
    const container = document.getElementById("presetsGrid");
    if (!container) return;

    container.innerHTML = STARTING_PRESETS.map((preset) => {
      const dropEntries = Object.entries(preset.drops).map(([id, count]) => {
        const accord = ACCORDS_DATA.find((a) => a.id === id);
        return `
          <div class="preset-note-row">
            <span>${accord ? accord.name : id}</span>
            <b>${count} drops</b>
          </div>
        `;
      }).join("");

      return `
        <div class="glass-card preset-card">
          <span class="preset-badge">Bespoke Accord Formula</span>
          <h3 class="preset-title">${preset.title}</h3>
          <p class="preset-tagline">${preset.tagline}</p>
          <p class="preset-desc">${preset.description}</p>

          <div class="preset-notes-summary">
            ${dropEntries}
          </div>

          <button class="btn-outline-gold" style="margin-top:auto; width:100%;" data-action="load-preset" data-preset-id="${preset.id}">
            Load into Formulation Lab
          </button>
        </div>
      `;
    }).join("");

    container.querySelectorAll("[data-action='load-preset']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = STARTING_PRESETS.find((p) => p.id === btn.dataset.presetId);
        if (preset) {
          this.formulaDrops = { ...preset.drops };
          this.activeReadyMade = null;
          this.perfumeName = preset.title;
          const nameInput = document.getElementById("inputPerfumeName");
          if (nameInput) nameInput.value = this.perfumeName;

          this.saveState();
          this.renderLabSteppers();
          this.updateAllCalculations();
          this.renderAccords();
          this.switchTab("lab");
          this.showToast(`Loaded ${preset.title} into your Lab!`);
        }
      });
    });
  }

  renderConcentrationSelectors() {
    const container = document.getElementById("concentrationGrid");
    if (!container) return;

    // Only 3 Modes: Airy (40), Balanced (60), Intense (80)
    container.innerHTML = CONCENTRATION_PROFILES.map((prof) => {
      const isActive = this.selectedConcentration === prof.id;
      return `
        <div class="concentration-card ${isActive ? "active" : ""}" data-conc-id="${prof.id}">
          <span class="conc-badge">${prof.badge}</span>
          <div class="conc-name">${prof.name}</div>
          <div class="conc-sub">${prof.subtitle}</div>
          <p style="font-size:0.78rem; color:#cbd5e1; margin-bottom:8px;">${prof.description}</p>
          <div class="conc-stats-row">
            <span>Presence: <b>${prof.presenceFeel}</b></span>
            <span>Target: <b>${prof.targetDrops} drops</b></span>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".concentration-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.concId;
        this.selectedConcentration = id;
        const profile = CONCENTRATION_PROFILES.find((p) => p.id === id);
        if (profile) {
          this.targetDrops = profile.targetDrops;
          this.formulaDrops = this.engine.normalizeToTarget(this.formulaDrops, this.targetDrops);
        }
        this.saveState();
        this.renderConcentrationSelectors();
        this.renderLabSteppers();
        this.updateAllCalculations();
        this.renderAccords();
        this.showToast(`Concentration set to ${profile ? profile.name : id} (${this.targetDrops} drops)`);
      });
    });
  }

  renderLabSteppers() {
    const container = document.getElementById("labSteppersContainer");
    if (!container) return;

    // Check if using a Ready-Made Oil
    if (this.activeReadyMade) {
      const readyId = this.activeReadyMade.id;
      const readyDrops = this.formulaDrops[readyId] || this.targetDrops || 60;

      // Booster notes list
      const boosterAccords = ACCORDS_DATA.map((accord) => {
        const count = this.formulaDrops[accord.id] || 0;
        return `
          <div class="drop-stepper-row ${count > 0 ? "has-drops" : ""}">
            <div class="stepper-info">
              <span class="stepper-name">${accord.name}</span>
              <span class="stepper-role-sub">${accord.role} · Accent Booster</span>
            </div>
            <div class="stepper-slider-wrap">
              <input type="range" class="stepper-slider" min="0" max="30" value="${count}" data-key="${accord.id}">
            </div>
            <div class="stepper-controls">
              <button class="btn-step" data-action="decrement" data-key="${accord.id}">-</button>
              <input type="number" class="drop-number-input" value="${count}" min="0" max="80" data-key="${accord.id}">
              <button class="btn-step" data-action="increment" data-key="${accord.id}">+</button>
            </div>
          </div>
        `;
      }).join("");

      container.innerHTML = `
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.35); border-radius:14px; padding:18px; margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div>
              <span class="badge-role ready">Premixed Ready Oil</span>
              <h3 style="color:#34d399; font-family:var(--font-serif); font-size:1.25rem; margin-top:4px;">
                ${this.activeReadyMade.title}
              </h3>
            </div>
            <button class="btn-ghost" id="btnSwitchToScratch">Build from Scratch Instead</button>
          </div>
          <p style="font-size:0.84rem; color:#cbd5e1; margin-bottom:12px;">
            This master oil contains the complete balanced fragrance pyramid. Adjust the main oil drops below, or optionally layer a few drops of pure accords.
          </p>

          <div class="drop-stepper-row has-drops" style="background:rgba(0,0,0,0.4); border-color:var(--gold-primary);">
            <div class="stepper-info">
              <span class="stepper-name">${this.activeReadyMade.title} (Master Oil)</span>
              <span class="stepper-role-sub">Primary Fragrance Base</span>
            </div>
            <div class="stepper-slider-wrap">
              <input type="range" class="stepper-slider" min="10" max="100" value="${readyDrops}" data-key="${readyId}">
            </div>
            <div class="stepper-controls">
              <button class="btn-step" data-action="decrement" data-key="${readyId}">-</button>
              <input type="number" class="drop-number-input" value="${readyDrops}" data-key="${readyId}">
              <button class="btn-step" data-action="increment" data-key="${readyId}">+</button>
            </div>
          </div>
        </div>

        <details style="margin-top:14px; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:12px; padding:12px 14px;">
          <summary style="font-weight:700; color:var(--gold-light); cursor:pointer; font-size:0.9rem;">
            ✨ Optional: Layer Extra Accords with ${this.activeReadyMade.title}
          </summary>
          <p style="font-size:0.78rem; color:#cbd5e1; margin:8px 0 10px;">
            Recommended pairings: ${this.activeReadyMade.idealBoosters.map((b) => b.label).join(", ")}
          </p>
          ${boosterAccords}
        </details>
      `;

      container.querySelector("#btnSwitchToScratch")?.addEventListener("click", () => {
        this.activeReadyMade = null;
        this.formulaDrops = { ...STARTING_PRESETS[0].drops };
        this.saveState();
        this.renderLabSteppers();
        this.updateAllCalculations();
        this.renderAccords();
      });

      this.bindStepperEvents(container);
      this.applyZeroDropFilter();
      return;
    }

    // Custom Accord Builder grouped by Role
    const roles = [
      { key: "TOP", title: "Top Notes (First Impression)", color: "var(--role-top)" },
      { key: "HEART", title: "Heart Notes (Body & Personality)", color: "var(--role-heart)" },
      { key: "BASE", title: "Base Notes (Lasting Trail & Fixatives)", color: "var(--role-base)" }
    ];

    let html = "";

    roles.forEach((r) => {
      const accords = ACCORDS_DATA.filter((a) => {
        if (r.key === "TOP") return a.role === "TOP" || a.role === "TOP/HEART";
        if (r.key === "HEART") return a.role === "HEART" || a.role === "HEART/BASE";
        if (r.key === "BASE") return a.role === "BASE";
        return false;
      });

      html += `
        <div class="role-group-header">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${r.color};"></span>
          <h4 class="role-group-title" style="color:${r.color};">${r.title}</h4>
        </div>
      `;

      accords.forEach((accord) => {
        const count = this.formulaDrops[accord.id] || 0;
        html += `
          <div class="drop-stepper-row ${count > 0 ? "has-drops" : ""}">
            <div class="stepper-info">
              <span class="stepper-name">${accord.name}</span>
              <span class="stepper-role-sub">${accord.family} · ${accord.recommendedPct}</span>
            </div>
            <div class="stepper-slider-wrap">
              <input type="range" class="stepper-slider" min="0" max="40" value="${count}" data-key="${accord.id}">
            </div>
            <div class="stepper-controls">
              <button class="btn-step" data-action="decrement" data-key="${accord.id}">-</button>
              <input type="number" class="drop-number-input" value="${count}" min="0" max="100" data-key="${accord.id}">
              <button class="btn-step" data-action="increment" data-key="${accord.id}">+</button>
            </div>
          </div>
        `;
      });
    });

    container.innerHTML = html;
    this.bindStepperEvents(container);
    this.applyZeroDropFilter();
  }

  bindStepperEvents(container) {
    container.querySelectorAll(".stepper-slider").forEach((slider) => {
      slider.addEventListener("input", (e) => {
        const key = e.target.dataset.key;
        const val = parseInt(e.target.value) || 0;
        this.updateAccordDrops(key, val);
      });
    });

    container.querySelectorAll(".drop-number-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const key = e.target.dataset.key;
        const val = Math.max(0, parseInt(e.target.value) || 0);
        this.updateAccordDrops(key, val);
      });
    });

    container.querySelectorAll(".btn-step").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.key;
        const action = btn.dataset.action;
        const current = this.formulaDrops[key] || 0;
        const delta = action === "increment" ? 1 : -1;
        const newVal = Math.max(0, current + delta);
        this.updateAccordDrops(key, newVal);
      });
    });
  }

  updateAccordDrops(key, value) {
    if (value <= 0) {
      delete this.formulaDrops[key];
    } else {
      this.formulaDrops[key] = value;
    }
    this.saveState();
    this.renderLabSteppers();
    this.updateAllCalculations();
    this.updateAccordCardBadge(key);
  }

  updateAllCalculations() {
    const analysis = this.engine.analyzeFormula(this.formulaDrops, this.selectedConcentration, this.activeReadyMade?.id);
    const activeTarget = analysis.targetDrops;

    // Update Header Badge
    const headerDropBadge = document.getElementById("headerDropCount");
    if (headerDropBadge) {
      headerDropBadge.textContent = `${analysis.totalDrops} / ${activeTarget} Drops`;
    }

    // Update Capacity Progress Bar
    const capacityCount = document.getElementById("capacityCount");
    if (capacityCount) {
      capacityCount.textContent = `${analysis.totalDrops} / ${activeTarget} drops (${analysis.totalOilVolumeMl} mL · ${analysis.concentrationPercent}%)`;
    }
    const capacityFill = document.getElementById("capacityFill");
    if (capacityFill) {
      const pct = Math.min(100, (analysis.totalDrops / activeTarget) * 100);
      capacityFill.style.width = `${pct}%`;
      capacityFill.classList.toggle("over", analysis.totalDrops > activeTarget * 1.15);
    }

    // Update Mobile Floating Trigger Text
    const mobileSummaryText = document.getElementById("mobileSummaryText");
    if (mobileSummaryText) {
      mobileSummaryText.textContent = `${analysis.totalDrops}/${activeTarget}d · ${analysis.concentrationPercent}% (${analysis.totalOilVolumeMl}mL)`;
    }

    // Update Pyramid Bars
    const topBar = document.getElementById("pyramidTop");
    const heartBar = document.getElementById("pyramidHeart");
    const baseBar = document.getElementById("pyramidBase");

    if (topBar) topBar.querySelector(".tier-label").textContent = `Top: ${analysis.topPct}% (${analysis.topDrops}d)`;
    if (heartBar) heartBar.querySelector(".tier-label").textContent = `Heart: ${analysis.heartPct}% (${analysis.heartDrops}d)`;
    if (baseBar) baseBar.querySelector(".tier-label").textContent = `Base: ${analysis.basePct}% (${analysis.baseDrops}d)`;

    // Update Diagnostics
    const diagBox = document.getElementById("diagnosticBox");
    if (diagBox) {
      diagBox.innerHTML = `
        <div class="diagnostic-title">${analysis.diagnostics.title}</div>
        <p class="diagnostic-desc">${analysis.diagnostics.message}</p>
        <div class="diagnostic-tip">💡 ${analysis.diagnostics.tip}</div>
      `;
    }

    // Update 10ml Bottle Specs (All in mL)
    const statDrops = document.getElementById("statTotalDrops");
    if (statDrops) statDrops.textContent = `${analysis.totalDrops} drops`;

    const statConc = document.getElementById("statConcentration");
    if (statConc) statConc.textContent = `${analysis.concentrationPercent}%`;

    const statOilVol = document.getElementById("statOilVol");
    if (statOilVol) statOilVol.textContent = `${analysis.totalOilVolumeMl} mL`;

    const statEthanol = document.getElementById("statEthanol");
    if (statEthanol) statEthanol.textContent = `${analysis.ethanolVolumeMl} mL`;

    // Clone content to Mobile Drawer Sheet
    const mobileDrawerContent = document.getElementById("mobileDrawerContent");
    const pyramidCard = document.querySelector(".pyramid-card");
    if (mobileDrawerContent && pyramidCard) {
      mobileDrawerContent.innerHTML = pyramidCard.innerHTML;
    }

    // Update Recipe Sheet & Label
    this.updateRecipeSheet();
    this.updateLabel();
  }

  updateRecipeSheet() {
    const container = document.getElementById("recipeContainer");
    if (!container) return;

    const analysis = this.engine.analyzeFormula(this.formulaDrops, this.selectedConcentration, this.activeReadyMade?.id);
    const concProfile = CONCENTRATION_PROFILES.find((p) => p.id === this.selectedConcentration) || CONCENTRATION_PROFILES[1];

    let rowsHtml = analysis.accordBreakdown.map((item) => {
      return `
        <tr>
          <td><span style="color:${item.color}; font-weight:700;">●</span> <b>${item.name}</b></td>
          <td><span class="badge-role ${item.role.toLowerCase().replace("/", "-")}">${item.role}</span></td>
          <td style="font-family:var(--font-mono); font-weight:700; color:var(--gold-light);">${item.drops} drops</td>
          <td style="font-family:var(--font-mono); color:#ffffff;">${item.volumeMl} mL</td>
          <td style="font-family:var(--font-mono); color:#ffffff;">${Math.round(item.percentage)}%</td>
        </tr>
      `;
    }).join("");

    if (analysis.totalDrops === 0) {
      rowsHtml = `<tr><td colspan="5" style="text-align:center; padding:18px; color:var(--text-muted);">No accords added yet. Add drops in the Formulation Lab or select a ready oil!</td></tr>`;
    }

    container.innerHTML = `
      <div class="recipe-sheet-card">
        <div class="recipe-header-center">
          <img src="assets/koyo_logo_black.png" alt="KOYO" style="height:40px; filter:invert(1); margin-bottom:8px;">
          <h2 style="font-family:var(--font-serif); font-size:1.6rem; color:#ffffff; letter-spacing:0.04em;">${this.perfumeName.toUpperCase()}</h2>
          <p style="color:var(--gold-light); font-size:0.86rem; letter-spacing:0.08em; font-weight:700; text-transform:uppercase;">
            ${this.creatorName ? `Formulated by ${this.creatorName} · ` : ""}10 ML Custom Fragrance
          </p>
          <p style="font-size:0.8rem; color:#cbd5e1; margin-top:4px;">
            Concentration: <b>${concProfile.name} (${analysis.concentrationPercent}%)</b> · Total Fragrance Oil: ${analysis.totalOilVolumeMl} mL (${analysis.totalDrops} drops)
          </p>
        </div>

        <div class="recipe-table-wrap">
          <table class="recipe-table">
            <thead>
              <tr>
                <th>Material / Fragrance Oil</th>
                <th>Role</th>
                <th>10ml Drops</th>
                <th>Oil Volume</th>
                <th>Oil %</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="ethanol-row">
                <td><b>Perfume Ethanol (Solvent · 96% Vol)</b></td>
                <td>SOLVENT</td>
                <td><b>q.s. to 10ml line</b></td>
                <td><b>${analysis.ethanolVolumeMl} mL</b></td>
                <td><b>${Math.max(0, 100 - analysis.concentrationPercent)}%</b></td>
              </tr>
              <tr class="total-row">
                <td colspan="2"><b>FINAL 10ML BOTTLE TOTAL</b></td>
                <td><b>${analysis.totalDrops} drops oil</b></td>
                <td><b>10.0 mL</b></td>
                <td><b>100% total</b></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background:rgba(0,0,0,0.4); border-radius:10px; padding:14px; margin:16px 0; border:1px solid var(--border-subtle);">
          <h4 style="color:var(--gold-light); font-family:var(--font-serif); margin-bottom:4px; font-size:0.95rem;">🌿 Olfactory Profile Diagnostics</h4>
          <p style="font-size:0.82rem; color:#cbd5e1; line-height:1.45;">${analysis.diagnostics.message}</p>
          <div style="display:flex; gap:14px; margin-top:8px; font-size:0.8rem; color:var(--gold-light); font-weight:700; flex-wrap:wrap;">
            <span>Top: ${analysis.topPct}%</span>
            <span>Heart: ${analysis.heartPct}%</span>
            <span>Base: ${analysis.basePct}%</span>
          </div>
        </div>

        <div class="mixing-steps-list">
          <h3 style="font-family:var(--font-serif); color:#ffffff; font-size:1.1rem; margin-bottom:2px;">🧪 Physical Workshop Blending Steps</h3>
          
          <div class="mixing-step-item">
            <div class="step-num-badge">1</div>
            <div class="step-content">
              <h4>Add Accord Drops in Order</h4>
              <p>Pipette calculated drops into your 10ml glass bottle starting from <b>Base Notes</b> first, then <b>Heart Notes</b>, and lastly <b>Top Notes</b>.</p>
            </div>
          </div>

          <div class="mixing-step-item">
            <div class="step-num-badge">2</div>
            <div class="step-content">
              <h4>Swirl & Blend Concentrate</h4>
              <p>Gently swirl the bottle for 15 seconds to allow the pure accords and musks to unify.</p>
            </div>
          </div>

          <div class="mixing-step-item">
            <div class="step-num-badge">3</div>
            <div class="step-content">
              <h4>Fill with Perfume Ethanol (q.s. to 10ml)</h4>
              <p>Using the alcohol dropper, fill the remaining bottle space up to the 10ml shoulder line with artisan perfumer's alcohol (${analysis.ethanolVolumeMl} mL).</p>
            </div>
          </div>

          <div class="mixing-step-item">
            <div class="step-num-badge">4</div>
            <div class="step-content">
              <h4>Twist Bottle Cap & Invert</h4>
              <p>Twist on the spray cap tightly. Invert the bottle slowly 3 times to complete dilution.</p>
            </div>
          </div>

          <div class="mixing-step-item">
            <div class="step-num-badge">5</div>
            <div class="step-content">
              <h4>Maturation & Maceration</h4>
              <p>Rest your fragrance in a cool, dark place for <b>2 to 4 weeks</b>. The alcohol bite will soften and the notes will harmonize into a velvety master sillage.</p>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:14px; font-size:0.75rem; color:#94a3b8; flex-wrap:wrap; gap:6px;">
          <span>KOYO Perfume Atelier · koyobeauty.com</span>
          <span>@koyobeauty_ · +92 339 0095696</span>
        </div>
      </div>
    `;
  }

  updateLabel() {
    if (!this.labelEngine) {
      const canvas = document.getElementById("labelCanvas");
      if (canvas) {
        this.labelEngine = new LabelCanvasEngine(canvas);
      } else {
        return;
      }
    }

    const analysis = this.engine.analyzeFormula(this.formulaDrops, this.selectedConcentration, this.activeReadyMade?.id);
    const concProfile = CONCENTRATION_PROFILES.find((p) => p.id === this.selectedConcentration) || CONCENTRATION_PROFILES[1];

    const notesList = analysis.accordBreakdown.slice(0, 3).map((a) => a.name.replace(" Accord", "").replace(" (Premixed Oil)", "")).join(" · ");

    const nameToDisplay = (this.perfumeName && this.perfumeName.trim()) ? this.perfumeName.trim() : "BESPOKE FORMULA";
    const creatorToDisplay = (this.creatorName && this.creatorName.trim()) ? this.creatorName.trim() : "WORKSHOP GUEST";

    this.labelEngine.render({
      style: this.labelStyle || "pure_bar",
      perfumeName: nameToDisplay,
      creatorName: creatorToDisplay,
      concentrationLabel: `${concProfile.badge} · 10 ML`,
      showLogo: this.showLogo,
      showSubtitle: this.showSubtitle,
      showConcentration: this.showConcentration,
      showDate: this.showDate,
      showNotes: false,
      notesSummary: notesList,
      dateStr: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()
    });
  }

  setupMobileDrawer() {
    const btnOpenDrawer = document.getElementById("btnOpenPyramidDrawer");
    const overlay = document.getElementById("mobileDrawerOverlay");
    const sheet = document.getElementById("mobileDrawerSheet");
    const btnClose = document.getElementById("btnCloseMobileDrawer");

    const openDrawer = () => {
      if (overlay) overlay.classList.add("open");
      if (sheet) sheet.classList.add("open");
    };

    const closeDrawer = () => {
      if (overlay) overlay.classList.remove("open");
      if (sheet) sheet.classList.remove("open");
    };

    if (btnOpenDrawer) btnOpenDrawer.addEventListener("click", openDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    if (btnClose) btnClose.addEventListener("click", closeDrawer);
  }

  async handlePrintLabel() {
    const printStatus = document.getElementById("printStatusText");
    if (printStatus) printStatus.textContent = "Transmitting to MacBook workshop printer...";

    try {
      this.showToast("🖨️ Transmitting sticker to MacBook printer...");
      const result = await this.labelEngine.printToMacBook(null, 140);

      if (result && result.success) {
        this.showToast("✅ Printed to Thermal Printer!");
        if (printStatus) printStatus.textContent = "✅ Printed on MacBook thermal printer!";
      } else {
        throw new Error(result?.error || "Print failed");
      }
    } catch (err) {
      console.warn("Print error:", err);
      this.showToast("ℹ️ Sticker saved to your device!");
      this.handleDownloadLabel();
      if (printStatus) {
        printStatus.textContent = "Saved 55x30mm PNG sticker to device.";
      }
    }
  }

  handleDownloadLabel() {
    const dataUrl = this.labelEngine.toDataURL();
    const link = document.createElement("a");
    link.download = `${(this.perfumeName || "koyo_fragrance").toLowerCase().replace(/\s+/g, "_")}_label_10ml.png`;
    link.href = dataUrl;
    link.click();
    this.showToast("Saved 55x30mm sticker to device!");
  }

  setupQRModal() {
    const modal = document.getElementById("qrModal");
    const btnOpen = document.getElementById("btnOpenQR");
    const btnClose = document.getElementById("btnCloseQR");

    if (btnOpen && modal) {
      btnOpen.addEventListener("click", () => {
        modal.classList.add("open");
        this.renderQRCode();
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener("click", () => modal.classList.remove("open"));
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("open");
      });
    }
  }

  renderQRCode() {
    const qrContainer = document.getElementById("qrCodeDisplay");
    const urlDisplay = document.getElementById("qrUrlDisplay");
    if (!qrContainer) return;

    const currentUrl = window.location.href;
    if (urlDisplay) urlDisplay.textContent = currentUrl;

    const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(currentUrl)}&size=240&margin=1`;
    qrContainer.innerHTML = `
      <img src="${qrApiUrl}" alt="Workshop QR Code" style="width:220px; height:220px; border-radius:12px; background:#fff; padding:10px; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
    `;
  }

  showToast(message) {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>🧴</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 200ms ease";
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  window.koyoApp = new KoyoApp();
});
