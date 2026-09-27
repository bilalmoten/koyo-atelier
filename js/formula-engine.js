/* Grams are authoritative. Volume and drops are estimates, never fill measurements. */
(function (root) {
  'use strict';
  const TARGET = 960;
  const STORAGE_KEY = 'koyo_workshop_v3';
  const clone = value => JSON.parse(JSON.stringify(value));
  const cents = value => Math.round((Number(value) + Number.EPSILON) * 100);
  const validWeight = value => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100;
  const emptyBottle = id => ({ id, name: '', amounts: {}, mode: 'plan', mixing: null, baseline: null });
  const initialState = () => ({ version: 3, unit: 'grams', active: 1, step: 0.05, creator: '', bottles: { 1: emptyBottle(1), 2: emptyBottle(2) } });

  class FormulaEngine {
    constructor(materials = []) { this.materials = materials; this.targetGrams = TARGET / 100; }
    cleanAmounts(input) {
      const known = new Set(this.materials.map(a => a.id));
      const out = {};
      if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
      for (const [id, value] of Object.entries(input)) {
        if (known.has(id) && validWeight(value)) out[id] = cents(value) / 100;
      }
      return out;
    }
    analyzeFormula(amounts = {}) {
      const clean = this.cleanAmounts(amounts);
      const totalCents = Object.values(clean).reduce((n, g) => n + cents(g), 0);
      const roles = { TOP: 0, HEART: 0, BASE: 0 };
      const order = { BASE: 0, HEART: 1, TOP: 2 };
      let cumulative = 0;
      const rows = this.materials.filter(a => (clean[a.id] || 0) > 0)
        .sort((a, b) => order[a.role] - order[b.role] || a.name.localeCompare(b.name))
        .map(a => {
          const weight = cents(clean[a.id]); roles[a.role] += weight; cumulative += weight;
          return { ...a, grams: weight / 100, percentage: totalCents ? weight / totalCents * 100 : 0,
            cumulative: cumulative / 100, ml: weight / 100 / 0.96, drops: Math.round(weight / 3) };
        });
      return { rows, totalCents, totalGrams: totalCents / 100, targetGrams: TARGET / 100,
        remaining: (TARGET - totalCents) / 100, totalMl: totalCents / 100 / 0.96,
        totalDrops: Math.round(totalCents / 3), fillPercent: totalCents / TARGET * 100,
        ready: totalCents === TARGET && rows.length > 0 && !Object.values(clean).some(g => g === 0),
        roles: Object.fromEntries(Object.entries(roles).map(([k, n]) => [k, totalCents ? n / totalCents * 100 : 0])) };
    }
    scale(amounts) {
      const clean = this.cleanAmounts(amounts);
      const entries = Object.entries(clean).filter(([, g]) => g > 0);
      const total = entries.reduce((sum, [, g]) => sum + cents(g), 0);
      if (!total) throw new Error('Enter an amount for at least one note first.');
      const rows = entries.map(([id, g]) => {
        const raw = cents(g) * TARGET / total;
        if (raw < 1) throw new Error('A note would be below 0.01 g. Remove it or increase its share before resizing.');
        return { id, n: Math.floor(raw), fraction: raw - Math.floor(raw) };
      });
      let remainder = TARGET - rows.reduce((sum, r) => sum + r.n, 0);
      rows.sort((a, b) => b.fraction - a.fraction || a.id.localeCompare(b.id));
      rows.forEach(row => { if (remainder > 0) { row.n++; remainder--; } });
      return Object.fromEntries(rows.map(r => [r.id, r.n / 100]));
    }
    compare(before = {}, after = {}) {
      return this.materials.map(a => ({ id: a.id, name: a.name,
        before: Number(before[a.id]) || 0, after: Number(after[a.id]) || 0,
        diff: (cents(after[a.id] || 0) - cents(before[a.id] || 0)) / 100 }))
        .filter(r => r.diff !== 0).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    }
    normalize(raw) {
      const state = initialState();
      state.active = Number(raw.active) === 2 ? 2 : 1;
      state.step = [0.01, 0.05, 0.1].includes(Number(raw.step)) ? Number(raw.step) : 0.05;
      state.creator = String(raw.creator || '').slice(0, 60);
      for (const id of [1, 2]) {
        const b = raw.bottles?.[id] || {};
        state.bottles[id] = { ...emptyBottle(id), name: String(b.name || '').slice(0, 60), amounts: this.cleanAmounts(b.amounts),
          baseline: b.baseline ? this.cleanAmounts(b.baseline) : null };
        if (b.mixing?.amounts && ['mixing', 'complete'].includes(b.mode)) {
          const amounts = this.cleanAmounts(b.mixing.amounts);
          if (this.analyzeFormula(amounts).ready) {
            const ids = this.analyzeFormula(amounts).rows.map(row=>row.id);
            const savedChecks = new Set(Array.isArray(b.mixing.checked) ? b.mixing.checked : []);
            const firstMissing = ids.findIndex(id=>!savedChecks.has(id));
            const checked = ids.slice(0,firstMissing===-1?ids.length:firstMissing);
            state.bottles[id].mixing = { amounts, checked };
            state.bottles[id].mode = b.mode === 'complete' && checked.length === ids.length ? 'complete' : 'mixing';
          }
        }
      }
      return state;
    }
    load(storage) {
      try {
        const current = storage.getItem(STORAGE_KEY);
        if (current) {
          const raw = JSON.parse(current);
          if (raw.version !== 3 || raw.unit !== 'grams') throw new Error('Unknown saved format');
          return { state: this.normalize(raw), warning: '' };
        }
        const legacy = storage.getItem('koyo_oil_bottles');
        if (!legacy) return { state: initialState(), warning: '' };
        const old = JSON.parse(legacy);
        const grams = storage.getItem('koyo_unit_grams_v2') === 'true';
        const state = initialState();
        state.active = storage.getItem('koyo_active_bottle') === '2' ? 2 : 1;
        for (const id of [1, 2]) {
          const b = old[id] || {};
          const entries = Object.entries(b.amounts || {});
          const amounts = entries.length ? Object.fromEntries(entries.map(([k, v]) => [k, Number(v) * (grams ? 1 : 0.96)]))
            : Object.fromEntries(Object.entries(b.drops || {}).map(([k, v]) => [k, Number(v) * 0.03]));
          state.bottles[id].amounts = this.cleanAmounts(amounts);
          state.bottles[id].name = String(b.name || '').slice(0, 60);
          if (b.creator && b.creator !== 'WORKSHOP GUEST') state.creator = String(b.creator).slice(0, 60);
        }
        // Atomic schema migration. Legacy data remains intact for recovery.
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        return { state, warning: '' };
      } catch (err) {
        return { state: initialState(), warning: 'Previous progress could not be loaded. This page is using a fresh session.', recovery: true };
      }
    }
    save(storage, state) { storage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    exportBottle(bottle) {
      return { ...clone(bottle), amounts: clone(bottle.mixing && bottle.mode !== 'plan' ? bottle.mixing.amounts : bottle.amounts) };
    }
  }
  const api = { FormulaEngine, initialState, STORAGE_KEY, cents, validWeight, clone };
  if (typeof module !== 'undefined') module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
