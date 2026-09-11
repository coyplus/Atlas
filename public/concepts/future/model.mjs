// Local interaction model. No account access or AI service calls.
export const goals = [
 {id:'home',name:'Future home',short:'Home',symbol:'⌂',colour:'#94b6c9',start:8000,target:20000,rate:150},
 {id:'buffer',name:'Breathing room',short:'Buffer',symbol:'◌',colour:'#9bbdaf',start:1800,target:6000,rate:100},
 {id:'loan',name:'Car loan',short:'Loan',symbol:'↘',colour:'#d0a38e',start:4800,target:0,rate:400,protected:true},
 {id:'invest',name:'Long-term freedom',short:'Investments',symbol:'↗',colour:'#bcafd1',start:10000,target:null,rate:100,protected:true},
 {id:'summer',name:'A long summer',short:'Summer',symbol:'☀',colour:'#b6caaa',start:500,target:3000,rate:60},
 {id:'learn',name:'Something new',short:'Learning',symbol:'✧',colour:'#b8c3bf',start:200,target:1800,rate:40}
];
export const seed={budget:850,priority:['home','buffer','summer','learn'],goals};
export const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
export const date=m=>m==null?'No date yet':new Date(Date.UTC(2026,8+m,1)).toLocaleDateString('en-GB',{month:'short',year:'numeric',timeZone:'UTC'});
export function makePlan(source=seed,ideas=[]){
 const p=structuredClone(source);p.pauses={};p.extra=0;p.removed=[];
 for(const i of ideas){
  if(i.kind==='extra')p.extra+=i.amount;
  if(i.kind==='pause')p.pauses[i.goal]={months:i.months,to:i.to||'cash'};
  if(i.kind==='priority')p.priority=[i.goal,...p.priority.filter(id=>id!==i.goal)];
  if(i.kind==='add'&&!p.goals.some(g=>g.id===i.goal.id)){
   const flexible=p.goals.filter(g=>!g.protected),total=flexible.reduce((a,g)=>a+g.rate,0);
   flexible.forEach(g=>g.rate*=Math.max(0,(total-i.goal.rate)/total));
   p.goals.push(structuredClone(i.goal));p.priority.push(i.goal.id);
  }
  if(i.kind==='remove'&&!p.goals.find(g=>g.id===i.goal)?.protected)p.removed.push(i.goal);
 }
 return p;
}
export function simulate(source=seed,ideas=[],growth=.04){
 const p=makePlan(source,ideas),values=Object.fromEntries(p.goals.map(g=>[g.id,g.start]));
 const snapshots=[],dates={};let cash=2500;
 for(let m=0;m<=120;m++){
  const flow=Object.fromEntries(p.goals.map(g=>[g.id,0])),budget=p.budget+p.extra;
  flow.loan=Math.min(400,values.loan);flow.invest=100;
  let pool=budget-flow.loan-flow.invest,held=0;
  const eligible=g=>!g.protected&&!p.removed.includes(g.id)&&values[g.id]<g.target-.001;
  const paused=g=>p.pauses[g.id]&&m<p.pauses[g.id].months;
  // A pause has an explicit destination; cash kept aside cannot fund another goal.
  for(const g of p.goals.filter(eligible))if(paused(g)&&p.pauses[g.id].to==='cash'){
   const a=Math.min(pool,g.rate);held+=a;pool-=a;
  }
  for(const g of p.goals.filter(eligible))if(!paused(g)){
   flow[g.id]=Math.min(pool,g.rate,g.target-values[g.id]);pool-=flow[g.id];
  }
  // Released contributions follow the user's existing or experimental order.
  const routes=[...p.goals.filter(g=>paused(g)&&p.pauses[g.id].to!=='cash').map(g=>p.pauses[g.id].to),...p.priority];
  for(const id of [...new Set(routes)]){
   const g=p.goals.find(g=>g.id===id);if(!g||!eligible(g)||paused(g))continue;
   const a=Math.max(0,Math.min(pool,g.target-values[id]-flow[id]));flow[id]+=a;pool-=a;
  }
  flow.cash=held+pool;
  const net=cash+Object.entries(values).reduce((a,[id,v])=>a+(id==='loan'?-v:v),0);
  snapshots.push({m,values:{...values},flow,cash,net,budget});
  if(m===120)break;
  values.loan=Math.max(0,values.loan-flow.loan);
  values.invest=values.invest*Math.pow(1+growth,1/12)+flow.invest;
  for(const g of p.goals.filter(g=>!g.protected))values[g.id]+=flow[g.id];
  cash+=flow.cash;
  for(const g of p.goals)if(g.target!==null&&dates[g.id]===undefined&&!p.removed.includes(g.id)&&(g.id==='loan'?values.loan===0:values[g.id]>=g.target-.001))dates[g.id]=m+1;
 }
 return {plan:p,snapshots,dates};
}
export function difference(before,after,id){
 const a=before.dates[id],b=after.dates[id];
 if(b==null)return 'No date yet';if(a==null)return 'New goal';
 const d=b-a;return d===0?'Same date':`${Math.abs(d)}mo ${d<0?'earlier':'later'}`;
}
// These locally composed ideas demonstrate the AI interaction, not live generation.
export function suggest(source=seed){
 const s=simulate(source),home=s.plan.goals.find(g=>g.id==='home');
 return [
  {id:'home-extra',kind:'extra',amount:50,title:'A little closer to home',why:`You’re putting ${money(home.rate)} a month towards home. What could another £50 change?`,note:'Assumes £50 a month freed from everyday spending. Check the budget before committing.'},
  {id:'buffer-first',kind:'priority',goal:'buffer',title:'Breathing room comes first',why:`Your buffer is projected for ${date(s.dates.buffer)}. Try sending released money there first.`,note:'Keeps the monthly total the same. Changes the destination of money released by completed goals.'},
  {id:'home-pause',kind:'pause',goal:'home',months:6,to:'cash',title:'A little room for today',why:'Try six months without home contributions. See what stays in cash and what shifts.',note:'Pauses the home contribution for six months and leaves that money in everyday cash. It resumes automatically in the model.'}
 ];
}
export function interpret(text,previous=null){
 const t=text.toLowerCase(),n=t.match(/\b(\d{1,2})\s*(?:months?|mos?)\b/)||t.match(/\b(\d{1,2})\s*(?:instead|rather)\b/);
 const words=t.match(/\b(one|two|three|four|five|six|nine|twelve)\s+months?\b/);
 const nums={one:1,two:2,three:3,four:4,five:5,six:6,nine:9,twelve:12};
 if(/pause|stop|break/.test(t)||previous?.kind==='pause'&&(n||words||/instead|buffer|cash/.test(t))){
  if(/loan|repayment|invest/.test(t))return {error:'The loan repayment and investment contribution are protected in this example. We can explore your home contributions instead.'};
  const months=n?+n[1]:words?nums[words[1]]:previous?.months||6;
  if(months<1||months>24)return {error:'Try a pause between 1 and 24 months in this prototype.'};
  return {id:'conversation-pause',kind:'pause',goal:'home',months,to:/buffer|breathing/.test(t)?'buffer':previous?.to||'cash',title:`Pause home for ${months} months`,why:'A little flexibility now, with the future in view.',note:'Home contributions resume after the pause.'};
 }
 if(/prioriti|first/.test(t)&&/buffer|breathing/.test(t))return {id:'conversation-priority',kind:'priority',goal:'buffer',title:'Put breathing room first',why:'Give your buffer first call on released money.',note:'Changes future routing, keeping monthly commitments the same.'};
 const amount=t.match(/£\s*(\d+)/)||t.match(/(?:extra|another|add|more)\s+(\d+)/);
 if(amount){const a=+amount[1];if(a<10||a>500)return {error:'Try an extra monthly amount between £10 and £500 in this prototype.'};return {id:'conversation-extra',kind:'extra',amount:a,title:`Try another ${money(a)} a month`,why:'See what a little more momentum could change.',note:'Assumes this amount can be freed from everyday spending. Funding needs to be checked.'};}
 return {error:'This prototype can explore a home-contribution pause, extra monthly saving, or putting the buffer first. Which would you like to try?'};
}
