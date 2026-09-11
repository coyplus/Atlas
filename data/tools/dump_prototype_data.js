const fs=require('fs'), vm=require('vm');
const dir='/Users/coy/BDF projects/HSBC Atlas/Prototype/src/';
const parts=['40-data.js','41-data-augmentation-v1-1.js','42-data-companion-v2.js','43-data-me.js','44-data-v1-4-one-coherent-system.js','45-data-v1-5-jordan-pots.js','46-data-v1-6-the-collection.js','47-data-v1-8-future-core.js','48-data-v1-8-stories-catalogue.js','49-data-v1-8-you.js'];
let code=parts.map(p=>fs.readFileSync(dir+p,'utf8')).join('\n');
// helpers needed by data parts at load time: none except cur/potVal used inside functions (not executed). Provide minimal stubs.
const helpers=fs.readFileSync(dir+'50-logic-state-helpers.js','utf8');
const wgSrc=fs.readFileSync(dir+'57-logic-sheets-toast.js','utf8'); const wg=wgSrc.slice(wgSrc.indexOf('const WG = {'), wgSrc.indexOf('function mAt('));
const futSrc=fs.readFileSync(dir+'54-logic-future.js','utf8');
const ctx={console, document:{getElementById:()=>null}, window:{}};
vm.createContext(ctx);
vm.runInContext(helpers+'\n'+code+'\n'+wg+'\n'+futSrc.slice(0, futSrc.indexOf('/* ---- view 1')), ctx);
const {P,CATALOG,COMP2,CONVO,NP_INTENTS,NP_RECS,BENEFITS,TIERS,QUIZ,SAMPLES,WG,ICONS}=vm.runInContext('({P,CATALOG,COMP2,CONVO,NP_INTENTS,NP_RECS,BENEFITS,TIERS,QUIZ,SAMPLES,WG,ICONS})', ctx);
const out={P,CATALOG,CONVO,NP_INTENTS,NP_RECS,BENEFITS,TIERS,QUIZ,SAMPLES,WG,ICONS,COMP2:{}};
for(const k of Object.keys(COMP2)){ out.COMP2[k]={}; for(const [kk,v] of Object.entries(COMP2[k])) out.COMP2[k][kk]= typeof v==='function' ? v(P[k]) : v; }
// milestones per pot (engine)
out.milestones={};
for(const k of Object.keys(P)){ vm.runInContext(`S.p='${k}'; S.t=0;`, ctx); out.milestones[k]={}; for(const pot of P[k].pots){ out.milestones[k][pot.id]=vm.runInContext(`milestone(${JSON.stringify(pot)})`, ctx); } out.milestones[k].netWorth=vm.runInContext(`(function(){S.p='${k}';return netWorth(0)})()`, ctx); }
fs.writeFileSync(__dirname+'/proto-data.json', JSON.stringify(out,null,1));
console.log('dumped', Object.keys(P), JSON.stringify(out.milestones));
