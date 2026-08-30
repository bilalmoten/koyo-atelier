/**
 * KOYO Perfume Atelier - Dynamic Content-Hugging Label Canvas Engine
 * Generates razor-sharp monochrome labels calibrated for 10ml bottles (384px width).
 * Features:
 * - Content-hugging dynamic height (shrinks when info is less, zero wasted paper)
 * - Bold KOYO logo (wide, prominent, high contrast)
 * - Large bold typography matching finalized accord label design
 * - 4px solid luxury border
 * - Direct cloud relay & local print support
 */

const DEFAULT_CLOUD_RELAY = "https://136e-59-103-89-96.ngrok-free.app";

class LabelCanvasEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.width = 384;  // 58mm roll printable width at 203 DPI
    this.height = 165; // Dynamic content-hugging default
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.logoImg = null;
    this.currentOptions = null;
    this.loadLogo();

    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (this.currentOptions) this.render(this.currentOptions);
      });
    }
  }

  loadLogo() {
    this.logoImg = new Image();
    // Prefer bold logo asset
    this.logoImg.src = "assets/koyo_logo_bold.png";
    this.logoImg.onload = () => {
      if (this.currentOptions) this.render(this.currentOptions);
    };
    this.logoImg.onerror = () => {
      const alt = new Image();
      alt.src = "assets/koyo_logo_black.png";
      alt.onload = () => {
        this.logoImg = alt;
        if (this.currentOptions) this.render(this.currentOptions);
      };
    };
  }

  /**
   * Calculate exact dynamic height to hug all active contents
   */
  calculateDynamicHeight(options) {
    const {
      showLogo = true,
      showSubtitle = false,
      showConcentration = true,
      showDate = false,
      creatorName = "",
      concentrationLabel = "",
      dateStr = ""
    } = options;

    let h = 16; // Top & bottom inset margins

    // Logo height
    if (showLogo) {
      h += 54 + 8; // Logo + bottom margin
    } else {
      h += 6;
    }

    // Name Bar height
    h += 56; // Bar height

    // Subtitle / Footer items
    let footerLines = 0;
    if (showSubtitle && creatorName && creatorName.trim()) footerLines++;
    if (showConcentration && concentrationLabel && concentrationLabel.trim()) footerLines++;
    if (showDate && dateStr && dateStr.trim()) footerLines++;

    if (footerLines > 0) {
      h += footerLines * 26 + 10;
    } else {
      h += 12; // Bottom padding
    }

    return Math.max(130, Math.round(h));
  }

  /**
   * Main Render function (Content-Hugging)
   */
  render(options = {}) {
    this.currentOptions = { ...options };

    const {
      style = "pure_bar",
      perfumeName = "L'ÉTOILE NOIRE",
      creatorName = "WORKSHOP GUEST",
      concentrationLabel = "EXTRAIT DE PARFUM · 10 ML",
      showLogo = true,
      showSubtitle = false,
      showConcentration = true,
      showDate = false,
      dateStr = ""
    } = options;

    const cleanName = (perfumeName && perfumeName.trim()) ? perfumeName.trim() : "BESPOKE FORMULA";
    const cleanCreator = (creatorName && creatorName.trim()) ? creatorName.trim() : "WORKSHOP GUEST";
    const cleanConc = (concentrationLabel && concentrationLabel.trim()) ? concentrationLabel.trim() : "10 ML";

    const renderOpts = {
      ...options,
      perfumeName: cleanName,
      creatorName: cleanCreator,
      concentrationLabel: cleanConc
    };

    // Calculate dynamic hugging height
    const calculatedHeight = this.calculateDynamicHeight(renderOpts);
    this.height = calculatedHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Reset canvas to crisp solid white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";

    switch (style) {
      case "pure_bar":
        this.renderPureBar(renderOpts);
        break;
      case "noir_split":
        this.renderNoirSplit(renderOpts);
        break;
      case "haute_maison":
        this.renderHauteMaison(renderOpts);
        break;
      case "double_line":
        this.renderDoubleLine(renderOpts);
        break;
      case "minimal_float":
        this.renderMinimalFloat(renderOpts);
        break;
      default:
        this.renderPureBar(renderOpts);
    }
  }

  fitText(text, fontPrefix, maxFontSize, minFontSize, fontSuffix, maxWidth) {
    let size = maxFontSize;
    this.ctx.font = `${fontPrefix} ${size}px ${fontSuffix}`;
    while (this.ctx.measureText(text).width > maxWidth && size > minFontSize) {
      size -= 1;
      this.ctx.font = `${fontPrefix} ${size}px ${fontSuffix}`;
    }
    return size;
  }

  /**
   * Style 1: Pure Minimalist Name Bar (Exact Accord Style)
   * Bold KOYO Logo, 4px Solid Border, 56px Solid Black Name Bar, Big Bold Fonts.
   */
  renderPureBar({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Thick 4px Outer Border (matching accord label)
    const inset = 4;
    ctx.lineWidth = 4;
    ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);

    let currentY = 10;

    // 2. Bold Wide KOYO Logo
    if (showLogo) {
      this.drawBoldLogoCentered(currentY, 52, 280);
      currentY += 58;
    } else {
      currentY += 8;
    }

    // 3. Solid Black Name Bar
    const barMargin = 8;
    const barH = 56;
    const barW = w - barMargin * 2;
    const barY = currentY;

    ctx.fillStyle = "#000000";
    ctx.fillRect(barMargin, barY, barW, barH);

    // 4. Bold Perfume Name (White on Black)
    ctx.fillStyle = "#ffffff";
    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "900", 27, 14, "'Cinzel', 'Outfit', 'Futura', Helvetica, sans-serif", barW - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(nameText, w / 2, barY + barH / 2 + 1);

    // 5. Clean Bold Footer Lines (NO divider line, matching accord label)
    ctx.fillStyle = "#000000";
    ctx.textBaseline = "middle";

    let footerY = barY + barH + 16;

    if (showSubtitle && creatorName) {
      this.fitText(creatorName.toUpperCase(), "bold", 15, 10, "'Outfit', 'Futura', sans-serif", w - 30);
      ctx.fillText(creatorName.toUpperCase(), w / 2, footerY);
      footerY += 22;
    }

    if (showConcentration && concentrationLabel) {
      this.fitText(concentrationLabel.toUpperCase(), "bold", 14, 9, "'Outfit', monospace", w - 30);
      ctx.fillText(concentrationLabel.toUpperCase(), w / 2, footerY);
      footerY += 22;
    }

    if (showDate && dateStr) {
      ctx.font = "bold 12px 'Outfit', monospace";
      ctx.fillText(dateStr.toUpperCase(), w / 2, footerY);
    }
  }

  /**
   * Style 2: Noir Split
   */
  renderNoirSplit({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const splitY = showLogo ? 68 : 20;

    if (showLogo) {
      this.drawBoldLogoCentered(10, 48, 250);
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, splitY, w, h - splitY);

    ctx.fillStyle = "#ffffff";
    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "900", 26, 13, "'Cinzel', 'Outfit', sans-serif", w - 28);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(nameText, w / 2, splitY + 32);

    let subY = splitY + 58;
    if (showSubtitle && creatorName) {
      this.fitText(creatorName.toUpperCase(), "bold", 13, 9, "'Outfit', sans-serif", w - 30);
      ctx.fillText(creatorName.toUpperCase(), w / 2, subY);
      subY += 20;
    }

    let meta = "";
    if (showConcentration && concentrationLabel) meta += concentrationLabel.toUpperCase();
    if (showDate && dateStr) meta += (meta ? " · " : "") + dateStr;

    if (meta) {
      this.fitText(meta, "bold", 12, 9, "'Outfit', monospace", w - 30);
      ctx.fillText(meta, w / 2, subY);
    }
  }

  /**
   * Style 3: Haute Maison
   */
  renderHauteMaison({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.lineWidth = 2.5;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    let topY = 14;
    if (showLogo) {
      this.drawBoldLogoCentered(topY, 44, 240);
      topY += 50;
    } else {
      topY += 10;
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "900", 25, 13, "'Cinzel', 'Playfair Display', Georgia, serif", w - 40);
    ctx.fillText(nameText, w / 2, topY + 22);

    let currentY = topY + 48;

    if (showSubtitle && creatorName) {
      ctx.font = "italic 13px 'Playfair Display', serif";
      ctx.fillText(creatorName, w / 2, currentY);
      currentY += 20;
    }

    let meta = "";
    if (showConcentration && concentrationLabel) meta += concentrationLabel.toUpperCase();
    if (showDate && dateStr) meta += (meta ? " · " : "") + dateStr;

    if (meta) {
      ctx.font = "bold 12px 'Outfit', sans-serif";
      ctx.fillText(meta, w / 2, currentY);
    }
  }

  /**
   * Style 4: Double Hairline
   */
  renderDoubleLine({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    let topY = 14;
    if (showLogo) {
      this.drawBoldLogoCentered(topY, 46, 250);
      topY += 52;
    } else {
      topY += 12;
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "900", 26, 13, "'Outfit', Helvetica, sans-serif", w - 40);
    ctx.fillText(nameText, w / 2, topY + 22);

    let currentY = topY + 48;

    if (showSubtitle && creatorName) {
      this.fitText(creatorName.toUpperCase(), "bold", 13, 9, "'Outfit', sans-serif", w - 30);
      ctx.fillText(creatorName.toUpperCase(), w / 2, currentY);
      currentY += 20;
    }

    let meta = "";
    if (showConcentration && concentrationLabel) meta += concentrationLabel.toUpperCase();
    if (showDate && dateStr) meta += (meta ? " · " : "") + dateStr;

    if (meta) {
      ctx.font = "bold 12px monospace";
      ctx.fillText(meta, w / 2, currentY);
    }
  }

  /**
   * Style 5: Minimal Floating (Ultra clean with no outer border)
   */
  renderMinimalFloat({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    let topY = 14;
    if (showLogo) {
      this.drawBoldLogoCentered(topY, 52, 280);
      topY += 58;
    } else {
      topY += 14;
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "900", 27, 14, "'Cinzel', 'Outfit', Georgia, serif", w - 30);
    ctx.fillText(nameText, w / 2, topY + 24);

    let currentY = topY + 52;

    if (showSubtitle && creatorName) {
      ctx.font = "italic 14px 'Playfair Display', serif";
      ctx.fillText(creatorName, w / 2, currentY);
      currentY += 22;
    }

    let meta = "";
    if (showConcentration && concentrationLabel) meta += concentrationLabel.toUpperCase();
    if (showDate && dateStr) meta += (meta ? " · " : "") + dateStr;

    if (meta) {
      ctx.font = "bold 12px monospace";
      ctx.fillText(meta, w / 2, currentY);
    }
  }

  /**
   * Draw big bold KOYO logo with high prominence
   */
  drawBoldLogoCentered(topY, targetH, targetMaxW = 280) {
    if (this.logoImg && this.logoImg.complete && this.logoImg.naturalWidth > 0) {
      const aspect = this.logoImg.naturalWidth / this.logoImg.naturalHeight;
      let targetW = targetH * aspect;
      if (targetW > targetMaxW) {
        targetW = targetMaxW;
        targetH = targetW / aspect;
      }
      const x = (this.width - targetW) / 2;
      this.ctx.drawImage(this.logoImg, x, topY, targetW, targetH);
    } else {
      this.ctx.fillStyle = "#000000";
      this.ctx.font = "900 28px 'Cinzel', Georgia, serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("K O Y O", this.width / 2, topY + targetH / 2);
    }
  }

  toDataURL() {
    return this.canvas.toDataURL("image/png");
  }

  /**
   * Universal Smart Print
   */
  async printToMacBook(customEndpoint = null, intensity = 140) {
    const isLocal = window.location.hostname === "localhost" || 
                    window.location.hostname === "127.0.0.1" || 
                    window.location.hostname.startsWith("192.168.");

    let endpoint = "/api/print";
    if (!isLocal) {
      const savedRelay = localStorage.getItem("koyo_custom_relay") || DEFAULT_CLOUD_RELAY;
      endpoint = `${savedRelay.replace(/\/$/, "")}/api/print`;
    }

    if (customEndpoint) {
      endpoint = customEndpoint;
    }

    const payload = {
      image: this.toDataURL(),
      intensity: intensity,
      paper_mode: "label_tight",
      feed_lines: 20
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1"
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      throw new Error(`Server returned HTTP ${resp.status}`);
    }

    return await resp.json();
  }
}
