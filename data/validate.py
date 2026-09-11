#!/usr/bin/env python3
"""Cross-checks the scenario database: numbers reconcile, references resolve, projections match the engine formulas.
Run:  python3 Scenarios/validate.py      (writes Scenarios/CROSS-CHECK.md and exits 1 on any failure)"""
import json, os, sys, glob, re
ROOT=os.path.dirname(os.path.abspath(__file__))
def load(p): return json.load(open(p))
results=[]; fails=0
def check(ok, label, detail=''):
    global fails
    results.append((bool(ok), label, detail)); 
    if not ok: fails+=1
def near(a,b,tol=0.011): return abs(float(a)-float(b))<=tol
def potVal(pot,t):
    r=pot.get('monthlyRate') or 0; later=pot.get('later')
    extra=(later['rate']*(t-later['from'])) if later and t>later['from'] else 0
    if pot.get('growthAnnual'): return pot['balance']*(1+pot['growthAnnual'])**(t/12)+(r*t+extra)*(1+pot['growthAnnual'])**(t/24)
    if pot.get('isDebt'): return max(0,pot['balance']-abs(r)*t-extra)
    raw=pot['balance']+r*t+extra
    return min(pot['target'],raw) if pot.get('target') else raw
def milestone(pot):
    if pot.get('isDebt'):
        if not pot.get('monthlyRate'): return None
        for t in range(1,121):
            if potVal(pot,t)<=0: return t
        return None
    if not pot.get('target'): return None
    if potVal(pot,0)>=pot['target']: return 0
    for t in range(1,121):
        if potVal(pot,t)>=pot['target']: return t
    return None
def resolve(l1,l2,ref):
    layer,_,path=ref.partition(':'); doc=l1 if layer=='l1' else l2
    parts=path.split('/'); node=doc
    for i,pt in enumerate(parts):
        if isinstance(node,dict) and pt in node: node=node[pt]; continue
        if isinstance(node,list):
            hit=[x for x in node if isinstance(x,dict) and x.get('id')==pt]
            if hit: node=hit[0]; continue
            if pt in ('members',) : continue
        if isinstance(node,dict):
            # allow member lookup by id inside household
            hit=[x for x in node.get('members',[]) if isinstance(x,dict) and x.get('id')==pt] if 'members' in node else []
            if hit: node=hit[0]; continue
        return False
    return True
shared={n:load(f'{ROOT}/shared/{n}.json') for n in ['moments','cast','products','rules','modules']}
prodIds={p['id'] for p in shared['products']['products']}
for mdir in sorted(glob.glob(f'{ROOT}/moments/*')):
    l1=load(mdir+'/l1.json'); l2=load(mdir+'/l2.json'); k=l1['customer']['id']; tag=os.path.basename(mdir)
    results.append((None,f'## {tag} — {l1["customer"]["firstName"]} · {l1["moment"]["name"]} · as of {l1["asOf"]}',''))
    # ledger reconciliation
    sums={}
    for t in l1['transactions']: sums[t['ledger']]=sums.get(t['ledger'],0)+t['amount']
    op=l1['ledgerOpeningBalances']['values']
    for a in l1['accounts']:
        bal=a['owed'] if a['kind']=='credit' else a['balance']
        check(near(op[a['id']]+sums.get(a['id'],0),bal), f'{a["name"]}: opening {op[a["id"]]} + transactions {round(sums.get(a["id"],0),2)} = {bal}')
        check(op[a['id']]>=0 or a['kind']=='credit', f'{a["name"]}: opening balance not negative ({op[a["id"]]})')
    for pot in l1['pots']:
        check(near(op[pot['id']]+sums.get(pot['id'],0),pot['balance']), f'Pot {pot["name"]}: opening {op[pot["id"]]} + transactions {round(sums.get(pot["id"],0),2)} = {pot["balance"]}')
        if pot.get('target') and not pot['isDebt']: check(pot['balance']<=pot['target'], f'Pot {pot["name"]}: balance ≤ target')
        for rid in pot['rules']: check(any(r['id']==rid for r in l1['rules']), f'Pot {pot["name"]}: rule {rid} exists')
        for m in (pot.get('members') or []): check(any(x['id']==m['memberId'] for x in l1['household']['members']), f'Pot {pot["name"]}: member {m["memberId"]} is in the household')
    for r in l1['rules']: check(any(p['id']==r['potId'] for p in l1['pots']), f'Rule {r["id"]} points at an existing pot')
    for t in l1['transactions']:
        if t.get('ruleId'): check(any(r['id']==t['ruleId'] for r in l1['rules']), f'Transaction {t["id"]} names an existing rule ({t["ruleId"]})')
    # net worth
    held=sum(a['balance'] for a in l1['accounts'] if a['kind']!='credit')+sum(p['balance'] for p in l1['pots'] if not p['isDebt'])
    owed=sum(a['owed'] for a in l1['accounts'] if a['kind']=='credit')+sum(p['balance'] for p in l1['pots'] if p['isDebt'])
    nw=l1['netWorth']; check(near(nw['held'],held) and near(nw['owed'],owed) and near(nw['net'],held-owed), f'Net worth: held {held:.2f} − owed {owed:.2f} = {held-owed:.2f} (stored {nw["net"]})')
    check(near(nw['net'],nw['engineNetWorth']), f'Net worth matches the prototype engine ({nw["engineNetWorth"]})')
    si=l1['savingsAndInvestments']; check(near(si['cash']+si['inPots']+si['invested'],held), f'Cash {si["cash"]} + pots {si["inPots"]} + invested {si["invested"]} = held {held:.2f}')
    # money speed
    ms=l1['moneySpeed']; check(ms['monthly']==ms['prototypeFigure'], f'Money speed Σ rules {ms["monthly"]} = prototype {ms["prototypeFigure"]}')
    # points
    pts=l1['rewards']['points']; check(sum(x['points'] for x in pts['ledger'])==pts['balance'], f'HSBC Points ledger sums to {pts["balance"]}')
    cb=l1['rewards'].get('cashback')
    if cb: check(near(cb['cardSpendingYtd']*cb['rate'],cb['ytd']), f'Cashback {cb["cardSpendingYtd"]} × {cb["rate"]} = {cb["ytd"]}')
    # persona-specific arithmetic that the prototype shows
    if k=='alex':
        bills=sum(b['amount'] for b in l1['bills']); check(near(bills,438.62), f'Bills before payday sum to 438.62 ({bills:.2f}) → Safe to spend 742.00')
        check(near(l1['accounts'][0]['balance']-bills,742.00), 'Safe to spend = balance − bills = 742.00')
    if k=='jordan':
        setaside=950+168.28+46+150+75+58.90+72; check(near(l1['accounts'][0]['balance']-setaside,820.00), f'Safe to spend = 2340.18 − set aside {setaside:.2f} = 820.00')
        subs=sum(b['amount'] for b in l1['bills'] if b['category']=='subscriptions'); check(near(subs,58.90), f'Subscriptions sum to 58.90 ({subs:.2f})')
        g=sum(-t['amount'] for t in l1['transactions'] if t['category']=='groceries' and t['date']>=l1['asOf'][:7]+'-01' and t['date']<=l1['asOf']); check(near(g,212.40), f'Grocery transactions sum to 212.40 ({g:.2f})')
        check(near(l1['accounts'][1]['owed'],780) and near(l1['accounts'][1]['interestMonthly'],18.90), 'Card £780 owed, ~£19/month interest')
    if k=='sam':
        ess=sum(b['amount'] for b in l1['bills']); check(near(ess,1400), f'Essentials sum to 1,400 ({ess:.2f})')
        check(near(l1['accounts'][0]['balance']-1400-420,1300.44), 'Golden Ratio: 3120.44 − 1400 − 420 = 1300.44')
        g=sum(-t['amount'] for t in l1['transactions'] if t['category']=='groceries'); check(near(g,198.10), f'Grocery transactions sum to 198.10 ({g:.2f})')
        check(near(sum(r['amount'] for r in l1['rules']),420), 'Commitments 320+40+60 = 420')
    if k=='elena':
        check(near(held,284600+0), f'Total wealth held = 284,600 ({held:.0f})')
        check(near(sum(p['balance'] for p in l1['pots'] if p['kind']!='investment'),78000), 'In pots = 78,000')
        check(near(si['floorProtected'],65664), 'Floor protected = 36% of 182,400 = 65,664')
        check(near(sum(r['amount'] for r in l1['rules']),850), 'Commitments 500+200+150 = 850')
    # products
    for p in l1['productsHeld']: check(p['productId'] in prodIds, f'Product {p["productId"]} is in the shared catalogue')
    # L2 traceability
    refs=0; bad=[]
    def walk(o):
        global refs
        if isinstance(o,dict):
            for kk,v in o.items():
                if kk=='basis' and isinstance(v,list):
                    for r in v:
                        refs+=1
                        if not resolve(l1,l2,r): bad.append(r)
                else: walk(v)
        elif isinstance(o,list):
            for x in o: walk(x)
    walk(l2); check(not bad, f'L2 basis references resolve ({refs} refs)', ', '.join(sorted(set(bad))[:8]))
    # projections vs formulas
    for pr in l2['projections']['perPot']:
        pot=[p for p in l1['pots'] if p['id']==pr['potId']][0]
        check(milestone(pot)==pr['milestoneMonth'], f'Projection {pot["name"]}: milestone month {pr["milestoneMonth"]} recomputed = {milestone(pot)}')
        check(near(potVal(pot,60),pr['valueAt']['60'],0.5), f'Projection {pot["name"]}: value at 60 months {pr["valueAt"]["60"]}')
    for w in l2['whatIfs']:
        eff=w['effect']
        if 'potId' in eff: check(any(p['id']==eff['potId'] for p in l1['pots']), f'What If {w["id"]} targets an existing pot ({eff["potId"]})')
        if 'to' in eff: check(any(p['id']==eff['to'] for p in l1['pots']) and any(p['id']==eff['from'] for p in l1['pots']), f'What If {w["id"]} redirect pots exist')
    for st in l2['stories']:
        if st.get('action'):
            kind,_,id_=st['action'].partition(':')
            if kind=='wifstart': check(any(w['id']==id_ for w in l2['whatIfs']), f'Story {st["id"]} starts an existing What If ({id_})')
            if kind=='pin': check(any(m['id']==id_ for m in shared['modules']['modules']), f'Story {st["id"]} pins an existing module ({id_})')
# report
lines=['# Cross-check report','',f'*Generated by `validate.py`. {sum(1 for r in results if r[0] is True)} checks passed, {fails} failed.*','']
for ok,label,detail in results:
    if ok is None: lines+=['',label,'']
    else: lines.append(f'- {"✅" if ok else "❌"} {label}'+(f' — {detail}' if detail else ''))
lines+=['','## Known inconsistencies in the source prototype (recorded, not silently fixed)','',
 '- **Elena\'s review date:** the Total wealth chip says "Quarterly review · 12 Sep" (a Saturday in 2026) while the AI and Priya say "Thursday 2pm" (10 Sep). The database uses 10 Sep; the prototype chip should change.',
 '- **Alex\'s 18 Aug £1,000 credit** is labelled "salary" in the prototype ledger while payday is the 28th; modelled as a payroll instalment during the switch and flagged as authored.',
 '- **Jordan\'s Safe to spend** treats a full cycle of bills as set aside on the 16th even though rent and the loan already left on the 1st — the prototype\'s arithmetic (2,340.18 − 1,520.18 = 820) is kept; a production model would set aside only what is still to come.',
 '- **Sam\'s cashback** is on "card spending" while Sam holds no credit card in the prototype; modelled as debit-card cashback on the current account (2% of £3,200 YTD = £64).',
 '- **Elena\'s mortgage amount** is not held anywhere in the prototype (only that Rates watch monitors it); left null rather than invented.',
 '- **Sam\'s and Jordan\'s credit scores** are "not monitored yet" in the data; the module catalogue offers monitoring by soft check. Alex\'s is "learning".',
 '- **Story triggers** are authored for the moment (the prototype has no generation engine); each story names its basis signals so a generator could be written.']
open(f'{ROOT}/CROSS-CHECK.md','w').write('\n'.join(lines)+'\n')
print('\n'.join(l for l in lines if l.startswith('- ❌') or l.startswith('## ')))
print(f'\n{sum(1 for r in results if r[0] is True)} passed, {fails} failed → CROSS-CHECK.md')
sys.exit(1 if fails else 0)
