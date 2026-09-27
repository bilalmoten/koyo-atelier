/* Local search and recipe-based scent guidance. No remote AI or data transfer. */
(function(root){
  'use strict';
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const stopWords = new Set(['a','an','and','the','for','something','smell','smells','scent','perfume','note','notes','like','with']);
  function distance(a,b) {
    let row=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++) {const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;}
    return row[b.length];
  }
  const indexCache=new WeakMap();
  function index(note) {
    if(!indexCache.has(note)){
      const name=normalize(note.name),text=normalize([note.name,note.family,note.shortDescription,note.fullDescription,...(note.tags||[]),...(note.searchTags||[])].join(' '));
      indexCache.set(note,{name,words:[...new Set(text.split(' '))]});
    }
    return indexCache.get(note);
  }
  function search(materials,query='',role='all') {
    const q=normalize(query),terms=q.split(' ').filter(t=>t&&!stopWords.has(t));
    return materials.filter(n=>role==='all'||n.role===role).map(note=>{
      const item=index(note);let score=item.name===q?100:item.name.includes(q)&&q?40:0;
      for(const term of terms){
        let match=0;
        for(const word of item.words){
          if(word===term){match=12;break;}
          if(term.length>=2&&word.startsWith(term)){match=Math.max(match,7);continue;}
          const limit=term.length>=7?2:term.length>=4?1:0;
          if(limit&&Math.abs(word.length-term.length)<=limit&&distance(word,term)<=limit)match=Math.max(match,2);
        }
        if(!match)return {note,score:-1};score+=match;
      }
      return {note,score};
    }).filter(r=>r.score>=0).sort((a,b)=>b.score-a.score).map(r=>r.note);
  }
  const directions={
    'fresh-citrus':'Fresh & fruity',pineapple:'Fresh & fruity','black-currant':'Fresh & fruity',lotus:'Fresh & airy',
    'white-floral':'Floral','rose-honey':'Floral',hedione:'Fresh & airy',
    marshmallow:'Sweet & cozy',gourmand:'Sweet & cozy',vanilla:'Sweet & cozy',
    'iso-e-super':'Woody & smooth','white-musk':'Soft & musky',galaxolide:'Soft & musky','ethylene-brassylate':'Soft & musky',
    leather:'Dark & textured',tobacco:'Dark & textured',oud:'Dark & textured'
  };
  function analyse(analysis,materials) {
    const rows=[...analysis.rows].sort((a,b)=>b.grams-a.grams||a.name.localeCompare(b.name));
    if(!rows.length)return {empty:true,title:'Give your notes an amount first.',summary:'Choose a note and enter its grams, then analyse your blend.',tips:[]};
    const leader=rows[0],groups={};
    for(const r of rows){const group=directions[r.id]||r.family;groups[group]=(groups[group]||0)+r.percentage;}
    const families=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
    const share=ids=>rows.filter(r=>ids.includes(r.id)).reduce((sum,r)=>sum+r.percentage,0);
    const sweet=share(['vanilla','gourmand','marshmallow','rose-honey']);
    const dark=share(['oud','leather','tobacco']);
    const airy=share(['lotus','hedione','fresh-citrus']);
    const tips=[];
    const offer=(id,title,reason)=>{
      const note=materials.find(n=>n.id===id);if(!note||id===leader.id)return;
      const existing=rows.find(r=>r.id===id);
      tips.push({title,text:`${reason} In your next adjustment, try a little less ${leader.name} and ${existing?'a little more':'a little'} ${note.name}. Keep the total at 10 g.`});
    };
    if(rows.length===1){
      tips.push({title:'One note can be your whole idea',text:`${leader.name} is the entire recipe. Keep it that way if you like its character; adding more notes is optional.`});
      const pair=materials.find(n=>leader.pairsWith?.includes(n.name)&&n.id!==leader.id);
      if(pair)offer(pair.id,'If you want a second dimension',`${pair.name} is a pairing listed for ${leader.name}.`);
    }else{
      if(dark>=35)offer('vanilla','For a softer, warmer edge',`Oud, leather and tobacco make up ${Math.round(dark)}% of your recipe by weight. Vanilla offers a creamy contrast to that darker direction.`);
      else if(sweet>=50)offer('fresh-citrus','For a brighter contrast',`Sweet-leaning notes make up ${Math.round(sweet)}% by weight. Fresh Citrus can introduce a zesty contrast.`);
      else if(analysis.roles.TOP>=60)offer('white-musk','For a softer foundation',`Top notes make up ${Math.round(analysis.roles.TOP)}% by weight. White Musk can bring a soft, clean contrast to the fruity opening.`);
      else if(airy<10)offer('hedione','For a little more air',`Your largest direction is ${families[0][0].toLowerCase()}. Hedione offers a lighter floral direction alongside it.`);
      else offer(directions[leader.id]==='Soft & musky'?'lotus':'white-musk','A variation to explore',directions[leader.id]==='Soft & musky'?'Lotus offers a watery floral contrast to the musks.':'White Musk offers a softer, clean-skin direction.');
      const pair=rows.slice(1).find(r=>leader.pairsWith?.includes(r.name)||r.pairsWith?.includes(leader.name));
      if(pair)tips.push({title:'A connection already in your blend',text:`${leader.name} and ${pair.name} are a listed pairing. Together they make up ${Math.round(leader.percentage+pair.percentage)}% by weight; try noticing their contrast when you smell your blend.`});
      else tips.push({title:'Make the next change easy to compare',text:`Keep ${leader.name} as your reference and change just one supporting note in Bottle 2. That makes the difference easier to notice.`});
    }
    if(rows.length>7)tips[1]={title:'Give your idea some space',text:`You have ${rows.length} notes. For a clearer comparison in Bottle 2, try leaving out one of the smallest additions, such as ${rows.at(-1).name}, and resizing the remaining recipe.`};
    return {empty:false,title:families[0][0],summary:`${leader.name} has the largest share at ${leader.percentage.toFixed(1)}% by weight${rows.length>1?`, followed by ${rows[1].name} at ${rows[1].percentage.toFixed(1)}%`:''}.`,families,roles:analysis.roles,tips:tips.slice(0,2)};
  }
  const api={search,analyse};if(typeof module!=='undefined')module.exports=api;else root.ScentTools=api;
})(typeof globalThis!=='undefined'?globalThis:this);
