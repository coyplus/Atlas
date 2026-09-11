import {seed,goals,simulate,makePlan,money,date,difference,suggest,interpret} from './model.mjs';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mode='view',month=0,ideas=[],catalog=suggest(),selected='home',messages=[],proposal=null,lastFocus=null;
let base=simulate(),forecast=base,lo,hi,dialogKind=null,nextId=1;
const spots=[[139,129,132],[280,70,96],[57,45,76],[282,222,116],[65,239,80],[171,247,66],[185,27,56],[335,143,46]];
const visibleIdeas=()=>mode==='sandbox'?ideas:[];
const netRange=(a,b)=>money(Math.round(a/100)*100)+'–'+money(Math.round(b/100)*100);
const announcement=s=>$('#announcement').textContent=s;
function replacement(list,item){return [...list.filter(x=>x.id!==item.id&&!(x.kind==='pause'&&item.kind==='pause'&&x.goal===item.goal)&&!(x.kind==='priority'&&item.kind==='priority')),item];}
function impactFor(result,limit=2){
 const changed=result.plan.goals.filter(g=>g.target!==null&&!result.plan.removed.includes(g.id)&&base.dates[g.id]!==result.dates[g.id]);
 changed.sort((a,b)=>(a.id==='home'?-1:b.id==='home'?1:0));
 return changed.slice(0,limit).map(g=>`${g.short} ${difference(base,result,g.id)}`).join(' · ')||'Dates unchanged · a different money flow';
}
function fitBubbles(){
 const el=$('#field'),w=el.clientWidth,h=el.clientHeight,u=Math.min(w/360,h/286);
 for(const b of el.querySelectorAll('.bubble')){
  const pos=spots[+b.dataset.slot];b.style.left=((w-360*u)/2+pos[0]*u)+'px';b.style.top=((h-286*u)/2+pos[1]*u)+'px';b.style.width=Math.max(44,pos[2]*u)+'px';b.style.height=Math.max(44,pos[2]*u)+'px';
 }
}
function render(){
 forecast=simulate(seed,visibleIdeas());lo=simulate(seed,visibleIdeas(),-.02);hi=simulate(seed,visibleIdeas(),.07);
 const isSandbox=mode==='sandbox',snap=forecast.snapshots[month];
 $('.device').classList.toggle('sandbox',isSandbox);
 $('#view').setAttribute('aria-pressed',!isSandbox);$('#sandbox').setAttribute('aria-pressed',isSandbox);
 $('#mode-note').textContent=isSandbox?'Just exploring. Nothing changes in your accounts.':'Where today could take you';$('#reset').hidden=!isSandbox;
 $('#view-tools').hidden=isSandbox;$('#idea-tools').hidden=!isSandbox;
 $('#date').textContent=month===0?'Today':date(month);$('#age').textContent='You, age '+(29+Math.floor(month/12));
 $('#net-value').textContent=month===0?money(snap.net):netRange(lo.snapshots[month].net,hi.snapshots[month].net);
 $('#time').value=month;$('#time').setAttribute('aria-valuetext',date(month));
 const gs=forecast.plan.goals.filter(g=>!forecast.plan.removed.includes(g.id));
 const key=gs.map(g=>g.id).join(',');
 if($('#field').dataset.key!==key){
  $('#field').dataset.key=key;
  $('#field').innerHTML='<button class="add-bubble" id="add-bubble" aria-label="Add a goal to this experiment">＋</button>'+gs.map((g,i)=>`<button class="bubble ${g.id==='invest'?'invest':''}" data-goal="${g.id}" data-slot="${forecast.plan.goals.findIndex(x=>x.id===g.id)}" data-small="${spots[i][2]<90}" style="--colour:${g.colour};--size:${spots[i][2]/360*100};--x:${spots[i][0]/360*100};--y:${spots[i][1]/286*100}"><span class="symbol" aria-hidden="true">${esc(g.symbol)}</span><b>${esc(g.id==='invest'?'Long-term':g.id==='home'?'Future home':g.id==='buffer'?'Breathing room':g.short)}</b><small></small></button>`).join('');
  $('#milestones').innerHTML=gs.filter(g=>g.target!==null).map((g,i)=>`<i aria-hidden="true" id="ghost-${g.id}" class="tick ghost" hidden></i><i aria-hidden="true" id="tick-${g.id}" class="tick level-${i%3}" style="--colour:${g.colour}"></i>`).join('');
 }
 for(const g of gs){
  const b=$(`[data-goal="${g.id}"]`),v=snap.values[g.id],changed=isSandbox&&base.dates[g.id]!==forecast.dates[g.id];
  const progress=g.id==='loan'?1-v/g.start:g.id==='invest'?.28+month/120*.42:v/g.target;
  b.style.setProperty('--fill',Math.max(5,Math.min(100,progress*100)));b.style.setProperty('--uncertainty',month/15);b.classList.toggle('affected',changed);
  b.querySelector('small').textContent=changed?difference(base,forecast,g.id):g.id==='invest'?month===0?money(v):'Possible range':g.id==='loan'&&v===0?'Cleared':v>=g.target&&g.id!=='loan'?'Funded':money(v);
  b.setAttribute('aria-label',`${g.name}. ${g.id==='invest'?'Investment scenarios':date(forecast.dates[g.id])}. ${changed?difference(base,forecast,g.id):money(v)}. Explore`);
  if(g.target!==null){
   const tick=$('#tick-'+g.id),ghost=$('#ghost-'+g.id);
   tick.style.setProperty('--position',(forecast.dates[g.id]??120)/120*100+'%');tick.classList.toggle('changed',changed);tick.hidden=forecast.dates[g.id]==null;
   ghost.hidden=!changed||base.dates[g.id]==null;ghost.style.setProperty('--position',(base.dates[g.id]||0)/120*100+'%');
  }
 }
 fitBubbles();
 const next=gs.filter(g=>forecast.dates[g.id]>month).sort((a,b)=>forecast.dates[a.id]-forecast.dates[b.id])[0];
 $('#impact').textContent=isSandbox&&ideas.length?impactFor(forecast):next?`Next · ${next.short}${next.id==='loan'?' cleared':' funded'} in ${date(forecast.dates[next.id])}`:'A little more room for what comes next.';
 $('#speed-value').textContent=money(snap.budget-snap.flow.cash)+' a month';
 if(isSandbox)renderIdeas();
 $('#primary').textContent=isSandbox?'Review this future'+(ideas.length?' · '+ideas.length:''):'Explore a different future ✧';$('#primary').disabled=isSandbox&&!ideas.length;
 $('#footer-note').textContent=isSandbox?'A private experiment · your real setup stays the same':'Example finances · touch a bubble to explore';
}
function renderIdeas(){
 const key=catalog.map(x=>x.id).join(',');
 if($('#ideas').dataset.key!==key){$('#ideas').dataset.key=key;$('#ideas').innerHTML=catalog.map(i=>`<button class="idea" data-idea="${i.id}" aria-pressed="false"><span class="idea-top"><b>${esc(i.title)}</b><span class="toggle">＋</span></span><small class="why">${esc(i.why)}</small><small class="effect"></small></button>`).join('');}
 for(const i of catalog){const b=$(`[data-idea="${i.id}"]`),on=ideas.some(x=>x.id===i.id);b.setAttribute('aria-pressed',on);b.querySelector('.toggle').textContent=on?'✓':'＋';b.querySelector('.effect').textContent=impactFor(simulate(seed,on?ideas:replacement(ideas,i)));}
}
function tryIdea(i){ideas=ideas.some(x=>x.id===i.id)?ideas.filter(x=>x.id!==i.id):replacement(ideas,i);render();announcement(ideas.length?impactFor(forecast):'Back to your current path.');}
function show(kind,id){
 lastFocus=document.activeElement;dialogKind=kind;const content=$('#sheet-content');
 if(kind==='goal'){
  selected=id;const g=forecast.plan.goals.find(g=>g.id===id),s=forecast.snapshots[month],v=s.values[id],due=forecast.dates[id];
  content.innerHTML=`<p class="eyebrow">${g.id==='invest'?'POSSIBILITIES OVER TIME':'ONE PART OF YOUR FUTURE'}</p><h2>${esc(g.name)}</h2>${g.id==='invest'?`<p>${month===0?money(v)+' today':netRange(lo.snapshots[month].values.invest,hi.snapshots[month].values.invest)+' in '+date(month)}</p><svg class="range-graphic" viewBox="0 0 300 70" aria-label="Illustrative investment range widens over time"><path d="M0 55 Q150 30 300 3 L300 67 Q150 59 0 55" fill="#bda9d329"/><path d="M0 55 Q150 45 300 27" fill="none" stroke="#bda9d3" stroke-dasharray="4 4"/></svg><p>A range of scenarios, not a guaranteed result. Values can fall, including below what you put in.</p>`:`<div class="row"><span>${g.id==='loan'?'Remaining at this point':'At this point'}</span><b>${money(v)}</b></div><div class="progress-line" style="--colour:${g.colour}"><span style="width:${g.id==='loan'?(1-v/g.start)*100:Math.min(100,v/g.target*100)}%"></span></div><div class="row"><span>${g.id==='loan'?'Loan cleared':'Target funded'}</span><b>${date(due)}</b></div>${mode==='sandbox'&&base.dates[id]!==due?`<p>Current path: ${date(base.dates[id])}. Your experiment: ${difference(base,forecast,id)}.</p>`:''}`}<div class="row"><span>${g.id==='loan'?'Repayment':'Contribution'} at this point</span><b>${money(s.flow[id])}/mo</b></div>${g.protected?'<p>This commitment is protected in the example. Other goals can move around it.</p>':''}${g.id!=='invest'&&due!=null?'<button class="primary" id="land">Take me there →</button>':'<button class="text-button" data-open="about">How to read these scenarios</button>'}${mode==='sandbox'?`<button class="text-button" id="prioritise" ${g.protected?'hidden':''}>Give this priority</button><br><button class="text-button" id="remove" ${g.protected?'hidden':''}>Remove from this experiment</button>`:''}`;
 }
 if(kind==='flow'){
  const s=forecast.snapshots[month];content.innerHTML=`<p class="eyebrow">YOUR MONEY SPEED · ${date(month).toUpperCase()}</p><h2>Small commitments.<br>Forward motion.</h2><p>${money(s.budget-s.flow.cash)} a month is going towards your future at this point.</p>${forecast.plan.goals.filter(g=>s.flow[g.id]>0).map(g=>`<div class="row"><span>${esc(g.name)}<small>${g.id==='loan'?'Repayment':g.id==='invest'?'Investment':'Saving'}</small></span><b>${money(s.flow[g.id])}/mo</b></div>`).join('')}<div class="row"><span>Stays in everyday cash</span><b>${money(s.flow.cash)}/mo</b></div><p>As a commitment finishes, its money follows your existing priority order. Investment returns are separate from this contribution rate.</p><button class="text-button" id="priority-open">Explore a different priority →</button>`;
 }
 if(kind==='priority')content.innerHTML=`<p class="eyebrow">SANDBOX · WHAT MATTERS FIRST?</p><h2>Where should the next<br>available pound go?</h2><p>Your regular commitments stay in place. Choose who gets first call on money released when another goal finishes.</p><div class="choices">${forecast.plan.goals.filter(g=>!g.protected&&!forecast.plan.removed.includes(g.id)).map(g=>`<button data-priority="${g.id}" aria-pressed="${forecast.plan.priority[0]===g.id}">${esc(g.name)}</button>`).join('')}</div><p>The affected dates move together on your timeline.</p>`;
 if(kind==='add'){
  const count=makePlan(seed,ideas).goals.length;
  content.innerHTML=`<p class="eyebrow">A NEW POSSIBILITY</p><h2>What would you love<br>to make room for?</h2>${count>=8?'<p>You can explore up to eight goals in this study. Reset your experiments to try a different combination.</p>':`<form id="goal-form"><label>Give it a name<input name="name" required maxlength="30" placeholder="A year of adventures" autocomplete="off"></label><label>A target to explore<input name="target" type="number" min="100" max="100000" step="100" value="3000" required></label><label>Put aside each month<select name="rate"><option value="25">£25</option><option value="50" selected>£50</option><option value="75">£75</option></select></label><p>This comes from your existing flexible saving pool. The other dates will reflect the change. Nothing is set up in your accounts.</p><button class="primary" type="submit">Place it in my future →</button></form>`}`;
 }
 if(kind==='chat'){renderChat();}
 if(kind==='review'){
  const s=forecast.snapshots[0],b=base.snapshots[0];content.innerHTML=`<p class="eyebrow">YOUR EXPERIMENT · ${ideas.length} IDEAS TOGETHER</p><h2>Does this feel<br>closer to you?</h2>${forecast.plan.goals.filter(g=>g.target!==null&&base.dates[g.id]!==forecast.dates[g.id]).map(g=>`<div class="row"><span>${esc(g.name)}<small>${date(base.dates[g.id])} → ${date(forecast.dates[g.id])}</small></span><b>${difference(base,forecast,g.id)}</b></div>`).join('')}<div class="row"><span>Monthly funding</span><b>${money(b.budget)} → ${money(s.budget)}</b></div><p>${ideas.map(i=>esc(i.note||i.why)).join(' ')}</p><button class="primary" data-open="plan">Help me plan this ✧</button><button class="text-button" data-open="priority">Try a different priority</button>`;
 }
 if(kind==='plan'){
  const b=base.snapshots[0].flow,s=forecast.snapshots[0].flow;content.innerHTML=`<p class="eyebrow">EXAMPLE AI PLAN · REVIEW BEFORE ACTION</p><h2>Here’s what would<br>need to change.</h2>${forecast.plan.goals.filter(g=>b[g.id]!==s[g.id]).map(g=>`<div class="row"><span>${esc(g.name)}<small>${goals.some(x=>x.id===g.id)?'Update contribution rule':'Create a Pot and contribution rule'}</small></span><b>${money(b[g.id]||0)} → ${money(s[g.id])}/mo</b></div>`).join('')}${Object.entries(forecast.plan.pauses).map(([id,p])=>`<p>Resume ${esc(forecast.plan.goals.find(g=>g.id===id).name)} contributions after ${p.months} months. During the pause, money ${p.to==='cash'?'stays in everyday cash':'goes to the buffer'}.</p>`).join('')}<p>Released contributions prioritise ${esc(forecast.plan.goals.find(g=>g.id===forecast.plan.priority[0])?.name||'your next goal')}. The loan payment and investment contribution remain protected.</p><p>A live plan would check available funding, product terms and permissions before asking you to approve the exact changes. This study only explores the plan.</p><button class="primary" id="back-explore">Keep exploring</button>`;
 }
 if(kind==='about')content.innerHTML=`<p class="eyebrow">ABOUT THIS PROTOTYPE</p><h2>A picture to explore.<br>A future to shape.</h2><p>Six example priorities share one field. Bubbles stay in place so they are easy to recognise. Their size is for legibility, not a comparison of wealth.</p><p>For savings, the fill shows progress towards the target. For the loan, it shows the share repaid. The investment bubble has a soft, dashed edge: touch it for the scenario range.</p><p>The coloured marks on the time rail are projected goal dates. When you try an idea, faint original marks remain as the new ones move. A funded goal keeps its balance in this model; buying the item is not modelled.</p><p><b>Example data and simulated AI.</b> Idea suggestions are composed locally from this household’s balances and commitments. Conversation supports contribution pauses, extra monthly saving and priorities. No AI service or banking system is connected.</p><p>Investment examples use constant annual rates of −2%, 4% and 7%, excluding fees, tax and inflation. These are scenarios, not probabilities, guarantees or worst-case bounds. Actual losses could be larger. The displayed net-worth range includes those scenarios.</p><p>The £850 monthly pool is assumed affordable. Loan interest, future income and everyday spending are not modelled. Projections depend on continuing the assumed commitments.</p>`;
 if(!$('#sheet').open)$('#sheet').showModal();$('#sheet').scrollTop=0;
}
function proposalResult(){return proposal?simulate(seed,replacement(ideas,proposal)):null;}
function renderChat(){
 const result=proposalResult();
 $('#sheet-content').innerHTML=`<p class="eyebrow">✧ EXPLORE WITH AI</p><h2>A thought is<br>a good place to start.</h2><p class="chat-note">Prototype conversation · simulated responses</p><div id="messages">${messages.length?messages.map(m=>`<div class="message ${m.role}">${esc(m.text)}</div>`).join(''):'<div class="message ai">What would you like to try? We can explore it together before adding it to your future.</div><div class="choices"><button id="prompt-pause">Pause home for six months</button><button id="prompt-extra">Save another £100 a month</button></div>'}</div>${proposal?`<div class="proposal"><b>${esc(proposal.title)}</b><p>${esc(impactFor(result,3))}</p>${proposal.kind==='pause'?`<p>Where should the paused contributions go?</p><div class="choices"><button data-destination="cash" aria-pressed="${proposal.to==='cash'}">Keep in everyday cash</button><button data-destination="buffer" aria-pressed="${proposal.to==='buffer'}">Towards breathing room</button></div><p>${proposal.months} months, then contributions resume. ${proposal.to==='cash'?'The money stays available for today.':'The buffer receives the freed contribution.'}</p>`:`<p>${esc(proposal.note)}</p>`}<button class="primary" id="try-proposal">Try this idea →</button></div>`:''}<form class="chat-form" id="chat-form"><input name="message" id="chat-input" aria-label="Your What If idea" placeholder="What if I…" maxlength="500" autocomplete="off" required><button type="submit" aria-label="Send idea">↑</button></form>`;
}
function chat(text){
 messages.push({role:'user',text});const result=interpret(text,proposal);
 if(result.error)messages.push({role:'ai',text:result.error});
 else{proposal=result;messages.push({role:'ai',text:result.kind==='pause'?`Let’s explore a ${result.months}-month pause on Future home. Choose where the money goes, and we’ll see the effect on your other priorities too.`:result.kind==='extra'?`Let’s test ${money(result.amount)} more each month, assuming you could free it from everyday spending. Here’s the combined effect with your other ideas.`:'Let’s give your buffer first call on money as other commitments finish. The monthly total stays the same.'});}
 renderChat();$('#chat-input').focus();$('#chat-input').scrollIntoView({block:'nearest'});
}
function close(){const focus=lastFocus;$('#sheet').close();dialogKind=null;if(focus?.isConnected)focus.focus();}
function setMode(m){mode=m;render();$('#main').scrollTop=0;}
$('#time').addEventListener('input',e=>{month=+e.target.value;render();});
$('#time').addEventListener('change',()=>announcement(date(month)+'. '+$('#impact').textContent));
new ResizeObserver(fitBubbles).observe($('#field'));
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.goal){show('goal',b.dataset.goal);return;}
 if(b.dataset.idea){tryIdea(catalog.find(i=>i.id===b.dataset.idea));return;}
 if(b.dataset.open){show(b.dataset.open);return;}
 if(b.dataset.destination){proposal.to=b.dataset.destination;renderChat();return;}
 if(b.dataset.priority){const goal=forecast.plan.goals.find(g=>g.id===b.dataset.priority);ideas=replacement(ideas,{id:'priority-'+goal.id,kind:'priority',goal:goal.id,title:goal.name+' first',note:'Released money goes to '+goal.name+' first.'});render();close();return;}
 switch(b.id){
 case 'view':setMode('view');break;
 case 'sandbox':setMode('sandbox');break;
 case 'today':month=0;render();break;
 case 'reset':ideas=[];catalog=suggest();messages=[];proposal=null;month=0;selected='home';nextId=1;render();$('#ideas').scrollLeft=0;$('#main').scrollTop=0;announcement('All experiments discarded. Back to the future from your current setup.');break;
 case 'primary':mode==='view'?setMode('sandbox'):show('review');break;
 case 'about':case 'net':show('about');break;
 case 'speed':show('flow');break;
 case 'add-bubble':case 'add-goal':setMode('sandbox');show('add');break;
 case 'ask-ai':show('chat');break;
 case 'close-sheet':case 'back-explore':close();break;
 case 'priority-open':setMode('sandbox');show('priority');break;
 case 'land':month=forecast.dates[selected];render();close();break;
 case 'prioritise':show('priority');break;
 case 'remove':ideas=replacement(ideas,{id:'remove-'+selected,kind:'remove',goal:selected,title:'Leave '+selected+' out',note:'The goal leaves this draft. Its existing balance is retained.'});render();close();break;
 case 'prompt-pause':chat('What if I pause my Future Home contributions for six months?');break;
 case 'prompt-extra':chat('What if I save another £100 a month?');break;
 case 'try-proposal':{
  if(!catalog.some(x=>x.id===proposal.id))catalog.push(structuredClone(proposal));else catalog=catalog.map(x=>x.id===proposal.id?structuredClone(proposal):x);
  ideas=replacement(ideas,structuredClone(proposal));render();close();announcement(impactFor(forecast));break;
 }
 }
});
$('#sheet').addEventListener('cancel',()=>{dialogKind=null;});
$('#sheet-content').addEventListener('submit',e=>{
 e.preventDefault();const f=e.target,data=new FormData(f);
 if(f.id==='chat-form'){chat(String(data.get('message')).trim());return;}
 if(f.id==='goal-form'){
  const title=String(data.get('name')).trim();if(!title)return;
  const id='new-'+nextId++,g={id,name:title,short:title.split(/\s+/).slice(0,2).join(' '),symbol:'✧',colour:'#b0c8b7',start:0,target:+data.get('target'),rate:+data.get('rate')};
  const item={id:'add-'+id,kind:'add',goal:g,title:'Make room for '+title,why:'A new goal, within the existing saving pool.',note:`${money(g.rate)} a month comes from your other flexible saving commitments.`};catalog.push(item);ideas.push(item);render();close();announcement('New goal added to the experiment. '+impactFor(forecast));
 }
});
render();window.futureStudy={getState:()=>structuredClone({mode,month,ideas,proposal,forecast,base})};
