/**
 * KOYO Perfume Atelier - Label Canvas Engine & Thermal Print Formatter
 * Generates razor-sharp 384x240px (55mm x 30mm) monochrome labels for 10ml bottles.
 * Features:
 * - Real-time reactive rendering
 * - Cloud-to-MacBook Relay Printing (works on Vercel, iPhone Safari, Android & Mac)
 * - Local Python API direct print
 * - Fallback image download
 */

const DEFAULT_CLOUD_RELAY = "https://136e-59-103-89-96.ngrok-free.app";

class LabelCanvasEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.width = 384;  // 55mm printable width at 203 DPI
    this.height = 240; // 30mm height at 203 DPI
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.logoImg = null;
    this.currentOptions = null;
    this.loadLogo();

    // Re-render when web fonts finish downloading
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (this.currentOptions) this.render(this.currentOptions);
      });
    }
  }

  loadLogo() {
    this.logoImg = new Image();
    this.logoImg.src = "assets/koyo_logo_black.png";
    this.logoImg.onload = () => {
      if (this.currentOptions) this.render(this.currentOptions);
    };
    this.logoImg.onerror = () => {
      const altLogo = new Image();
      altLogo.src = "assets/koyo-logo.png";
      altLogo.onload = () => {
        this.logoImg = altLogo;
        if (this.currentOptions) this.render(this.currentOptions);
      };
    };
  }

  /**
   * Main Render function (55mm x 30mm / 384x240px)
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

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Reset canvas to solid crisp white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";

    const cleanName = (perfumeName && perfumeName.trim()) ? perfumeName.trim() : "BESPOKE FORMULA";
    const cleanCreator = (creatorName && creatorName.trim()) ? creatorName.trim() : "WORKSHOP GUEST";
    const cleanConc = (concentrationLabel && concentrationLabel.trim()) ? concentrationLabel.trim() : "10 ML";

    const renderOpts = {
      ...options,
      perfumeName: cleanName,
      creatorName: cleanCreator,
      concentrationLabel: cleanConc
    };

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
   * Style 1: Pure Minimalist Name Bar (Calibrated 384x240 / 30mm)
   */
  renderPureBar({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.lineWidth = 2.5;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    let currentY = 18;

    if (showLogo) {
      this.drawLogoCentered(currentY, 38);
      currentY += 46;
    } else {
      currentY += 12;
    }

    const barH = 62;
    const barY = Math.min(125, Math.max(currentY, (h - barH) / 2 - 8));
    ctx.fillStyle = "#000000";
    ctx.fillRect(18, barY, w - 36, barH);

    ctx.fillStyle = "#ffffff";
    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "bold", 24, 12, "'Cinzel', 'Playfair Display', Georgia, serif", w - 48);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(nameText, w / 2, barY + barH / 2);

    ctx.fillStyle = "#000000";
    ctx.textBaseline = "alphabetic";

    let footerY = barY + barH + 20;

    if (showSubtitle && creatorName) {
      ctx.font = "bold 11px 'Outfit', sans-serif";
      ctx.fillText(creatorName.toUpperCase(), w / 2, footerY);
      footerY += 15;
    }

    let footerMeta = "";
    if (showConcentration && concentrationLabel) {
      footerMeta += concentrationLabel.toUpperCase();
    }
    if (showDate && dateStr) {
      footerMeta += (footerMeta ? " · " : "") + dateStr;
    }

    if (footerMeta) {
      ctx.font = "600 10.5px 'Outfit', monospace";
      ctx.fillText(footerMeta, w / 2, footerY);
    }
  }

  /**
   * Style 2: Noir Split (50/50 Inverted Top/Bottom)
   */
  renderNoirSplit({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (showLogo) {
      this.drawLogoCentered(16, 38);
    }
    ctx.fillStyle = "#000000";
    ctx.font = "bold 11px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("KOYO PERFUME ATELIER", w / 2, 70);

    const splitY = 86;
    ctx.fillRect(0, splitY, w, h - splitY);

    ctx.fillStyle = "#ffffff";
    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "bold", 23, 12, "'Cinzel', Georgia, serif", w - 36);
    ctx.textAlign = "center";
    ctx.fillText(nameText, w / 2, splitY + 44);

    let subY = splitY + 70;
    if (showSubtitle && creatorName) {
      ctx.font = "bold 11px 'Outfit', sans-serif";
      ctx.fillText(creatorName.toUpperCase(), w / 2, subY);
      subY += 18;
    }

    let meta = "";
    if (showConcentration && concentrationLabel) meta += concentrationLabel.toUpperCase();
    if (showDate && dateStr) meta += (meta ? " · " : "") + dateStr;

    if (meta) {
      ctx.font = "500 10px 'Outfit', monospace";
      ctx.fillText(meta, w / 2, subY);
    }
  }

  /**
   * Style 3: Haute Maison (Classic Serif with Flourish Borders)
   */
  renderHauteMaison({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.lineWidth = 0.5;
    ctx.strokeRect(14, 14, w - 28, h - 28);

    let topY = 20;
    if (showLogo) {
      this.drawLogoCentered(topY, 34);
      topY += 44;
    } else {
      topY += 20;
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";

    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "bold", 23, 12, "'Cinzel', 'Bodoni 72', Georgia, serif", w - 44);
    ctx.fillText(nameText, w / 2, topY + 40);

    let currentY = topY + 62;

    if (showSubtitle && creatorName) {
      ctx.font = "italic 12px 'Playfair Display', Georgia, serif";
      ctx.fillText(creatorName, w / 2, currentY);
      currentY += 18;
    }

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, currentY);
    ctx.lineTo(w - 70, currentY);
    ctx.stroke();

    currentY += 18;

    let meta = "";
    if (showConcentration && concentrationLabel) meta += concentrationLabel.toUpperCase();
    if (showDate && dateStr) meta += (meta ? " · " : "") + dateStr;

    if (meta) {
      ctx.font = "bold 10px 'Outfit', sans-serif";
      ctx.fillText(meta, w / 2, currentY);
    }
  }

  /**
   * Style 4: Double Hairline (Clean Geometric Minimalist)
   */
  renderDoubleLine({ perfumeName, creatorName, concentrationLabel, showLogo, showSubtitle, showConcentration, showDate, dateStr }) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.lineWidth = 0.5;
    ctx.strokeRect(14, 14, w - 28, h - 28);

    let topY = 20;
    if (showLogo) {
      this.drawLogoCentered(topY, 36);
      topY += 46;
    } else {
      topY += 22;
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";

    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "bold", 22, 12, "'Outfit', Helvetica, sans-serif", w - 44);
    ctx.fillText(nameText, w / 2, topY + 38);

    let currentY = topY + 60;

    if (showSubtitle && creatorName) {
      ctx.font = "bold 11px 'Outfit', sans-serif";
      ctx.fillText(creatorName.toUpperCase(), w / 2, currentY);
      currentY += 16;
    }

    ctx.fillRect(50, currentY, w - 100, 2);
    currentY += 18;

    let meta = "";
    if (showConcentration && concentrationLabel) meta += concentrationLabel.toUpperCase();
    if (showDate && dateStr) meta += (meta ? " · " : "") + dateStr;

    if (meta) {
      ctx.font = "500 10.5px monospace";
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

    let topY = 22;
    if (showLogo) {
      this.drawLogoCentered(topY, 40);
      topY += 50;
    } else {
      topY += 28;
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";

    const nameText = perfumeName.toUpperCase();
    this.fitText(nameText, "bold", 24, 12, "'Cinzel', Georgia, serif", w - 40);
    ctx.fillText(nameText, w / 2, topY + 40);

    let currentY = topY + 64;

    if (showSubtitle && creatorName) {
      ctx.font = "italic 13px 'Playfair Display', Georgia, serif";
      ctx.fillText(creatorName, w / 2, currentY);
      currentY += 18;
    }

    let meta = "";
    if (showConcentration && concentrationLabel) meta += concentrationLabel.toUpperCase();
    if (showDate && dateStr) meta += (meta ? " · " : "") + dateStr;

    if (meta) {
      ctx.font = "bold 10.5px monospace";
      ctx.fillText(meta, w / 2, currentY);
    }
  }

  drawLogoCentered(topY, targetH) {
    if (this.logoImg && this.logoImg.complete && this.logoImg.naturalWidth > 0) {
      const aspect = this.logoImg.naturalWidth / this.logoImg.naturalHeight;
      const targetW = targetH * aspect;
      const x = (this.width - targetW) / 2;
      this.ctx.drawImage(this.logoImg, x, topY, targetW, targetH);
    } else {
      this.ctx.fillStyle = "#000000";
      this.ctx.font = "bold 20px 'Cinzel', Georgia, serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("K O Y O", this.width / 2, topY + targetH - 10);
    }
  }

  toDataURL() {
    return this.canvas.toDataURL("image/png");
  }

  /**
   * Universal Smart Print:
   * 1. If running locally on MacBook, POST /api/print directly
   * 2. If running on Vercel or Phone, POST to Cloud Relay (ngrok) -> MacBook -> Thermal Printer
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
      paper_mode: "label_30mm",
      feed_lines: 24
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
