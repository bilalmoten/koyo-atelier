/**
 * KOYO Perfume Atelier - Label Canvas Engine & Web Bluetooth Thermal Print Formatter
 * Generates razor-sharp 384x240px (55mm x 30mm) monochrome labels for 10ml bottles.
 * Features:
 * - Real-time reactive rendering
 * - Direct Client-Side Web Bluetooth (WebBLE) Printing (works on Vercel cloud!)
 * - Local Python API print fallback
 * - Auto-download fallback for iOS Safari
 */

const CRC_TABLE = [
  0, 7, 14, 9, 28, 27, 18, 21, 56, 63, 54, 49, 36, 35, 42, 45,
  112, 119, 126, 121, 108, 107, 98, 101, 72, 79, 70, 65, 84, 83, 90, 93,
  224, 231, 238, 233, 252, 251, 242, 245, 216, 223, 214, 209, 196, 195, 202, 205,
  144, 151, 158, 153, 140, 139, 130, 133, 168, 175, 166, 161, 180, 179, 186, 189,
  199, 192, 201, 206, 219, 220, 213, 210, 255, 248, 241, 246, 227, 228, 237, 234,
  183, 176, 185, 190, 171, 172, 165, 162, 143, 136, 129, 134, 147, 148, 157, 154,
  39, 32, 41, 46, 59, 60, 53, 50, 31, 24, 17, 22, 3, 4, 13, 10,
  87, 80, 89, 94, 75, 76, 69, 66, 111, 104, 97, 102, 115, 116, 125, 122,
  137, 142, 135, 128, 149, 146, 155, 156, 177, 182, 191, 184, 173, 170, 163, 164,
  249, 254, 247, 240, 229, 226, 235, 236, 193, 198, 207, 200, 221, 218, 211, 212,
  105, 110, 103, 96, 117, 114, 123, 124, 81, 86, 95, 88, 77, 74, 67, 68,
  25, 30, 23, 16, 5, 2, 11, 12, 33, 38, 47, 40, 61, 58, 51, 52,
  78, 73, 64, 71, 82, 85, 92, 91, 118, 113, 120, 127, 106, 109, 100, 99,
  62, 57, 48, 55, 34, 37, 44, 43, 6, 1, 8, 15, 26, 29, 20, 19,
  174, 169, 160, 167, 178, 181, 188, 187, 150, 145, 152, 159, 138, 141, 132, 131,
  222, 217, 208, 215, 194, 197, 204, 203, 230, 225, 232, 239, 250, 253, 244, 243
];

function calcCrc8(bytes) {
  let crc = 0;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF];
  }
  return crc & 0xFF;
}

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

  /**
   * Helper: Auto-fit text within a maximum width
   */
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
   * Convert canvas to 1-bit raster monochrome buffer (384px width, 48 bytes per row)
   */
  getMonochromeBuffer() {
    const w = this.width;   // 384
    const h = this.height;  // 240
    const imgData = this.ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const bytesPerRow = w / 8; // 48
    const totalLines = h + 24; // 24 lines bottom padding
    const buffer = new Uint8Array(totalLines * bytesPerRow);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        if (brightness < 180) { // Black pixel
          const byteIdx = y * bytesPerRow + Math.floor(x / 8);
          const bitIdx = x % 8;
          buffer[byteIdx] |= (1 << bitIdx);
        }
      }
    }

    return { buffer, totalLines, bytesPerRow };
  }

  /**
   * Build C26/MXW01 packet
   */
  formatPacket(cmdId, payload = new Uint8Array(0)) {
    const len = payload.length;
    const packet = new Uint8Array(4 + 2 + len + 2);
    packet[0] = 0x22;
    packet[1] = 0x21;
    packet[2] = cmdId;
    packet[3] = 0x00;
    packet[4] = len & 0xFF;
    packet[5] = (len >> 8) & 0xFF;
    packet.set(payload, 6);
    packet[6 + len] = calcCrc8(payload);
    packet[7 + len] = 0xFF;
    return packet;
  }

  /**
   * Direct Web Bluetooth (WebBLE) Printer Dispatch
   * Directly pairs with the physical thermal printer from Chrome/Edge on phone/PC!
   */
  async printViaWebBluetooth(intensity = 93) {
    if (!navigator.bluetooth) {
      throw new Error("Web Bluetooth is not supported in this browser. Please use Chrome/Edge or download PNG.");
    }

    const SERVICE_UUID = "0000ae30-0000-1000-8000-00805f9b34fb";
    const CONTROL_CHAR = "0000ae01-0000-1000-8000-00805f9b34fb";
    const DATA_CHAR = "0000ae03-0000-1000-8000-00805f9b34fb";

    console.log("Requesting Bluetooth device...");
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [SERVICE_UUID] },
        { namePrefix: "MXW" },
        { namePrefix: "C26" },
        { namePrefix: "C9" },
        { namePrefix: "Cat" },
        { namePrefix: "Print" }
      ],
      optionalServices: [SERVICE_UUID, "0000af30-0000-1000-8000-00805f9b34fb", 0xae30, 0xaf30]
    });

    console.log("Connecting to GATT server...");
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    const controlChar = await service.getCharacteristic(CONTROL_CHAR);
    const dataChar = await service.getCharacteristic(DATA_CHAR);

    // 1. Set Intensity
    const intensityPacket = this.formatPacket(0xA2, new Uint8Array([intensity]));
    await controlChar.writeValueWithoutResponse(intensityPacket);
    await new Promise(r => setTimeout(r, 60));

    // 2. Prepare Buffer
    const { buffer, totalLines } = this.getMonochromeBuffer();

    // 3. Print Request
    const reqPayload = new Uint8Array([totalLines & 0xFF, (totalLines >> 8) & 0xFF, 48, 0]);
    const reqPacket = this.formatPacket(0xA9, reqPayload);
    await controlChar.writeValueWithoutResponse(reqPacket);
    await new Promise(r => setTimeout(r, 120));

    // 4. Stream raster chunks (48 bytes per row)
    const chunkSize = 48;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      await dataChar.writeValueWithoutResponse(chunk);
      await new Promise(r => setTimeout(r, 15));
    }

    // 5. Flush Data
    const flushPacket = this.formatPacket(0xAD, new Uint8Array([0x00]));
    await controlChar.writeValueWithoutResponse(flushPacket);

    await new Promise(r => setTimeout(r, 600));
    device.gatt.disconnect();

    return { success: true, message: "Printed directly via Web Bluetooth!" };
  }

  /**
   * Dual-mode smart print:
   * 1. If on local server, try local HTTP print API
   * 2. If on Vercel or cloud HTTPS, try Web Bluetooth
   * 3. Fallback to download
   */
  async smartPrint(intensity = 135) {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.");

    if (isLocalhost) {
      try {
        const resp = await fetch("/api/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: this.toDataURL(),
            intensity: intensity,
            paper_mode: "label_30mm",
            feed_lines: 20
          })
        });
        const json = await resp.json();
        if (json && json.success) return json;
      } catch (e) {
        console.log("Local API print failed, falling back to Web Bluetooth...");
      }
    }

    // Cloud / Vercel: Use Web Bluetooth
    return await this.printViaWebBluetooth(intensity);
  }
}
