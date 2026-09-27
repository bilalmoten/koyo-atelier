'use strict';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => Number(n).toFixed(2);
const roleLabel = role => ({ TOP:'Top note', HEART:'Heart note', BASE:'Base & musk' }[role]);

class KoyoApp {
  constructor() {
    this.engine = new FormulaEngine(ACCORDS_DATA);
    try { this.storage = window.localStorage; }
    catch (_) { this.storage = {getItem:()=>null,setItem:()=>{throw new Error('Storage unavailable');}}; }
    const loaded = this.engine.load(this.storage);
    this.state = loaded.state;
    // Keep an unreadable newer save available for recovery before starting fresh.
    if (loaded.recovery) {
      try { const raw = this.storage.getItem(STORAGE_KEY); if (raw) this.storage.setItem('koyo_recovery_backup', raw); }
      catch (_) { /* storage warning below remains visible */ }
    }
    this.tab = ['library','lab','recipe'].includes(location.hash.slice(1)) ? location.hash.slice(1) : (Object.keys(this.state.bottles[this.state.active].amounts).length ? 'lab' : 'library');
    this.filter = 'all'; this.query = ''; this.undo = null; this.pending = null; this.pickerQuery = '';
    this.dialog = document.getElementById('workshop-dialog');
    this.bind(); this.render();
    if (loaded.warning) this.warn(loaded.warning);
  }
  get bottle() { return this.state.bottles[this.state.active]; }
  get amounts() { return this.bottle.mode === 'plan' ? this.bottle.amounts : this.bottle.mixing.amounts; }
  name(b = this.bottle) { return b.name || `Bottle ${b.id}`; }
  save() {
    try { this.engine.save(this.storage, this.state); }
    catch (_) { this.warn('This browser cannot keep progress after a refresh. Keep this page open and download your recipes before leaving.'); }
  }
  warn(message) { const el = document.getElementById('session-warning'); el.textContent = message; el.hidden = false; }
  bind() {
    document.addEventListener('click', e => {
      const button = e.target.closest('button[data-action]');
      if (!button || button.disabled) return;
      this.action(button.dataset.action, button.dataset.id, button);
    });
    document.addEventListener('input', e => {
      const el = e.target;
      if (el.id === 'library-search') { this.query = el.value; this.renderLibrary(); }
      if (el.id === 'picker-search') { this.pickerQuery = el.value; this.renderPickerList(); }
      if (el.matches('[data-weight]')) this.inputWeight(el);
      if (el.matches('[data-name]')) { this.state.bottles[el.dataset.name].name = el.value.slice(0,60); this.save(); }
      if (el.id === 'creator') { this.state.creator = el.value.slice(0,60); this.save(); }
    });
    document.addEventListener('change', e => {
      if (e.target.id === 'gram-step') { this.state.step = Number(e.target.value); this.save(); }
      if (e.target.matches('[data-check]')) this.checkStep(e.target.dataset.check, e.target.checked);
    });
    document.addEventListener('focusout', e => {
      if (e.target.matches('[data-weight]') && e.target.getAttribute('aria-invalid') !== 'true') {
        e.target.value = money(this.bottle.amounts[e.target.dataset.weight] || 0);
      }
    });
    this.dialog.addEventListener('close', () => { this.pending = null; this.dialogOpener?.focus(); });
    this.dialog.addEventListener('click', e => { if (e.target === this.dialog) { const r=this.dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) this.dialog.close(); } });
    window.addEventListener('hashchange', () => { const next=location.hash.slice(1); if(['library','lab','recipe'].includes(next)){this.tab=next;this.render();} });
  }
  action(action, id, button) {
    switch (action) {
      case 'tab': this.showTab(id); break;
      case 'bottle': this.switchBottle(Number(id)); break;
      case 'filter': this.filter=id; this.renderLibrary(); break;
      case 'add': this.addNote(id); break;
      case 'picker': this.openPicker(); break;
      case 'scratch': this.showTab('library'); break;
      case 'analyse': this.analyseBlend(); break;
      case 'plus': this.changeWeight(id, this.state.step); break;
      case 'minus': this.changeWeight(id, -this.state.step); break;
      case 'remove': this.removeNote(id); break;
      case 'clear': this.clearBottle(); break;
      case 'copy': this.copyBottle(); break;
      case 'resize': this.resize(); break;
      case 'suggest': this.suggestAmounts(); break;
      case 'confirm': { const fn=this.pending; this.dialog.close(); this.pending=null; fn?.(); break; }
      case 'close-dialog': this.dialog.close(); break;
      case 'undo': this.undoChange(); break;
      case 'start': this.startMixing(); break;
      case 'finish': this.finish(); break;
      case 'edit': this.editPlan(); break;
      case 'pdf': this.downloadPDF(button); break;
    }
  }
  showTab(tab) {
    if (!['library','lab','recipe'].includes(tab)) return;
    if (this.hasInvalidInput()) { this.toast('Correct the highlighted weight first.'); return; }
    this.tab=tab; history.replaceState(null,'',`#${tab}`); this.render(); window.scrollTo({top:0});
  }
  switchBottle(id) {
    if (![1,2].includes(id) || this.hasInvalidInput()) { if(this.hasInvalidInput())this.toast('Correct the highlighted weight first.');return; }
    this.state.active=id; this.undo=null;
    if(this.bottle.mode==='plan'&&!Object.keys(this.bottle.amounts).length){this.tab='library';history.replaceState(null,'','#library');}
    this.save();this.render();window.scrollTo({top:0});
  }
  hasInvalidInput() { return !!document.querySelector('#view-lab input[aria-invalid="true"]'); }
  editable() {
    if (this.bottle.mode !== 'plan') { this.toast('This recipe is fixed for weighing. Return to planning to change it.'); return false; }
    return true;
  }
  remember() { this.undo = { id:this.state.active, bottle:clone(this.bottle) }; }
  undoChange() {
    if(!this.undo)return;
    this.state.bottles[this.undo.id]=this.undo.bottle;this.state.active=this.undo.id;this.undo=null;
    this.save();this.render();this.toast('Previous recipe restored.');
  }
  addNote(id) {
    if(!this.editable() || !ACCORDS_DATA.some(a=>a.id===id))return;
    if(Object.hasOwn(this.bottle.amounts,id))return;
    this.undo=null;this.bottle.amounts[id]=0;this.save();this.render();
    if(this.dialog.open && document.getElementById('picker-list')) this.renderPickerList();
    this.toast(`${ACCORDS_DATA.find(a=>a.id===id).name} selected. Set amounts or try a suggestion in My blend.`);
  }
  removeNote(id) {
    if(!this.editable())return;
    this.remember();delete this.bottle.amounts[id];this.save();this.render();this.toast('Note removed.',true);
  }
  changeWeight(id, delta) {
    if(!this.editable())return;
    const next=Math.max(0,Math.min(100,(cents(this.bottle.amounts[id]||0)+cents(delta))/100));
    this.undo=null;this.bottle.amounts[id]=next;
    const input=document.getElementById(`weight-${id}`);if(input){input.value=money(next);input.setAttribute('aria-invalid','false');document.getElementById(`error-${id}`).hidden=true;}
    this.save();this.refreshNumbers();
  }
  inputWeight(input) {
    if(!this.editable())return;
    const raw=input.value.trim(), value=Number(raw);
    const valid=raw!=='' && validWeight(value) && /^\d+(\.\d{0,2})?$/.test(raw);
    input.setAttribute('aria-invalid', String(!valid));
    const error=document.getElementById(`error-${input.dataset.weight}`);error.hidden=valid;
    if(valid){this.undo=null;this.bottle.amounts[input.dataset.weight]=cents(value)/100;this.save();}
    this.refreshNumbers();
  }
  clearBottle() {
    if(!this.editable() || !Object.keys(this.bottle.amounts).length)return;
    this.confirm('Clear this recipe?',`This clears the planned notes for Bottle ${this.state.active}. You can undo it.`, 'Clear recipe',()=>{
      this.remember();this.bottle.amounts={};this.bottle.baseline=null;this.save();this.render();this.toast('Recipe cleared.',true);
    });
  }
  copyBottle() {
    if(this.state.active!==2||!this.editable())return;
    const source=this.engine.exportBottle(this.state.bottles[1]);
    if(!Object.values(source.amounts).some(g=>g>0)){this.toast('Create Bottle 1’s recipe first.');return;}
    const copy=()=>{this.remember();this.bottle.amounts=clone(source.amounts);this.bottle.baseline=clone(source.amounts);this.save();this.render();this.toast('Bottle 1’s recipe copied. Adjust your second scent before pouring.',true);};
    if(Object.keys(this.bottle.amounts).length)this.confirm('Replace Bottle 2’s recipe?','Your current planned amounts will be replaced with Bottle 1’s recipe. You can undo this.', 'Copy & replace',copy);
    else copy();
  }
  resize() {
    if(!this.editable() || this.hasInvalidInput())return;
    try {
      const result=this.engine.scale(this.bottle.amounts),a=this.engine.analyzeFormula(this.bottle.amounts);
      if(a.ready){this.toast('Your recipe already totals 10 g.');return;}
      const rows=this.engine.compare(this.bottle.amounts,result).map(r=>`<div><span>${esc(r.name)}</span><b>${money(r.before)} → ${money(r.after)} g</b></div>`).join('');
      this.confirm('Fit the recipe to 10 g',`All amounts will be resized together, rounded to 0.01 g. This changes your plan; it cannot change liquid already poured.<div class="resize-list">${rows}</div>`, 'Use these amounts',()=>{
        this.remember();this.bottle.amounts=result;this.save();this.render();this.toast('Recipe resized to exactly 10 g.',true);
      },true);
    } catch(err){this.toast(err.message);}
  }
  suggestAmounts() {
    if(!this.editable()||this.hasInvalidInput())return;
    try {
      const suggestion=this.engine.startingRecipe(this.bottle.amounts);
      const rows=this.engine.analyzeFormula(suggestion.amounts).rows;
      const hasAmounts=Object.values(this.bottle.amounts).some(g=>g>0);
      this.confirm('A starting ratio for your notes',`<p>A suggested starting point using only your ${rows.length} selected ${rows.length===1?'note':'notes'}. Adjust it to your taste.</p><div class="suggestion-table"><div class="suggestion-heading"><span>Note</span><span>Small mix<br><strong>30 drops</strong></span><span>Full recipe<br><strong>10 g</strong></span></div>${rows.map(r=>`<div><span>${esc(r.name)}</span><b>${suggestion.drops[r.id]} ${suggestion.drops[r.id]===1?'drop':'drops'}</b><b>${money(r.grams)} g</b></div>`).join('')}</div><details class="guide small-mix-guide"><summary>Try a little before filling</summary><div><p>Use the small-mix column for one 30-drop round (about 1 g). Mix and smell.</p><p>Like it? To finish this same blend, add only these extra drops:</p><div class="resize-list">${rows.map(r=>`<div><span>${esc(r.name)}</span><b>+${suggestion.drops[r.id]*9} drops</b></div>`).join('')}</div><p>That is <strong>270 extra drops</strong>, about 300 in total including your first mix. These top-ups apply only if you keep this ratio.</p><p>Continue by this drop ratio, or weigh the full recipe from an empty bottle. Drop counts are approximate; the lab shows the full 10 g totals.</p></div></details>${hasAmounts?'<p class="footnote">Applying this suggestion replaces your planned amounts. You can undo it. It does not change anything already poured.</p>':''}`, 'Use full recipe in my blend',()=>{
        this.remember();this.bottle.amounts=suggestion.amounts;this.save();this.render();this.toast('Starting amounts added to your 10 g recipe.',true);
      },true);
    }catch(err){this.toast(err.message);}
  }
  openDialog(title,html) {
    this.dialogOpener=document.activeElement;document.getElementById('dialog-title').textContent=title;
    document.getElementById('dialog-content').innerHTML=html;if(!this.dialog.open)this.dialog.showModal();
  }
  confirm(title,text,label,fn,html=false) {
    this.openDialog(title,`<div class="muted">${html?text:esc(text)}</div><div class="actions"><button data-action="close-dialog">Cancel</button><button class="primary" data-action="confirm">${esc(label)}</button></div>`);this.pending=fn;
  }
  openPicker() {
    if(!this.editable())return;
    this.pickerQuery='';this.openDialog(`Add notes to Bottle ${this.state.active}`,`<p class="muted">Select the scents you want. Set each amount in My blend.</p><label class="search"><span class="sr-only">Search notes to add</span><input id="picker-search" type="search" placeholder="Find a note…"></label><div id="picker-list" class="picker-list"></div><div class="actions"><button class="primary" data-action="close-dialog">Done choosing</button></div>`);this.renderPickerList();
  }
  renderPickerList() {
    const notes=this.filtered(this.pickerQuery,'all');
    document.getElementById('picker-list').innerHTML=notes.length?notes.map(a=>{
      const selected=Object.hasOwn(this.bottle.amounts,a.id);
      return `<button class="picker-row" data-action="add" data-id="${a.id}" ${selected?'disabled':''}><span><strong>${esc(a.name)}</strong><small>${esc(a.shortDescription)}</small></span><span>${selected?'Selected':'+'}</span></button>`;
    }).join(''):'<p class="muted">No notes found. Try a different name or scent family.</p>';
  }
  startMixing() {
    if(this.bottle.mode!=='plan'||!this.engine.analyzeFormula(this.bottle.amounts).ready||this.hasInvalidInput())return;
    this.confirm('Ready to start weighing?', 'Your 10 g recipe will stay fixed while you weigh. Place the empty bottle on the scale and tare to zero once. Follow the cumulative targets without taring again.', 'Start weighing',()=>{
      this.undo=null;this.bottle.mixing={amounts:clone(this.bottle.amounts),checked:[]};this.bottle.mode='mixing';this.save();this.render();window.scrollTo({top:0});
    });
  }
  checkStep(id,checked) {
    if(this.bottle.mode!=='mixing')return;
    const rows=this.engine.analyzeFormula(this.bottle.mixing.amounts).rows,idx=rows.findIndex(r=>r.id===id);
    const done=this.bottle.mixing.checked.length;
    if(checked&&idx===done)this.bottle.mixing.checked.push(id);
    else if(!checked&&idx<done)this.bottle.mixing.checked=this.bottle.mixing.checked.slice(0,idx);
    this.save();this.renderRecipe();this.renderSummary();
  }
  finish() {
    const b=this.bottle;if(b.mode!=='mixing'||b.mixing.checked.length!==this.engine.analyzeFormula(b.mixing.amounts).rows.length)return;
    b.mode='complete';this.save();this.render();this.toast(`Bottle ${b.id} complete.`);window.scrollTo({top:0});
  }
  editPlan() {
    this.confirm('Return to planning?', 'This resets the weighing checklist. Editing numbers will not remove or change liquid already poured.', 'Return to planning',()=>{
      this.bottle.amounts=clone(this.bottle.mixing.amounts);this.bottle.mixing=null;this.bottle.mode='plan';this.save();this.tab='lab';this.render();
    });
  }
  filtered(query,filter) {
    return ScentTools.search(ACCORDS_DATA,query,filter);
  }
  async analyseBlend() {
    if(this.hasInvalidInput()){this.toast('Correct the highlighted weight first.');return;}
    const recipe=this.engine.analyzeFormula(this.amounts);
    this.openDialog('Your blend, explored', '<div id="analysis-result" aria-live="polite" aria-busy="true"><p class="muted" role="status">Analysing your notes and their proportions…</p></div>');
    // Let the loading state paint, then calculate locally; no artificial delay.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const target=document.getElementById('analysis-result');if(!target||!this.dialog.open)return;
    const result=ScentTools.analyse(recipe,ACCORDS_DATA);
    const colors={TOP:'#dcb779',HEART:'#c995a8',BASE:'#94b69c'};
    target.innerHTML=result.empty?`<p>${esc(result.summary)}</p>`:`<p class="eyebrow">Bottle ${this.state.active} · Scent direction</p><h3 class="analysis-title">${esc(result.title)}</h3><p class="muted">${esc(result.summary)}</p><div class="balance-bar" aria-hidden="true">${Object.entries(result.roles).map(([r,p])=>`<span style="width:${p}%;background:${colors[r]}"></span>`).join('')}</div><div class="analysis-balance">${Object.entries(result.roles).map(([r,p])=>`<span>${roleLabel(r)}<strong>${p.toFixed(1)}%</strong></span>`).join('')}</div><div class="analysis-tips">${result.tips.map(t=>`<article><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></article>`).join('')}</div><p class="footnote">Suggestions based on your notes and their proportions, not a prediction of scent strength. Your nose has the final say.</p>`;
    target.insertAdjacentHTML('beforeend','<div class="actions"><button class="primary" data-action="close-dialog">Back to my blend</button></div>');
    target.setAttribute('aria-busy','false');this.dialog.scrollTop=0;
  }
  render() {
    for(const id of ['library','lab','recipe'])document.getElementById(`view-${id}`).hidden=id!==this.tab;
    document.querySelectorAll('.navigation button').forEach(b=>{if(b.dataset.id===this.tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    this.renderHeader();this.renderLibrary();this.renderLab();this.renderRecipe();this.renderSummary();
  }
  renderHeader() {
    for(const id of [1,2]) {
      const b=this.state.bottles[id],a=this.engine.analyzeFormula(this.engine.exportBottle(b).amounts),el=document.getElementById(`bottle-${id}`);
      el.setAttribute('aria-pressed',String(id===this.state.active));el.setAttribute('aria-label',`Bottle ${id}, ${money(a.totalGrams)} grams${b.mode==='complete'?', complete':''}`);
      el.querySelector('small').textContent=`${money(a.totalGrams)} g${b.mode==='complete'?' ✓':''}`;
    }
  }
  renderSummary() {
    const a=this.engine.analyzeFormula(this.amounts),b=this.bottle;
    document.getElementById('summary-label').textContent=`Bottle ${b.id} · ${b.mode==='plan'?'Recipe plan':b.mode==='mixing'?'Weighing':'Complete'}`;
    document.getElementById('summary-weight').textContent=`${money(a.totalGrams)} / ${b.mode==='plan'?'10':money(a.totalGrams)} g`;
    document.getElementById('summary-remaining').textContent=b.mode!=='plan'?'Recipe fixed':a.remaining<0?`${money(-a.remaining)} g over target`:a.remaining>0?`${money(a.remaining)} g left`:'Target reached';
    document.getElementById('live-summary').classList.toggle('over',a.remaining<0);
    const action=document.getElementById('summary-action');
    action.dataset.id=this.tab==='recipe'?'lab':this.tab==='library'?'lab':'recipe';action.textContent=this.tab==='recipe'?'My blend':this.tab==='library'?'Adjust amounts':'Review recipe';action.disabled=this.hasInvalidInput();
  }
  renderLibrary() {
    const notes=this.filtered(this.query,this.filter);
    document.querySelectorAll('[data-action="filter"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===this.filter)));
    document.getElementById('library-count').textContent=`${notes.length} materials · selecting for Bottle ${this.state.active}`;
    document.getElementById('library-grid').innerHTML=notes.length?notes.map(a=>{
      const selected=Object.hasOwn(this.amounts,a.id),locked=this.bottle.mode!=='plan';
      return `<article class="material"><div class="material-head"><span class="role"><i class="dot" style="background:${a.color}"></i>${roleLabel(a.role)}</span><span class="muted">${esc(a.family)}</span></div><h3>${esc(a.name)}</h3><p class="description">${esc(a.shortDescription)}</p><details><summary>More about this note</summary><p>${esc(a.fullDescription)}</p><p>${esc(a.perfumerTip)}</p><p>Pairs with: ${a.pairsWith.map(esc).join(', ')}.</p></details><button class="${selected?'selected':''}" data-action="add" data-id="${a.id}" ${selected||locked?'disabled':''}>${selected?'✓ Selected':locked?'Recipe fixed for weighing':`+ Choose for Bottle ${this.state.active}`}</button></article>`;
    }).join(''):'<div class="panel"><h3>No notes found</h3><p class="muted">Try a material name or clear the search and select All 17.</p></div>';
  }
  renderLab() {
    const b=this.bottle,ids=Object.keys(b.amounts);
    document.getElementById('lab-eyebrow').textContent=`Bottle ${b.id} · ${b.mode==='plan'?'Plan your recipe':'Recipe fixed'}`;
    document.getElementById('lab-intro').textContent=b.mode==='plan'?'Choose your notes. Adjust their weights. Make something that smells like you.':'Follow your weighing checklist. This recipe stays fixed while you make it.';
    let html='';
    if(b.mode!=='plan'){
      html=`<div class="panel"><h2>${b.mode==='complete'?'Your bottle is complete.':'Your recipe is ready at the scale.'}</h2><p class="muted" style="margin-top:12px">${esc(this.name())} · ${money(this.engine.analyzeFormula(this.amounts).totalGrams)} g</p><div class="actions"><button class="primary" data-action="tab" data-id="recipe">${b.mode==='complete'?'View finished recipe':'Continue weighing'}</button><button data-action="edit">Return to planning</button></div></div>`;
    } else if(!ids.length){
      html=`<div class="panel"><h2>Start with a scent you love.</h2><p class="muted" style="margin-top:12px">Choose your notes, then set their amounts. Your target is 10 g.</p><div class="actions"><button class="primary" data-action="scratch">Choose your notes</button>${b.id===2?'<button data-action="copy">Copy Bottle 1 & make a variation</button>':''}</div></div>`;
    } else {
      html=`<div class="toolbar"><h2>Your selected notes <span class="muted">(${ids.length})</span></h2><label>+ / − step<select id="gram-step" aria-label="Weight adjustment step">${[0.01,0.05,0.1].map(g=>`<option value="${g}" ${g===this.state.step?'selected':''}>${money(g)} g</option>`).join('')}</select></label></div><div class="amount-list">${ids.map(id=>{
        const a=ACCORDS_DATA.find(a=>a.id===id);return `<article class="amount-row" id="row-${id}"><div class="amount-meta"><span class="role"><i class="dot" style="background:${a.color}"></i>${roleLabel(a.role)}</span><h3>${esc(a.name)}</h3><p class="amount-stats" data-stats="${id}"></p></div><div class="amount-controls"><button data-action="minus" data-id="${id}" aria-label="Decrease ${esc(a.name)}">−</button><label class="weight-input"><span class="sr-only">${esc(a.name)} grams</span><input id="weight-${id}" data-weight="${id}" type="number" min="0" max="100" step="0.01" inputmode="decimal" value="${money(b.amounts[id])}" aria-describedby="error-${id}" aria-invalid="false"><span>g</span></label><button data-action="plus" data-id="${id}" aria-label="Increase ${esc(a.name)}">+</button><button class="remove" data-action="remove" data-id="${id}" aria-label="Remove ${esc(a.name)}">×</button></div><p class="input-error" id="error-${id}" hidden>Enter a weight from 0 to 100 g, with up to two decimal places.</p></article>`;
      }).join('')}</div><div class="actions"><button data-action="picker">+ Add another note</button>${b.id===2?'<button data-action="copy">Copy Bottle 1</button>':''}</div><div class="actions"><button class="primary" data-action="suggest">Suggest starting amounts</button></div><div id="plan-status" style="margin-top:20px"></div><div class="actions"><button data-action="analyse">Analyse my blend</button><button data-action="resize">Fit recipe to 10 g</button><button class="primary" data-action="tab" data-id="recipe">Review & weigh</button></div><div id="blend-guide"></div><div class="actions"><button class="quiet danger" data-action="clear">Clear this recipe</button></div>`;
    }
    document.getElementById('lab-content').innerHTML=html;
    this.refreshNumbers();
  }
  refreshNumbers() {
    const a=this.engine.analyzeFormula(this.amounts);
    document.querySelectorAll('[data-stats]').forEach(el=>{const g=this.bottle.amounts[el.dataset.stats]||0;el.textContent=`${a.totalGrams?(g/a.totalGrams*100).toFixed(1):'0.0'}% of blend · est. ~${Math.round(g*30)} drops`;});
    const status=document.getElementById('plan-status');
    if(status){const zero=Object.values(this.bottle.amounts).some(g=>g===0);status.innerHTML=`<div class="notice ${a.remaining<0?'warning':''}">${this.hasInvalidInput()?'Correct the highlighted weight before continuing.':zero?'Use “Suggest starting amounts” to get a ratio, or enter your own weights.':a.remaining<0?`Your plan is ${money(-a.remaining)} g over the target. Reduce amounts or resize the recipe before weighing.`:a.remaining>0?`${money(a.remaining)} g left to plan. Add more, adjust weights, or resize the recipe.`:'Your plan totals 10 g. Review the recipe when you’re ready to weigh.'}</div>`;}
    const guide=document.getElementById('blend-guide');
    if(guide)guide.innerHTML=this.comparisonHTML();
    this.renderHeader();this.renderSummary();if(this.tab==='recipe')this.renderRecipe();
  }
  comparisonHTML() {
    const baseline=this.bottle.baseline;if(!baseline)return '';
    const changes=this.engine.compare(baseline,this.amounts);
    return `<details class="guide comparison"><summary>Changes from your Bottle 1 starting recipe (${changes.length})</summary><div>${changes.length?`<ul>${changes.map(c=>`<li><span>${esc(c.name)}</span><b>${c.diff>0?'+':''}${money(c.diff)} g</b></li>`).join('')}</ul>`:'<p>The recipes are the same so far.</p>'}</div></details>`;
  }
  renderRecipe() {
    const b=this.bottle,a=this.engine.analyzeFormula(this.amounts),mixing=b.mode==='mixing',complete=b.mode==='complete';
    document.getElementById('recipe-eyebrow').textContent=`Bottle ${b.id} · ${complete?'Complete':mixing?'At the scale':'Recipe review'}`;
    let html='';
    if(!a.rows.length){html=`<div class="panel"><h2>Your recipe starts with a note.</h2><p class="muted" style="margin-top:12px">Choose the notes you love to build your own blend.</p><div class="actions"><button class="primary" data-action="tab" data-id="lab">Plan Bottle ${b.id}</button></div></div>`;}
    else {
      html=`<div class="notice ${complete?'success':!mixing&&!a.ready?'warning':''}">${complete?'✓ All additions checked. Cap your bottle — your perfume is ready.':mixing?'<strong>Tare once, at the start.</strong> Add each material until the scale reaches its running total. Do not tare between additions.':a.ready?'Your plan totals 10 g. Check the recipe below before you begin.':`This plan is ${money(a.totalGrams)} g. Finish planning the 10 g recipe before weighing.`}</div>`;
      if(mixing)html+=`<p class="muted">${b.mixing.checked.length} of ${a.rows.length} additions checked</p><div class="progress-line"><span style="width:${b.mixing.checked.length/a.rows.length*100}%"></span></div>`;
      html+=`<div class="recipe-list">${a.rows.map((r,i)=>{
        const done=complete||b.mixing?.checked.includes(r.id);
        return `<article class="recipe-row ${done?'done':''}">${mixing?`<input class="check-step" type="checkbox" data-check="${r.id}" aria-label="${esc(r.name)} added" ${done?'checked':''} ${!done&&i!==b.mixing.checked.length?'disabled':''}>`:`<span class="step-number">${complete?'✓':String(i+1).padStart(2,'0')}</span>`}<div><span class="role">${roleLabel(r.role)}</span><h3>${esc(r.name)}</h3><p class="recipe-equivalents">Est. ~${money(r.ml)} mL · ~${r.drops} drops</p></div><div class="recipe-grams">${money(r.grams)} g</div><div class="scale-target"><span>Scale should read</span><strong>${money(r.cumulative)} g</strong></div></article>`;
      }).join('')}</div>`;
      if(b.mode==='plan')html+=`<div class="actions"><button data-action="tab" data-id="lab">Adjust recipe</button><button class="primary" data-action="start" ${!a.ready||this.hasInvalidInput()?'disabled':''}>Start weighing Bottle ${b.id}</button></div>`;
      if(mixing)html+=`<p class="muted">Added more than planned? Pause before continuing. Editing a number cannot undo an addition.</p><div class="actions"><button data-action="edit">Return to planning</button><button class="primary" data-action="finish" ${b.mixing.checked.length!==a.rows.length?'disabled':''}>Finish Bottle ${b.id}</button></div>`;
      if(complete)html+=`<div class="actions">${b.id===1?'<button class="primary" data-action="bottle" data-id="2">Create Bottle 2</button>':''}<button data-action="edit">Return to planning</button></div>`;
      html+=this.comparisonHTML();
    }
    html+=`<p class="footnote">Workshop guide: 10 g ≈ 10 mL ≈ 300 drops. Volume and drops are approximate.</p>`;
    const any=Object.values(this.state.bottles).some(b=>Object.values(this.engine.exportBottle(b).amounts).some(g=>g>0));
    html+=`<section class="download-panel"><p class="eyebrow">A small keepsake</p><h2>Your two perfumes, together.</h2><p class="muted">One KOYO PDF with both recipes and the changes you made. Names are optional.</p><div class="name-fields"><label class="creator-field">Your name<input id="creator" maxlength="60" autocomplete="name" placeholder="Created by…" value="${esc(this.state.creator)}"></label>${[1,2].map(id=>`<label>Bottle ${id} name<input data-name="${id}" maxlength="60" placeholder="Name your scent" value="${esc(this.state.bottles[id].name)}"></label>`).join('')}</div><div class="actions"><button class="primary" data-action="pdf" ${!any?'disabled':''}>Download my two perfumes</button></div><div id="pdf-result" role="status"></div><p class="footnote">Unfinished recipes are labelled as drafts. Completed recipes use the fixed weighing checklist.</p></section>`;
    document.getElementById('recipe-content').innerHTML=html;
  }
  async downloadPDF(button) {
    if(this.pdfBusy)return;this.pdfBusy=true;button.disabled=true;button.textContent='Preparing your PDF…';
    try {
      const snapshot=clone(this.state);snapshot.bottles={1:this.engine.exportBottle(snapshot.bottles[1]),2:this.engine.exportBottle(snapshot.bottles[2])};
      const bytes=await RecipePDF.create(snapshot,ACCORDS_DATA);
      if(this.pdfURL)URL.revokeObjectURL(this.pdfURL);
      this.pdfURL=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
      const link=document.createElement('a');link.href=this.pdfURL;link.download='KOYO-my-two-perfumes.pdf';document.body.append(link);link.click();link.remove();
      const result=document.getElementById('pdf-result');if(result)result.innerHTML=`<a class="export-link" href="${this.pdfURL}" target="_blank" rel="noopener">PDF ready · Open or share</a>`;
      this.toast('Your two-page PDF is ready.');
    }catch(err){this.toast('The PDF could not be created. Please try again.');console.error('PDF export:',err);}
    finally{this.pdfBusy=false;button.disabled=false;button.textContent='Download my two perfumes';}
  }
  toast(text,undo=false) {
    const el=document.getElementById('toast');clearTimeout(this.toastTimer);el.innerHTML=`${esc(text)}${undo?'<button data-action="undo">Undo</button>':''}`;el.hidden=false;
    this.toastTimer=setTimeout(()=>el.hidden=true,undo?12000:4500);
  }
}
window.addEventListener('DOMContentLoaded',()=>{try{window.koyoApp=new KoyoApp();}catch(error){console.error(error);const el=document.getElementById('session-warning');el.textContent='The workshop could not start. Please reload the page or ask your host.';el.hidden=false;}});
