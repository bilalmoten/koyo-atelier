#!/usr/bin/env python3
"""KOYO Perfume Atelier - Dedicated Workshop Web & Print Server.

Hosts the interactive 10ml fragrance formulation studio for workshop guests over local Wi-Fi.
Renders a terminal QR code for instant phone scanning and handles direct thermal label printing.

Usage:
  python3 koyo-atelier/server.py
"""

import asyncio
import base64
import http.server
import io
import json
import os
import socket
import sys
import threading
import urllib.parse
from PIL import Image

# Ensure workspace root is in sys.path
workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if workspace_dir not in sys.path:
    sys.path.insert(0, os.path.join(workspace_dir, "src"))
    sys.path.insert(0, workspace_dir)

# Auto-switch to workspace .venv if running with system python
venv_python = os.path.join(workspace_dir, ".venv", "bin", "python")
if os.path.exists(venv_python) and sys.executable != venv_python:
    os.execv(venv_python, [venv_python] + sys.argv)

ATELIER_PORT = 8080
ATELIER_DIR = os.path.dirname(os.path.abspath(__file__))


def get_local_ip():
    """Detect local WiFi / LAN IP address."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip


def print_ascii_qr(url: str):
    """Render high-contrast ASCII QR code in terminal for effortless phone camera scanning."""
    try:
        import qrcode
        qr = qrcode.QRCode(border=1)
        qr.add_data(url)
        qr.make(fit=True)
        print("\n" + "─" * 58)
        print("  📱 SCAN THIS QR CODE WITH YOUR PHONE CAMERA:")
        print("─" * 58)
        qr.print_ascii(invert=True)
        print("─" * 58)
    except Exception as e:
        print("QR display note:", e)


class AtelierHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler serving Atelier frontend & handling thermal print API."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ATELIER_DIR, **kwargs)

    def _send_json(self, data: dict, status: int = 200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Connection", "close")
        self.end_headers()
        try:
            self.wfile.write(body)
            self.wfile.flush()
        except Exception:
            pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Connection", "close")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/status":
            try:
                from c26_printer.ble import get_cached_address
                addr = get_cached_address()
                self._send_json({"connected": bool(addr), "name": "MXW01", "address": addr})
            except Exception:
                self._send_json({"connected": False, "name": "MXW01 (Virtual)"})
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/print":
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length).decode("utf-8")
                payload = json.loads(body)

                data_url = payload.get("image", "")
                intensity = int(payload.get("intensity", 140))
                feed_lines = int(payload.get("feed_lines", 24))

                if "," in data_url:
                    data_url = data_url.split(",", 1)[1]
                img_bytes = base64.b64decode(data_url)
                pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

                # Save temporary image
                temp_path = os.path.join(ATELIER_DIR, "temp_label.png")
                pil_img.save(temp_path, "PNG")

                from c26_printer.converter import file_or_text_to_raster_buffers
                from c26_printer.ble import BLEPrinter

                buffers = file_or_text_to_raster_buffers(
                    temp_path,
                    dither_method="threshold",
                    brightness=1.0,
                    contrast=1.2,
                    feed_lines=feed_lines,
                )

                if buffers:
                    def print_worker():
                        try:
                            p = BLEPrinter()
                            for buf, num_lines in buffers:
                                asyncio.run(p.print_image(buf, num_lines, intensity=intensity))
                            print("✅ Label print job dispatched successfully from web app.")
                        except Exception as err:
                            print(f"ℹ️ Print error: {err}")

                    threading.Thread(target=print_worker, daemon=True).start()
                    self._send_json({"success": True, "lines": buffers[0][1], "message": "Dispatched to MacBook printer"})
                else:
                    self._send_json({"success": False, "error": "Conversion failed"})
            except Exception as e:
                print("Print API error:", e)
                self._send_json({"success": False, "error": str(e)})
            return

        self.send_error(404, "Not Found")


class ReusableThreadingServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    local_ip = get_local_ip()
    port = ATELIER_PORT
    phone_url = f"http://{local_ip}:{port}/"
    mac_url = f"http://localhost:{port}/"

    print("\n" + "═" * 62, flush=True)
    print(" 🧴 KOYO PERFUME ATELIER · 10ML FORMULATION STUDIO", flush=True)
    print("═" * 62, flush=True)
    print("\n📲 PHONE / TABLET WORKSHOP URL (Share with students):", flush=True)
    print(f"👉  \033[1;36m{phone_url}\033[0m", flush=True)
    print("\n💻 Open on Mac / Host Laptop:", flush=True)
    print(f"👉  \033[1;32m{mac_url}\033[0m", flush=True)

    print_ascii_qr(phone_url)

    print("\n✨ Workshop Features Enabled:")
    print("  • 13 Official Pure Accords with live Smelling Impressions log")
    print("  • 4 Curated Starting Archetypes + 4 Ready-Made Designer Bases")
    print("  • 10ml Precision Drop Builder with Live Scent Pyramid Analytics")
    print("  • Descriptive Concentration & Projection Profiles (Airy, Balanced, Intense)")
    print("  • Complete 10ml Recipe Sheet & Workshop Blending Walkthrough")
    print("  • 1-Tap 10ml Thermal Bottle Sticker Generator & Direct Print")
    print("═" * 62, flush=True)
    print("🚀 Workshop Server is RUNNING on port", port, "(Press Ctrl+C to stop)\n", flush=True)

    server = ReusableThreadingServer(("", port), AtelierHandler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Stopped KOYO Perfume Atelier Server.")


if __name__ == "__main__":
    main()
