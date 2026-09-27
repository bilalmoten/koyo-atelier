/* Client-side PDF export; no recipe or participant data leaves this browser. */
(function(root){
  'use strict';
  const textSafe = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/[^\x20-\x7e\n]/g,'');
  async function create(state,materials,options={}) {
    const lib=options.PDFLib||root.PDFLib;
    const Engine=options.FormulaEngine||root.FormulaEngine;
    const {PDFDocument,StandardFonts,rgb}=lib;
    const doc=await PDFDocument.create();
    doc.setTitle('My two perfumes | KOYO Atelier');doc.setAuthor('KOYO Atelier');doc.setCreator('KOYO Workshop');
    const sans=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold),serif=await doc.embedFont(StandardFonts.TimesRoman);
    const ink=rgb(.12,.18,.14),muted=rgb(.37,.43,.38),gold=rgb(.61,.48,.26),rule=rgb(.82,.82,.76),paper=rgb(.98,.97,.94);
    let logo;
    try{const bytes=options.logoBytes||await (await fetch('assets/koyo_logo_black.png')).arrayBuffer();logo=await doc.embedPng(bytes);}catch(_){/* Text wordmark fallback. */}
    const engine=new Engine(materials);
    function text(page,value,x,y,size=10,font=sans,color=ink){page.drawText(textSafe(value),{x,y,size,font,color});}
    function line(page,y){page.drawLine({start:{x:48,y},end:{x:547,y},thickness:.6,color:rule});}
    function wrapped(page,value,x,y,width,size=10,font=sans,color=ink){
      const words=textSafe(value).split(/\s+/);let out='',cursor=y;
      for(const word of words){const next=out?out+' '+word:word;if(font.widthOfTextAtSize(next,size)>width&&out){text(page,out,x,cursor,size,font,color);cursor-=size*1.4;out=word;}else out=next;}
      if(out){text(page,out,x,cursor,size,font,color);cursor-=size*1.4;}return cursor;
    }
    async function name(page,value,y,size,height) {
      if(typeof document!=='undefined'){
        // Rasterize user text only so names in Urdu or other scripts are preserved.
        const canvas=document.createElement('canvas');canvas.width=1497;canvas.height=height*3;
        const ctx=canvas.getContext('2d');ctx.scale(3,3);ctx.fillStyle='#1f2e24';ctx.textBaseline='top';
        let fontSize=size;ctx.font=`${fontSize}px Georgia`;
        while(ctx.measureText(value).width>499 && fontSize>12){fontSize--;ctx.font=`${fontSize}px Georgia`;}
        if(ctx.measureText(value).width>499){
          const chars=[...value];let first='';while(chars.length&&ctx.measureText(first+chars[0]).width<499)first+=chars.shift();ctx.fillText(first,0,0);ctx.fillText(chars.join(''),0,fontSize+3,499);
        }else ctx.fillText(value,0,0,499);
        const data=canvas.toDataURL('image/png').split(',')[1];const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
        const img=await doc.embedPng(bytes);page.drawImage(img,{x:48,y:y-height,width:499,height});
      }else wrapped(page,value,48,y-24,499,size,serif);
    }
    for(const id of [1,2]) {
      const bottle=state.bottles[id],analysis=engine.analyzeFormula(bottle.amounts);
      const page=doc.addPage([595.28,841.89]);page.drawRectangle({x:0,y:0,width:595.28,height:841.89,color:paper});
      if(logo){const ratio=logo.width/logo.height;page.drawImage(logo,{x:48,y:763,width:108,height:108/ratio});}else text(page,'KOYO',48,767,30,serif);
      text(page,'PERFUME ATELIER',350,782,10,bold,gold);text(page,'TWO BOTTLES. YOUR OWN SIGNATURE.',350,765,7,sans,muted);
      line(page,746);text(page,`BOTTLE ${id} / 2`,48,724,9,bold,gold);
      const status=!analysis.rows.length?'NOT CREATED':bottle.mode==='complete'?'WEIGHING CHECKLIST COMPLETED':bottle.mode==='mixing'?'WEIGHING IN PROGRESS':'DRAFT RECIPE';
      text(page,status,315,724,8,bold,muted);
      await name(page,bottle.name||`My perfume ${id}`,705,27,42);
      if(state.creator)await name(page,`Created by ${state.creator}`,653,13,25);else text(page,'Created at the KOYO perfume workshop',48,637,10,sans,muted);
      text(page,`${analysis.totalGrams.toFixed(2)} g`,48,602,21,bold);
      text(page,`Estimated ~${analysis.totalMl.toFixed(2)} mL | ~${analysis.totalDrops} drops`,220,606,10,sans,muted);
      line(page,585);
      text(page,'MATERIAL',48,568,8,bold,gold);text(page,'GRAMS',316,568,8,bold,gold);text(page,'SHARE',382,568,8,bold,gold);text(page,'EST. mL',442,568,8,bold,gold);text(page,'EST. DROPS',497,568,8,bold,gold);
      let y=545;
      const rowHeight=analysis.rows.length>13?17:21;
      for(const row of analysis.rows){text(page,row.name,48,y,9);text(page,row.grams.toFixed(2),316,y,9,bold);text(page,`${row.percentage.toFixed(1)}%`,382,y,9);text(page,row.ml.toFixed(2),442,y,9);text(page,String(row.drops),512,y,9);y-=rowHeight;}
      if(!analysis.rows.length){text(page,'No recipe has been created for this bottle yet.',48,y,11,sans,muted);y-=28;}
      line(page,y+5);text(page,'TOTAL',48,y-14,9,bold);text(page,`${analysis.totalGrams.toFixed(2)} g`,316,y-14,10,bold);
      y-=49;
      if(id===2&&bottle.baseline){
        const changes=engine.compare(bottle.baseline,bottle.amounts);
        text(page,'CHANGES FROM BOTTLE 1 STARTING RECIPE',48,y,8,bold,gold);y-=19;
        if(!changes.length){text(page,'The recipe is unchanged.',48,y,9,sans,muted);y-=15;}
        for(const c of changes.slice(0,4)){text(page,c.name,48,y,9);text(page,`${c.diff>0?'+':''}${c.diff.toFixed(2)} g`,315,y,9,bold);y-=16;}
        if(changes.length>4){text(page,`Plus ${changes.length-4} other changes. Full amounts are listed above.`,48,y,9,sans,muted);y-=15;}
      }else if(analysis.rows.length){text(page,'YOUR RECIPE',48,y,8,bold,gold);y=wrapped(page,bottle.mode==='complete'?'This is the fixed recipe followed during the weighing checklist. Amounts are planned additions, not independently measured records.':'This recipe is a plan. Finish and review it before weighing. No extra trial bottle is required.',48,y-20,490,9,sans,muted);}
      line(page,110);
      wrapped(page,'Conversions are estimates using 0.96 g/mL and 0.03 g/drop. Materials and droppers vary; the 9.60 g workshop target does not guarantee an exact 10 mL fill. Follow your host\'s bottle-fill and material-use guidance.',48,94,499,8,sans,muted);
      text(page,'KOYO ATELIER',48,34,8,bold,gold);text(page,`${id} / 2`,525,34,8,sans,muted);
    }
    return doc.save();
  }
  const api={create};if(typeof module!=='undefined')module.exports=api;else root.RecipePDF=api;
})(typeof globalThis!=='undefined'?globalThis:this);
