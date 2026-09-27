const test = require('node:test');
const assert = require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {FormulaEngine,initialState,STORAGE_KEY}=require('../js/formula-engine');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(require.resolve('../js/data.js'),'utf8')+';this.materials=ACCORDS_DATA;this.presets=STARTING_PRESETS;',context);
const materials=JSON.parse(JSON.stringify(context.materials)),presets=JSON.parse(JSON.stringify(context.presets));
const engine=new FormulaEngine(materials);
const store=(entries={})=>{const m=new Map(Object.entries(entries));return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),m};};
test('equal ingredients, percentages, cumulative order and overfill',()=>{
 const a=engine.analyzeFormula({'fresh-citrus':1,pineapple:1});assert.equal(a.rows[0].percentage,50);assert.equal(a.rows[1].percentage,50);
 const b=engine.analyzeFormula({vanilla:4,hedione:4,'fresh-citrus':4});assert.equal(b.totalGrams,12);assert.equal(b.remaining,-2.4);assert.equal(b.fillPercent,125);assert.equal(b.ready,false);assert.deepEqual(b.rows.map(r=>r.role),['BASE','HEART','TOP']);assert.equal(b.rows.at(-1).cumulative,12);
});
test('all starters total exactly 9.60 after scaling; no extra ingredient invented',()=>{
 for(const p of presets){const scaled=engine.scale(p.amounts),a=engine.analyzeFormula(scaled);assert.equal(a.totalCents,960,p.title);assert.equal(a.ready,true);assert.deepEqual(Object.keys(scaled).sort(),Object.keys(p.amounts).sort());}
});
test('rounding regression and near-target values scale to exact target',()=>{
 for(const amounts of [{vanilla:9,oud:.03},{vanilla:9.59},{vanilla:9.61},{vanilla:.01,oud:.01,hedione:.01}])assert.equal(engine.analyzeFormula(engine.scale(amounts)).totalCents,960);
 assert.throws(()=>engine.scale({vanilla:100,oud:.01}),/below 0.01/);
 assert.throws(()=>engine.scale({}),/at least one/);
});
test('random scaling preserves target and each share within one scale division',()=>{
 let seed=927;for(let i=0;i<500;i++){
  const next=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
  const amounts=Object.fromEntries(materials.slice(0,3+next()%15).map(a=>[a.id,(10+next()%990)/100]));
  const total=Object.values(amounts).reduce((a,b)=>a+b,0),scaled=engine.scale(amounts);
  assert.equal(engine.analyzeFormula(scaled).totalCents,960);
  for(const [id,g]of Object.entries(amounts))assert.ok(Math.abs(scaled[id]-g/total*9.6)<.0100001);
 }
});
test('zero selected notes block making until assigned or removed',()=>{
 assert.equal(engine.analyzeFormula({vanilla:9.6,oud:0}).ready,false);
 assert.equal(engine.analyzeFormula({vanilla:9.6}).ready,true);
});
test('mL migration persists the converted data and schema together, exactly once',()=>{
 const s=store({koyo_oil_bottles:JSON.stringify({1:{amounts:{vanilla:1}},2:{amounts:{}}})});
 const first=engine.load(s);assert.equal(first.state.bottles[1].amounts.vanilla,.96);
 const second=engine.load(s);assert.equal(second.state.bottles[1].amounts.vanilla,.96);
 assert.equal(JSON.parse(s.getItem(STORAGE_KEY)).unit,'grams');assert.ok(s.getItem('koyo_oil_bottles'));
});
test('grams and original drops migrate without conversion drift',()=>{
 let s=store({koyo_unit_grams_v2:'true',koyo_oil_bottles:JSON.stringify({1:{amounts:{vanilla:1}},2:{amounts:{}}}),koyo_active_bottle:'2'});
 assert.equal(engine.load(s).state.bottles[1].amounts.vanilla,1);assert.equal(engine.load(s).state.active,2);
 s=store({koyo_oil_bottles:JSON.stringify({1:{drops:{vanilla:32}},2:{}})});assert.equal(engine.load(s).state.bottles[1].amounts.vanilla,.96);
});
test('state recovery does not overwrite corrupt data',()=>{
 const s=store({[STORAGE_KEY]:'broken json'});const r=engine.load(s);assert.equal(r.recovery,true);assert.equal(s.getItem(STORAGE_KEY),'broken json');
});
test('selected zero amounts and frozen weighing progress survive reload',()=>{
 const state=initialState();state.active=2;state.bottles[1].amounts={oud:0};state.bottles[2].amounts={vanilla:8,oud:1.6};
 state.bottles[2].mode='mixing';state.bottles[2].mixing={amounts:{vanilla:8,oud:1.6},checked:['oud']};
 const s=store();engine.save(s,state);const result=engine.load(s).state;
 assert.equal(result.active,2);assert.equal(result.bottles[1].amounts.oud,0);assert.deepEqual(result.bottles[2].mixing.checked,['oud']);
});
test('fixed recipe export cannot be changed by later draft edits',()=>{
 const b=initialState().bottles[1];b.mode='complete';b.amounts={vanilla:2};b.mixing={amounts:{vanilla:9.6},checked:['vanilla']};
 const exported=engine.exportBottle(b);assert.equal(exported.amounts.vanilla,9.6);exported.amounts.vanilla=1;assert.equal(b.mixing.amounts.vanilla,9.6);
});
test('bad numbers, unknown materials and unsafe state are rejected',()=>{
 const out=engine.cleanAmounts({vanilla:Infinity,oud:-3,hedione:NaN,'fresh-citrus':200,unknown:3,pineapple:1});assert.deepEqual(out,{pineapple:1});
 const state=engine.normalize({active:9,bottles:{1:{mode:'complete',mixing:{amounts:{vanilla:1},checked:['vanilla']}}}});assert.equal(state.active,1);assert.equal(state.bottles[1].mode,'plan');
});
