# KOYO Atelier

Mobile perfume workshop for two bottles: choose notes or a starter, plan in grams, follow cumulative weighing targets, and download both recipes as one branded PDF.

- Production: https://koyo-atelier.vercel.app
- Deploy: push `master`; the existing Vercel Git integration publishes the static site.
- Local preview: `python3 -m http.server 8080` in this directory.
- Tests: `node --test tests/workshop.test.cjs`.
- Local printer host: `../.venv/bin/python server.py` (optional legacy print service).

Grams are authoritative. The current 9.60 g target and conversions of 0.96 g/mL and 0.03 g/drop are workshop estimates, not calibrated material measurements. Confirm the physical bottle fill and material suitability with the host. No third trial bottle is required.

Progress stays in the participant's browser. Legacy recipes migrate into a separate versioned key, preserving the original data. Weighing locks a recipe snapshot; exported unfinished recipes are marked as drafts. PDF generation uses locally bundled PDF-lib and sends no recipe or name data to a server.
