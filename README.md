# KOYO Atelier

Mobile perfume workshop for two bottles: choose your own notes, plan in grams, follow cumulative weighing targets, and download both recipes as one branded PDF.

- Production: https://koyo-atelier.vercel.app
- Deploy: push `master`; the existing Vercel Git integration publishes the static site.
- Local preview: `python3 -m http.server 8080` in this directory.
- Tests: `node --test tests/workshop.test.cjs`.
- Local printer host: `../.venv/bin/python server.py` (optional legacy print service).

The workshop target is 10 g, approximately 10 mL or 300 drops (1 g ≈ 1 mL ≈ 30 drops). Grams are authoritative; the other units are estimates. Already-started 9.60 g recipes stay fixed. Search includes hidden scent associations and typo tolerance; blend analysis uses local rules based on the actual recipe, without an external AI service.

Progress stays in the participant's browser. Legacy recipes migrate into a separate versioned key, preserving the original data. Weighing locks a recipe snapshot; exported unfinished recipes are marked as drafts. PDF generation uses locally bundled PDF-lib and sends no recipe or name data to a server.
