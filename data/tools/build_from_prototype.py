import json, math, os, re, datetime as dt
import pathlib
SRC=json.load(open(pathlib.Path(__file__).with_name('proto-data.json')))
OUT=str(pathlib.Path(__file__).resolve().parent.parent)+'/'
P=SRC['P']; MS=SRC['milestones']; WG=SRC['WG']; COMP2=SRC['COMP2']; CONVO=SRC['CONVO']
BASE_M, BASE_Y = 8, 2026
MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
def reach(m):
    if m is None: return None
    a=BASE_M+m; y=BASE_Y+a//12; return f"{y}-{a%12+1:02d}"
def potVal(pot,t):
    extra=(pot.get('later',{}).get('rate',0)*(t-pot['later']['from'])) if pot.get('later') and t>pot['later']['from'] else 0
    if pot.get('growth'): return pot['v']*(1+pot['growth'])**(t/12)+((pot.get('rate') or 0)*t+extra)*(1+pot['growth'])**(t/24)
    if pot.get('debt'): return max(0,pot['v']+pot['rate']*t-extra)
    raw=pot['v']+(pot.get('rate') or 0)*t+extra
    return min(pot['target'],raw) if pot.get('target') else raw
def money(x): return round(float(x),2)
def strip(s): return re.sub(r'<[^>]+>','',s or '')

# ---------- shared ----------
MOMENTS=[
 {"id":"m1","name":"Join","stage":"Just switched","customerId":"alex","asOf":"2026-08-20","tenure":"day 9","segment":"Everyday · new to HSBC","description":"The relationship begins. Evidence before any ask: bonus paid, Direct Debits moved, nothing automated yet."},
 {"id":"m2","name":"Stabilise","stage":"Breaking the cycle · first goals","customerId":"jordan","asOf":"2026-09-16","tenure":"month 7","segment":"Everyday","description":"Leaks closing, a fund building, a car loan on plan, a house-deposit pot just started with no rules."},
 {"id":"m3","name":"Grow","stage":"Ready to invest · nearly Premier","customerId":"sam","asOf":"2026-09-08","tenure":"month 8","segment":"Everyday · nearly Premier","description":"Three plans running quietly; idle cash identified; the first investment rehearsed."},
 {"id":"m4","name":"Graduate","stage":"Premier · growing together","customerId":"elena","asOf":"2026-09-08","tenure":"year 12","segment":"Premier · household","description":"A twelve-year relationship: a named human, a mandate, a household by consent, wealth compounding."}]
CAST={"hsbcPeople":[
  {"id":"priya","name":"Priya","role":"Relationship Manager","initials":"P","serves":["elena"],"note":"Named contact for Premier customers; holds the quarterly review."},
  {"id":"maya","name":"Maya","role":"HSBC Wealth adviser","initials":"M","serves":["elena"],"note":"Signs rebalances inside the mandate Elena agreed."},
  {"id":"human247","name":"A human, 24/7","role":"Support","initials":"H","serves":["alex","jordan","sam"],"note":"Reachable from any conversation via 'A person, please'; context travels with the customer."}],
 "ai":{"customerFacingName":"AI","internalComponentName":"Companion","ruling":"Data/04 §8.5 — no persona name, so it is never confused with a person."}}
PRODUCTS=[
 {"id":"current","name":"HSBC Current","kind":"current","displayName":"HSBC Current."},
 {"id":"premier-current","name":"HSBC Premier Current","kind":"current","displayName":"HSBC Premier Current.","premierOnly":True},
 {"id":"classic-card","name":"HSBC Classic","kind":"credit","cardScheme":"Visa","displayName":"HSBC Classic.","aprIllustrative":0.29},
 {"id":"premier-card","name":"HSBC Premier Card","kind":"credit","cardScheme":"Visa","displayName":"HSBC Premier Card.","premierOnly":True},
 {"id":"pot","name":"Pot","kind":"pot","note":"The single container behind saving, goal, locked, budget, credit, loan, shared and investment money (contract 07)."},
 {"id":"committed-plan","name":"Committed plan","kind":"pot-terms","note":"A pot with agreed terms earns a personal rate while the plan holds; exit is free (Sam's house deposit: 5.1%)."},
 {"id":"investment-portfolio","name":"Investment portfolio","kind":"investment","note":"Floor-protected allocation; guidance never regulated advice; growth illustrated at 5%/yr."},
 {"id":"points","name":"HSBC Points","kind":"rewards","rule":"Earned for openness and healthy habits — never for spending, balances, engagement volume or trading (FCA boundary, Data/04 §8.5)."},
 {"id":"cashback","name":"Card cashback","kind":"card-feature","rule":"A feature of the card, earned on card spending, shown as a fact and never promoted by the AI (Data/04 §8.5)."},
 {"id":"premier","name":"Premier","kind":"status","rule":"Status follows the relationship; points never buy it (Data/04 §6.9)."}]
RULETYPES=[{"id":"payday-fixed","label":"A fixed amount on payday"},{"id":"round-up","label":"Round-ups from card payments"},{"id":"percentage","label":"A share of pay"},{"id":"remaining-on-payday","label":"Whatever is left on payday, moved (never 'sweep')"},{"id":"challenge","label":"An amount when a healthy month holds"},{"id":"repayment","label":"A loan repayment on a schedule"},{"id":"cap","label":"A soft spending line — asked, never enforced — that frees money for a pot"},{"id":"later","label":"A rule that starts when another one ends (a redirect)"}]
WIFTYPES=[{"id":"create","label":"Start a new pot with a rule"},{"id":"attach","label":"Give an existing pot a rule"},{"id":"redirect","label":"Move a rule's money from one pot to another"},{"id":"cap","label":"A spending line that funds a pot"},{"id":"illustration","label":"Shows a delta (e.g. Premier rates) — nothing to commit"},{"id":"rehearsal","label":"Shows the shape of a decision — moves nothing"}]
DOCTRINE=["Evidence precedes every ask","Facts and possibility never blur: forward numbers carry 'projected' / 'A projection, not a promise'","Every side-effect is receipted and undoable","A rule that reaches its end stops; the AI asks where its money goes next (Data/04 §8.5)","No shame: no streaks that break, no scores to game, no lectures","HSBC Points never attach to spending; cashback is a card fact","Status cannot be bought with points","The customer's corrections outrank the model's observations, and are dated","Household by consent: everyone sees the shared pot, each person's own money stays their own","No internal codes or banned words in customer copy (Data/03 §G, Convergence/07)"]

# ---------- enrichment per persona ----------
ENRICH={
 'alex':{
  'customer':{"firstName":"Alex","age":24,"birthYear":2002,"occupation":"Junior designer","employer":"Acme Ltd","city":"Manchester","joined":"2026-08-11","tenureMonths":0,"previousBank":"Another UK bank (switched via the Current Account Switch Service)","segment":"Everyday · new","tier":"Everyday"},
  'income':[{"id":"inc-salary","source":"Salary","employer":"Acme Ltd","netMonthly":1900.00,"frequency":"monthly","payDay":28,"lastPaid":"2026-07-28","nextPay":"2026-08-28","note":"Payroll moved with the switch; a £1,000.00 instalment landed on 18 Aug during the payroll change (labelled 'salary' in the ledger)."}],
  'bills':[{"id":"bill-rent","name":"Rent (house share)","category":"housing","amount":320.00,"frequency":"monthly","day":25,"method":"standing order"},{"id":"bill-council","name":"Council tax share","category":"housing","amount":32.42,"frequency":"monthly","day":25,"method":"standing order"},{"id":"bill-energy","name":"Energy","category":"utilities","amount":48.40,"frequency":"monthly","day":26,"method":"Direct Debit","movedInSwitch":True},{"id":"bill-phone","name":"Phone","category":"telecoms","amount":25.00,"frequency":"monthly","day":24,"method":"Direct Debit","movedInSwitch":True},{"id":"bill-streaming","name":"Streaming","category":"subscriptions","amount":12.80,"frequency":"monthly","day":22,"method":"Direct Debit","movedInSwitch":True}],
  'tx':[("2026-08-11","ac-cur","Balance transferred by the switch service","transfer-in",0.22),("2026-08-18","ac-cur","Acme Ltd — salary","income",1000.00),("2026-08-18","ac-cur","Coffee & lunch","eating-out",-19.60),("2026-08-19","ac-cur","Switch bonus — HSBC promise kept","bonus",200.00)],
  'spending':{"month":"2026-08","byCategory":{"eating-out":19.60},"note":"Nine days of data: not enough for patterns — the app says so (credit score 'Learning', Safe to spend offered, not imposed)."},
  'credit':{"score":None,"status":"learning","readyIn":"~2 weeks","sourcesConnected":2,"sourcesTotal":3,"softChecksOnly":True,"debts":[]},
  'behaviour':{"financial":["Pays bills by Direct Debit — all three moved in the switch and landed","Spends small on cards day to day","No savings rule yet; £0 automated"],"app":{"sessionsSinceJoin":6,"lastOpened":"2026-08-20","featuresUsed":["Now","Recent activity","Add a number (browsed)"],"quizDone":False,"notifications":"payday and bills only","checkIns":0}},
  'autonomy':{"level":"watches nothing yet","limits":"None granted","paused":False},
  'goals':[{"id":"goal-settle","statement":"Settle in and get a clear picture of what is truly spendable","potId":None,"priority":1},{"id":"goal-cushion","statement":"Build a first cushion — small, on purpose","potId":None,"target":300,"priority":2}],
  'milestones':[{"date":"2026-08-11","event":"Switched to HSBC","detail":"Current Account Switch Service; three Direct Debits moved"},{"date":"2026-08-19","event":"£200 switch bonus paid","detail":"Same week — the first promise kept"}],
  'points':{"balance":0,"ledger":[]},
  'cashback':None,
  'contact':[]
 },
 'jordan':{
  'customer':{"firstName":"Jordan","age":29,"birthYear":1997,"occupation":"Team lead, logistics","employer":"Acme Ltd","city":"Leeds","joined":"2026-02-10","tenureMonths":7,"segment":"Everyday","tier":"Everyday"},
  'income':[{"id":"inc-salary","source":"Salary","employer":"Acme Ltd","netMonthly":2200.00,"frequency":"monthly","payDay":28,"lastPaid":"2026-08-28","nextPay":"2026-09-28"}],
  'bills':[{"id":"bill-rent","name":"Rent","category":"housing","amount":950.00,"frequency":"monthly","day":1,"method":"standing order"},{"id":"bill-energy","name":"Energy","category":"utilities","amount":168.28,"frequency":"monthly","day":5,"method":"Direct Debit"},{"id":"bill-water","name":"Water","category":"utilities","amount":46.00,"frequency":"monthly","day":5,"method":"Direct Debit"},{"id":"bill-carloan","name":"Car loan repayment","category":"debt","amount":150.00,"frequency":"monthly","day":1,"method":"Direct Debit","potId":"loan"},{"id":"bill-carins","name":"Car insurance","category":"insurance","amount":75.00,"frequency":"monthly","day":1,"method":"Direct Debit"},{"id":"bill-netflix","name":"Netflix","category":"subscriptions","amount":17.99,"frequency":"monthly","day":12,"method":"card"},{"id":"bill-spotify","name":"Spotify","category":"subscriptions","amount":11.99,"frequency":"monthly","day":12,"method":"card"},{"id":"bill-icloud","name":"iCloud","category":"subscriptions","amount":2.99,"frequency":"monthly","day":15,"method":"card"},{"id":"bill-gym","name":"Gym","category":"subscriptions","amount":25.93,"frequency":"monthly","day":15,"method":"Direct Debit","note":"Unused for 6 weeks once — asked, not lectured"},{"id":"bill-cardmin","name":"HSBC Classic — minimum payment","category":"debt","amount":60.00,"frequency":"monthly","day":1,"method":"Direct Debit","accountId":"ac-cc"}],
  'tx':[("2026-08-28","ac-cur","Acme Ltd — salary","income",2200.00),("2026-08-28","ac-cur","Payday move → Emergency fund","rule:r-ef-payday",-50.00),("2026-08-29","ac-cur","Tesco","groceries",-86.20),("2026-09-01","ac-cur","Rent","housing",-950.00),("2026-09-01","ac-cur","Car loan repayment","debt",-150.00),("2026-09-01","ac-cur","Car insurance","insurance",-75.00),("2026-09-01","ac-cur","HSBC Classic — minimum payment","debt",-60.00),("2026-09-02","ac-cur","Lidl","groceries",-64.10),("2026-09-03","ac-cur","Nando's","eating-out",-28.40),("2026-09-05","ac-cur","Energy","utilities",-168.28),("2026-09-05","ac-cur","Water","utilities",-46.00),("2026-09-06","ac-cur","Co-op","groceries",-31.40),("2026-09-06","ac-cur","Fuel","transport",-52.00),("2026-09-07","ac-cur","Deliveroo","eating-out",-24.90),("2026-09-09","ac-cur","Local grocer","groceries",-30.70),("2026-09-10","ac-cur","Pizza Express","eating-out",-41.50),("2026-09-12","ac-cur","Netflix","subscriptions",-17.99),("2026-09-12","ac-cur","Spotify","subscriptions",-11.99),("2026-09-13","ac-cur","Pub","eating-out",-36.20),("2026-09-15","ac-cur","iCloud","subscriptions",-2.99),("2026-09-15","ac-cur","Gym","subscriptions",-25.93),("2026-09-15","ac-cur","Round-ups → Emergency fund (month to date)","rule:r-ef-roundups",-22.00),("2026-09-01","ac-cc","Interest","interest",18.90),("2026-09-01","ac-cc","Minimum payment received","payment",-60.00),("2026-09-01","loan","Repayment","repayment",-150.00),("2026-08-28","ef","Payday move","rule:r-ef-payday",50.00),("2026-09-15","ef","Round-ups (month to date)","rule:r-ef-roundups",22.00),("2026-09-13","house","First deposit — by hand","manual",150.00)],
  'spending':{"month":"2026-09","monthToDate":True,"byCategory":{"groceries":212.40,"eating-out":131.00,"subscriptions":58.90,"transport":52.00},"comparisons":{"groceries":{"lastMonthToDate":250.40,"delta":-38.00},"eatingOut":{"sixMonthAverage":245.00}},"merchantClasses":{"groceries":["Tesco","Lidl","Co-op","Local grocer"]},"note":"Eating out averages £245/month over six months — the biggest discretionary line and the basis of the £200 cap idea."},
  'credit':{"score":None,"status":"not monitored yet","softChecksOnly":True,"debts":[{"ref":"pots/loan","name":"Car loan","balance":3600.00,"monthly":150.00,"endsMonth":24,"ends":"2028-09"},{"ref":"accounts/ac-cc","name":"HSBC Classic","balance":780.00,"limit":2000.00,"interestMonthly":18.90,"minimumPayment":60.00}]},
  'behaviour':{"financial":["Pays rent and the loan on the 1st without fail","Grocery spend checked weekly for 7 weeks","Round-ups running since Feb; payday move held 7 months","Eating out is the largest discretionary line","Card carries a balance; interest posts monthly"],"app":{"sessionsPerWeek":5,"lastOpened":"2026-09-16","featuresUsed":["Now","Groceries working","Future slider","Emergency fund detail","Conversation"],"quizDone":True,"quizDate":"2026-02","checkIns":15,"beliefsConfirmed":1,"notifications":"receipts, weekly summary"}},
  'autonomy':{"level":"acts within limits you set","limits":"Round-ups move automatically, up to £30 a month","paused":False},
  'goals':[{"id":"goal-ef","statement":"A £1,000 emergency fund","potId":"ef","target":1000,"priority":1},{"id":"goal-loan","statement":"Clear the car loan on plan","potId":"loan","priority":2},{"id":"goal-house","statement":"A place of your own, someday — start the first £3,000","potId":"house","target":3000,"priority":3},{"id":"goal-card","statement":"Stop paying interest on the card","ref":"accounts/ac-cc","priority":4}],
  'milestones':[{"date":"2026-02-10","event":"Joined"},{"date":"2026-02","event":"Money personality quiz — Steady builder","badge":"Quiz taken"},{"date":"2026-03","event":"Emergency fund opened — first pot"},{"date":"2026-06","event":"Budgeter — a habit kept","badge":"Budgeter"},{"date":"2026-09-13","event":"House deposit pot started by hand"}],
  'points':{"balance":140,"ledger":[{"date":"2026-02","reason":"Money personality quiz","points":25},{"date":"2026-02..2026-09","reason":"15 weekly check-ins","points":75},{"date":"2026-07","reason":"2 months of consistency","points":40}]},
  'cashback':None,
  'contact':[]
 },
 'sam':{
  'customer':{"firstName":"Sam","age":33,"birthYear":1993,"occupation":"Product manager","employer":"Acme Ltd","city":"Bristol","joined":"2026-01-12","tenureMonths":8,"segment":"Everyday · nearly Premier","tier":"Everyday","nearPremier":True},
  'income':[{"id":"inc-salary","source":"Salary","employer":"Acme Ltd","netMonthly":2600.00,"frequency":"monthly","payDay":28,"lastPaid":"2026-08-28","nextPay":"2026-09-28"}],
  'bills':[{"id":"bill-rent","name":"Rent","category":"housing","amount":900.00,"frequency":"monthly","day":1},{"id":"bill-council","name":"Council tax","category":"housing","amount":120.00,"frequency":"monthly","day":1},{"id":"bill-energy","name":"Energy","category":"utilities","amount":110.00,"frequency":"monthly","day":3},{"id":"bill-water","name":"Water","category":"utilities","amount":30.00,"frequency":"monthly","day":3},{"id":"bill-broadband","name":"Broadband","category":"telecoms","amount":40.00,"frequency":"monthly","day":6},{"id":"bill-phone","name":"Phone","category":"telecoms","amount":30.00,"frequency":"monthly","day":6},{"id":"bill-transport","name":"Travel pass","category":"transport","amount":130.00,"frequency":"monthly","day":1},{"id":"bill-insurance","name":"Contents & life insurance","category":"insurance","amount":40.00,"frequency":"monthly","day":8}],
  'tx':[("2026-08-28","ac-cur","Acme Ltd — salary","income",2600.00),("2026-08-28","ac-cur","Payday move → House deposit","rule:r-house-payday",-320.00),("2026-08-28","ac-cur","Payday move → Emergency fund","rule:r-ef-payday",-40.00),("2026-08-31","ac-cur","Grocery challenge held → Holiday","rule:r-hol-challenge",-60.00),("2026-09-01","ac-cur","Rent","housing",-900.00),("2026-09-01","ac-cur","Council tax","housing",-120.00),("2026-09-01","ac-cur","Travel pass","transport",-130.00),("2026-09-01","ac-cur","Tesco","groceries",-84.30),("2026-09-03","ac-cur","Energy","utilities",-110.00),("2026-09-03","ac-cur","Water","utilities",-30.00),("2026-09-04","ac-cur","Lidl","groceries",-58.90),("2026-09-06","ac-cur","Broadband","telecoms",-40.00),("2026-09-06","ac-cur","Phone","telecoms",-30.00),("2026-09-06","ac-cur","Co-op","groceries",-32.60),("2026-09-07","ac-cur","Card cashback","cashback",8.00),("2026-09-07","ac-cur","Local grocer","groceries",-22.30),("2026-08-28","house","Payday move","rule:r-house-payday",320.00),("2026-08-28","ef","Payday move","rule:r-ef-payday",40.00),("2026-08-31","hol","Grocery challenge — August held","rule:r-hol-challenge",60.00)],
  'spending':{"month":"2026-09","monthToDate":True,"byCategory":{"groceries":198.10},"comparisons":{"groceries":{"line":220.00,"monthsHeld":8}},"cardSpendingYtd":3200.00,"note":"Groceries have stayed under the £220 line for eight months running; the challenge sends £60 to the holiday pot each time."},
  'credit':{"score":None,"status":"not monitored yet","softChecksOnly":True,"debts":[]},
  'behaviour':{"financial":["Plans first, then lets the months run","Three rules running since January","Grocery line held 8 months","Cash accumulates in the current account beyond the safety net (£1,300 genuinely investable, idle)"],"app":{"sessionsPerWeek":3,"lastOpened":"2026-09-08","featuresUsed":["Now","Future","House deposit detail","Golden Ratio working","Conversation"],"quizDone":True,"quizDate":"2026-01","checkIns":52,"beliefsConfirmed":1,"notifications":"receipts and monthly summary"}},
  'autonomy':{"level":"acts within limits you set","limits":"Moves up to £420 a month between pots, exactly as agreed","paused":False},
  'goals':[{"id":"goal-house","statement":"£24,000 house deposit by 2031","potId":"house","target":24000,"by":"2031","priority":1},{"id":"goal-ef","statement":"A £5,000 emergency fund (90 days of essentials held already)","potId":"ef","target":5000,"priority":2},{"id":"goal-hol","statement":"A £2,400 holiday, funded by the grocery challenge","potId":"hol","target":2400,"priority":3},{"id":"goal-invest","statement":"Start investing what is genuinely safe to invest, floor-protected","potId":None,"priority":4}],
  'milestones':[{"date":"2026-01-12","event":"Joined"},{"date":"2026-01","event":"Quiz — Planner","badge":"Quiz taken"},{"date":"2026-02","event":"First month held","badge":"First month held"},{"date":"2026-03","event":"House pot committed — earned 5.1%"},{"date":"2026-07","event":"90 safety days held","badge":"90 safety days"},{"date":"2026-08","event":"Eight grocery months held — the challenge funds the holiday pot"}],
  'points':{"balance":480,"ledger":[{"date":"2026-01","reason":"Money personality quiz","points":25},{"date":"2026-01..2026-09","reason":"52 weekly check-ins","points":260},{"date":"2026-09","reason":"8 months of consistency","points":160},{"date":"2026-03..2026-09","reason":"Beliefs corrected & confirmed","points":35}]},
  'cashback':{"ytd":64.00,"rate":0.02,"basis":"cardSpendingYtd","cardSpendingYtd":3200.00,"monthly":8.00,"note":"Cashback on card spending — a fact of the account, never a nudge (Data/04 §8.5)."},
  'contact':[]
 },
 'elena':{
  'customer':{"firstName":"Elena","age":47,"birthYear":1979,"occupation":"Director, architecture practice","employer":"Self-employed (practice partner)","city":"London","joined":"2014-10","tenureMonths":143,"segment":"Premier · household","tier":"Premier","tierSince":"2020","rmId":"priya"},
  'income':[{"id":"inc-drawings","source":"Partner drawings","employer":"Practice","netMonthly":6400.00,"frequency":"monthly","payDay":1,"lastPaid":"2026-09-01","nextPay":"2026-10-01"},{"id":"inc-dividends","source":"Portfolio dividends","netMonthly":84.20,"frequency":"irregular","lastPaid":"2026-09-07","note":"Latest: index fund dividend £84.20 (Mon 7 Sep)"}],
  'bills':[{"id":"bill-mortgage","name":"Mortgage","category":"housing","amount":1850.00,"frequency":"monthly","day":1,"method":"Direct Debit","note":"Watched by Rates watch; +0.2% captured in March"},{"id":"bill-council","name":"Council tax","category":"housing","amount":240.00,"frequency":"monthly","day":1},{"id":"bill-energy","name":"Energy","category":"utilities","amount":210.00,"frequency":"monthly","day":4},{"id":"bill-water","name":"Water","category":"utilities","amount":48.00,"frequency":"monthly","day":4},{"id":"bill-school","name":"Leo — school club & activities","category":"family","amount":180.00,"frequency":"monthly","day":5},{"id":"bill-insurance","name":"Home, life & GP cover","category":"insurance","amount":160.00,"frequency":"monthly","day":8,"note":"24/7 GP is a Premier household benefit"},{"id":"bill-card","name":"Premier Card — paid in full","category":"card","amount":None,"frequency":"monthly","day":1,"method":"Direct Debit","accountId":"ac-cc","note":"Statement paid in full every month for nine years; last: £1,310.00 on 1 Aug"}],
  'tx':[("2026-09-01","ac-cur","Partner drawings","income",6400.00),("2026-09-01","ac-cur","Monthly move → Retirement","rule:r-ret-monthly",-500.00),("2026-09-01","ac-cur","Monthly move → House upgrade","rule:r-hup-monthly",-200.00),("2026-09-01","ac-cur","Monthly move → Family holiday","rule:r-fam-monthly",-150.00),("2026-09-01","ac-cur","Mortgage","housing",-1850.00),("2026-09-01","ac-cur","Council tax","housing",-240.00),("2026-09-01","ac-cur","Premier Card — statement paid in full","card",-1310.00),("2026-09-04","ac-cur","Energy","utilities",-210.00),("2026-09-04","ac-cur","Water","utilities",-48.00),("2026-09-05","ac-cur","Leo — school club","family",-180.00),("2026-09-07","ac-cur","Dividend — index fund","dividend",84.20),("2026-09-01","ret","Monthly move","rule:r-ret-monthly",500.00),("2026-09-01","hup","Monthly move","rule:r-hup-monthly",200.00),("2026-08-01","fam","Your monthly move","rule:r-fam-monthly",150.00),("2026-07-28","fam","Aisha added — her own move","member:aisha",100.00),("2026-09-01","fam","Your monthly move","rule:r-fam-monthly",150.00),("2026-09-07","inv","Dividend — index fund (reinvested)","dividend",84.20),("2026-09-07","inv","Rebalance — signed by Maya","rebalance",0.00)],
  'spending':{"month":"2026-09","monthToDate":True,"byCategory":{"housing":2090.00,"utilities":258.00,"family":180.00},"cardSpendingMonthlyAvg":1300.00,"note":"Household spending runs through the Premier card and is paid in full; the current account is the hub that deals £850 a month outward."},
  'credit':{"score":None,"status":"not needed","debts":[{"ref":"accounts/ac-cc","name":"HSBC Premier Card","balance":1240.00,"limit":15000.00,"paidInFull":True,"interestMonthly":0.00}],"mortgage":{"lender":"HSBC","outstanding":None,"note":"Amount not held in the prototype; only that Rates watch monitors it — flagged, not invented"}},
  'behaviour':{"financial":["Builds structures and lets time compound","Holds through weather — rehearsed a 20% dip in 2031 and held for real in 2033 (authored future history in the You timeline)","Pays the card in full for nine years","Delegates rebalancing inside a signed mandate"],"app":{"sessionsPerWeek":2,"lastOpened":"2026-09-08","featuresUsed":["Now","Future ten-year view","Family pot","You — household","Conversation with Priya"],"quizDone":True,"quizDate":"2014","checkIns":71,"beliefsConfirmed":2,"notifications":"receipts, dividends, review reminders"}},
  'autonomy':{"level":"acts and reports","limits":"Savings moves and rebalancing inside the mandate Elena and Maya signed","paused":False},
  'goals':[{"id":"goal-ret","statement":"£120,000 retirement pot; retiring at 62 rehearsed against 65","potId":"ret","target":120000,"priority":1},{"id":"goal-hup","statement":"£60,000 house upgrade — no deadline set, allowed","potId":"hup","target":60000,"priority":2},{"id":"goal-fam","statement":"£3,000 family holiday, shared with Aisha and Leo","potId":"fam","target":3000,"priority":3},{"id":"goal-leo","statement":"A pot for Leo's future — his at 18","potId":None,"target":7200,"priority":4}],
  'milestones':[{"date":"2014-10","event":"Joined"},{"date":"2015","event":"First pot"},{"date":"2018","event":"First rehearsal, then first investment","badge":"First rehearsal"},{"date":"2020","event":"Premier — the app went dark"},{"date":"2022","event":"Household by consent — Aisha, then Leo","badge":"Household by consent"},{"date":"2024","event":"A decade held","badge":"A decade held"},{"date":"2026-09-10","event":"Quarterly review with Priya (Thursday 2pm)","future":True}],
  'points':{"balance":3420,"ledger":[{"date":"2014..2026","reason":"Years of weekly check-ins","points":2340},{"date":"2014..2026","reason":"Consistency","points":780},{"date":"2014..2026","reason":"Openness & corrections","points":300}]},
  'cashback':None,
  'contact':[{"date":"2026-09-08","who":"priya","channel":"AI card (human takeover)","summary":"Reviewed the quarter; proposed Leo's future pot; offered Thursday 2pm"},{"date":"2026-09-07","who":"maya","channel":"receipt","summary":"Signed the rebalance back to the 36% floor"}]
 }
}
HOUSEHOLDS={
 'elena':{"id":"hh-elena","name":"Elena's household","consentModel":"Both ways, withdrawable in a tap; a child sees their own rows only; consent is the parent's until 16 and the child's from 18","members":[
   {"id":"elena","name":"Elena","relation":"self","age":47,"initials":"E"},
   {"id":"aisha","name":"Aisha","relation":"partner","initials":"A","sees":"The pots we share — never each other's other money","shares":["fam"]},
   {"id":"leo","name":"Leo","relation":"child","age":12,"initials":"L","sees":"His own rows in Family holiday","shares":["fam"],"consent":"Elena's until 16; Leo's from 18"}]},
}

def pot_kind(pot):
    if pot.get('debt'): return 'loan'
    if pot.get('growth'): return 'investment'
    if pot.get('members'): return 'shared'
    if pot.get('terms'): return 'committed-plan'
    if pot.get('target'): return 'goal'
    return 'saving'

def build_rules(k, pots):
    R=[]
    def add(rid, pot, typ, amount, source, since, extra=None):
        r={"id":rid,"potId":pot,"type":typ,"amount":amount,"source":source,"since":since,"active":True}
        if extra: r.update(extra)
        R.append(r)
    if k=='jordan':
        add('r-ef-payday','ef','payday-fixed',50,'ac-cur','2026-02',{"stopsAt":1000})
        add('r-ef-roundups','ef','round-up',22,'ac-cur','2026-02',{"amountIsAverage":True,"limitMonthly":30,"stopsAt":1000})
        add('r-loan-repay','loan','repayment',150,'ac-cur','2024-09',{"dayOfMonth":1,"overpayFree":True})
    if k=='sam':
        add('r-house-payday','house','payday-fixed',320,'ac-cur','2026-01',{"terms":"5.1% fixed while committed · 3-year plan · exit free"})
        add('r-ef-payday','ef','payday-fixed',40,'ac-cur','2026-01',{"stopsAt":5000})
        add('r-hol-challenge','hol','challenge',60,'ac-cur','2026-01',{"condition":"groceries under £220 in the month"})
    if k=='elena':
        add('r-ret-monthly','ret','payday-fixed',500,'ac-cur','2018',{"reviewed":"quarterly with Priya"})
        add('r-hup-monthly','hup','payday-fixed',200,'ac-cur','2023',{"pauseAnyTime":True})
        add('r-fam-monthly','fam','payday-fixed',150,'ac-cur','2022',{"note":"Aisha adds her own"})
        add('r-inv-drift','inv','standing-watch',0,None,'2018',{"note":"Drift-watch keeps the floor at 36%; Maya signs rebalances"})
    return R

def l1_for(k):
    p=P[k]; e=ENRICH[k]; mom=[m for m in MOMENTS if m['customerId']==k][0]
    accounts=[]
    for a in p.get('accounts',[]):
        acc={"id":a['id'],"productId": 'premier-current' if 'Premier Current' in a['t'] else ('premier-card' if 'Premier Card' in a['t'] else ('classic-card' if a['kind']=='credit' else 'current')),"name":a['t'].rstrip('.'),"kind":a['kind'],"masked":a['card'],"balance":money(a['v']) if a['kind']!='credit' else None,"owed":money(a['v']) if a['kind']=='credit' else None,"description":a.get('sub')}
        if a['kind']=='credit': acc.update({"limit":a['limit'],"cardScheme":a.get('cardLabel'),"paidInFull": 'Paid in full' in (a.get('sub') or ''), "interestMonthly": 18.90 if k=='jordan' else 0.0})
        accounts.append(acc)
    pots=[]; 
    for pot in p['pots']:
        if pot.get('root'): continue
        d={"id":pot['id'],"name":pot['t'],"kind":pot_kind(pot),"balance":money(pot['v']),"target":pot.get('target'),"monthlyRate":pot.get('rate') or 0,"isDebt":bool(pot.get('debt')),"growthAnnual":pot.get('growth'),"stopsAtTarget":bool(pot.get('stops')) or bool(pot.get('debt')),"description":pot.get('sub'),"terms":pot.get('terms'),"members":[{"memberId": {'You':k,'Aisha':'aisha','Leo':'leo'}.get(m['name'],m['name'].lower()),"role":m['role']} for m in pot.get('members',[])] or None,"rules":[],"createdOn": {"ef":"2026-03" if k=='jordan' else "2026-01","house":"2026-09-13" if k=='jordan' else "2026-03","loan":"2024-09","hol":"2026-01","un":"2026-06","inv":"2018","ret":"2018","hup":"2023","fam":"2022"}.get(pot['id'])}
        pots.append(d)
    rules=build_rules(k,pots)
    for r in rules:
        for d in pots:
            if d['id']==r['potId']: d['rules'].append(r['id'])
    txs=[]
    for i,(date,acct,cp,cat,amt) in enumerate(e['tx']):
        rule=cat.split(':')[1] if cat.startswith('rule:') else None
        member=cat.split(':')[1] if cat.startswith('member:') else None
        txs.append({"id":f"tx-{k}-{i+1:03d}","date":date,"ledger":acct,"counterparty":cp,"category":('rule' if rule else ('member-contribution' if member else cat)),"amount":money(amt),"direction":"in" if amt>0 else ("out" if amt<0 else "note"),"ruleId":rule,"memberId":member,"receipt":True})
    # opening balances derived so the ledger reconciles
    ledgers={}
    for t in txs: ledgers.setdefault(t['ledger'],0); ledgers[t['ledger']]+=t['amount']
    openings={}
    for a in accounts:
        if a['kind']=='credit': openings[a['id']]=money(a['owed']-ledgers.get(a['id'],0))
        else: openings[a['id']]=money(a['balance']-ledgers.get(a['id'],0))
    for d in pots: openings[d['id']]=money(d['balance']-ledgers.get(d['id'],0))
    held=sum(a['balance'] for a in accounts if a['kind']!='credit')+sum(d['balance'] for d in pots if not d['isDebt'])
    owed=sum(a['owed'] for a in accounts if a['kind']=='credit')+sum(d['balance'] for d in pots if d['isDebt'])
    inPots=sum(d['balance'] for d in pots if not d['isDebt'] and d['kind']!='investment')
    invested=sum(d['balance'] for d in pots if d['kind']=='investment')
    cash=sum(a['balance'] for a in accounts if a['kind']!='credit')
    me=p['me']; st=p.get('status',{})
    products=[{"productId":a['productId'],"since":e['customer']['joined']} for a in accounts]+[{"productId":"pot","count":len(pots)}]+[{"productId":"points"}]
    if any(d['kind']=='committed-plan' for d in pots): products.append({"productId":"committed-plan","potId":[d['id'] for d in pots if d['kind']=='committed-plan'][0]})
    if invested: products.append({"productId":"investment-portfolio","potId":"inv"})
    if e.get('cashback'): products.append({"productId":"cashback"})
    if p.get('premier'): products.append({"productId":"premier","since":e['customer'].get('tierSince')})
    speed=sum(r['amount'] for r in rules if r['type'] in ('payday-fixed','round-up','challenge','repayment') and r['active'])
    doc={
     "$schema":"../../schema/schema.json#/definitions/L1","layer":1,"moment":mom,"asOf":mom['asOf'],
     "customer":dict({"id":k},**e['customer']),
     "household":HOUSEHOLDS.get(k,{"id":f"hh-{k}","members":[{"id":k,"name":e['customer']['firstName'],"relation":"self","age":e['customer']['age'],"initials":e['customer']['firstName'][0]}],"consentModel":"Single-person household; invites available"}),
     "productsHeld":products,
     "accounts":accounts,"pots":pots,"rules":rules,
     "income":e['income'],"bills":e['bills'],
     "transactions":txs,"ledgerOpeningBalances":{"note":"Balance at the start of the transaction window, derived so that opening + Σ transactions = balance as of asOf","values":openings},
     "spending":e['spending'],
     "credit":e['credit'],
     "savingsAndInvestments":{"cash":money(cash),"inPots":money(inPots),"invested":money(invested),"floorProtectedPct": 0.36 if invested else None,"floorProtected": money(invested*0.36) if invested else None,"illustratedGrowthAnnual": 0.05 if invested else None},
     "netWorth":{"held":money(held),"owed":money(owed),"net":money(held-owed),"engineNetWorth":money(MS[k]['netWorth']),"asOf":mom['asOf']},
     "moneySpeed":{"monthly":speed,"prototypeFigure":p.get('speed'),"note":"Σ active rules that move money on a schedule (repayments included, as the prototype counts them)"},
     "goals":e['goals'],
     "rewards":{"points":dict(e['points'],**{"note":me.get('pointsNote')}),"cashback":e.get('cashback'),"activeBenefits":p.get('activeBenefits',[])},
     "relationship":{"joined":e['customer']['joined'],"tenureMonths":e['customer']['tenureMonths'],"tier":e['customer']['tier'],"tierSince":e['customer'].get('tierSince'),"nearPremier":e['customer'].get('nearPremier',False),"relationshipManagerId":e['customer'].get('rmId'),"experts":[c['id'] for c in CAST['hsbcPeople'] if k in c['serves']],"milestones":e['milestones'],"statusNote":st.get('note'),"contactHistory":e['contact']},
     "behaviour":e['behaviour'],
     "autonomy":e['autonomy'],
    }
    return doc

def l2_for(k, l1):
    p=P[k]; mom=l1['moment']; ms=MS[k]
    def ref(*xs): return list(xs)
    signals=[]; 
    def sig(id_, kind, desc, basis, detected=None): signals.append({"id":id_,"kind":kind,"description":desc,"basis":basis,"detectedOn":detected or mom['asOf']})
    if k=='alex':
        sig('sig-bonus','promise-kept','The £200 switch bonus landed within the week',['l1:transactions/tx-alex-004'])
        sig('sig-dd-moved','switch','All three Direct Debits moved and each landed once',['l1:bills/bill-energy','l1:bills/bill-phone','l1:bills/bill-streaming'])
        sig('sig-no-quiz','cold-start','No personality yet; no beliefs; nothing automated',['l1:behaviour/app/quizDone','l1:autonomy'])
        sig('sig-payday-8','cadence','Payday in 8 days; £438.62 of bills fall before it',['l1:income/inc-salary','l1:bills'])
        sig('sig-learning','data-depth','Nine days of data — not enough for patterns or a credit score',['l1:credit','l1:spending'])
    if k=='jordan':
        sig('sig-grocery-under','spending-change','Groceries £212.40 month to date vs £250.40 at the same point last month (−£38)',['l1:spending/comparisons/groceries','l1:transactions/tx-jordan-003','l1:transactions/tx-jordan-008','l1:transactions/tx-jordan-012','l1:transactions/tx-jordan-015'])
        sig('sig-roundups','rule-ran','Round-ups moved £22 to the Emergency fund this month',['l1:rules/r-ef-roundups','l1:transactions/tx-jordan-022'])
        sig('sig-eating-out','spending-pattern','Eating out averages £245 a month over six months — the largest discretionary line',['l1:spending/comparisons/eatingOut','l1:transactions/tx-jordan-009','l1:transactions/tx-jordan-014','l1:transactions/tx-jordan-016','l1:transactions/tx-jordan-019'])
        sig('sig-card-interest','cost','£18.90 of interest posted on the HSBC Classic card on 1 Sep',['l1:transactions/tx-jordan-023','l1:accounts/ac-cc'])
        sig('sig-loan-plan','schedule','Car loan £3,600 at £150/month clears in 24 months (Sep 2028); overpaying is free',['l1:pots/loan','l1:rules/r-loan-repay'])
        sig('sig-house-no-rule','pot-state','House deposit started by hand (£150) with no rule attached',['l1:pots/house','l1:transactions/tx-jordan-027'])
        sig('sig-ef-stops','rule-end','The Emergency fund rules stop at £1,000 — reached in 8 months (May 2027)',['l1:pots/ef','l1:rules/r-ef-payday'])
        sig('sig-payday-held','habit','The £50 payday move has run seven months without a miss',['l1:rules/r-ef-payday','l1:behaviour/financial'])
    if k=='sam':
        sig('sig-house-payday','rule-ran','£320 reached the house pot on payday, as agreed',['l1:transactions/tx-sam-002','l1:rules/r-house-payday'])
        sig('sig-idle-cash','opportunity','£1,300.44 of cash sits beyond the safety net and this month\'s commitments — the Golden Ratio',['l1:accounts/ac-cur','l1:bills','l1:rules'])
        sig('sig-safety-90','stability','Emergency fund covers ~90 days of essentials (£4,200 ÷ £1,400)',['l1:pots/ef','l1:bills'])
        sig('sig-ef-stops','rule-end','The £40 rule stops itself at £5,000 — 20 months away (May 2028)',['l1:pots/ef','l1:rules/r-ef-payday'])
        sig('sig-grocery-8','habit','Groceries under £220 for eight months running; the challenge funded the holiday pot',['l1:spending/comparisons/groceries','l1:rules/r-hol-challenge','l1:transactions/tx-sam-004'])
        sig('sig-payday-remainder','spending-pattern','The last six paydays left £85 on average unspent',['l1:income/inc-salary','l1:behaviour/financial'])
        sig('sig-near-premier','relationship','A committed plan, eight months kept — close to Premier',['l1:relationship','l1:pots/house'])
    if k=='elena':
        sig('sig-rebalance','human-signed','Maya signed the rebalance back to the 36% floor this morning',['l1:transactions/tx-elena-018','l1:relationship/contactHistory'])
        sig('sig-dividend','income','An £84.20 index-fund dividend landed',['l1:transactions/tx-elena-011'])
        sig('sig-aisha-100','household','Aisha added £100 to the family pot last week',['l1:transactions/tx-elena-015','l1:pots/fam'])
        sig('sig-hup-nodate','pot-state','House upgrade has no deadline — allowed; £220/month would give it one',['l1:pots/hup','l1:rules/r-hup-monthly'])
        sig('sig-review','relationship','Quarterly review with Priya held for Thursday 2pm',['l1:relationship/contactHistory','l1:relationship/milestones'])
        sig('sig-card-full','habit','The Premier card has been paid in full every month for nine years',['l1:accounts/ac-cc','l1:bills/bill-card'])
        sig('sig-leo-age','household','Leo is 12; six years to 18',['l1:household/members/leo'])
    # insights from pot insights
    insights=[]
    for pot in p['pots']:
        if pot.get('root'): continue
        if pot.get('insight'): insights.append({"id":f"ins-pot-{pot['id']}","scope":f"pot:{pot['id']}","text":strip(pot['insight']),"html":pot['insight'],"basis":[f"l1:pots/{pot['id']}"]+[f"l2:signals/{s['id']}" for s in signals if pot['id'] in ' '.join(s['basis'])]})
    for a in p.get('accounts',[]):
        if a.get('insight'): insights.append({"id":f"ins-acct-{a['id']}","scope":f"account:{a['id']}","text":strip(a['insight']),"html":a['insight'],"basis":[f"l1:accounts/{a['id']}"],"momentAware":strip(a.get('moment') or '') or None,"cta":a.get('momentCta')})
    for w in p['widgets'].values():
        if isinstance(w,dict) and w.get('work') and w['work'].get('note'):
            insights.append({"id":f"ins-work-{w['work']['t'].lower().replace(' ','-')}","scope":"working","text":w['work']['note'],"figure":w['work'].get('tot'),"rows":w['work'].get('rows'),"basis":["l1:transactions","l1:bills","l1:pots"]})
    # personality & beliefs
    p14=p.get('persona14') or {}
    personality={"name":p14.get('name'),"copy":p14.get('copy'),"invite":p14.get('invite'),"traits":p14.get('traits'),"provenance":p14.get('src'),"status":"confirmed" if p14.get('confirmed') else ("named" if p14.get('name') else "unnamed"),"basis":["l1:behaviour/financial","l1:behaviour/app/quizDone","l1:transactions"]}
    beliefs=[{"id":f"belief-{i+1}","claim":b['t'],"evidence":b['ev'],"status":"confirmed" if b.get('done') else "open","confidence":"strong" if b.get('done') else "fair","basis":["l1:behaviour/financial","l1:behaviour/app"]} for i,b in enumerate(p['me']['beliefs'])]
    # companion contexts
    comp=[]
    for key,v in COMP2[k].items():
        if isinstance(v,dict) and v.get('msg'): comp.append({"context":key,"message":strip(v['msg']),"html":v['msg'],"actions":v.get('actions',[]),"basis":[f"l2:signals/{s['id']}" for s in signals[:3]]})
        elif isinstance(v,dict):
            for kk,vv in v.items(): comp.append({"context":f"{key}.{kk}","message":strip(vv),"html":vv,"actions":[],"basis":[f"l2:signals/{s['id']}" for s in signals[:2]]})
    if p.get('rm'): comp.append({"context":"human-takeover","speaker":"priya","message":strip(p['rm']['msg']),"html":p['rm']['msg'],"actions":p['rm']['actions'],"basis":["l2:signals/sig-review","l2:signals/sig-leo-age"]})
    convo={"chips":CONVO[k]['chips']+['A person, please'],"answers":{q:strip(a) for q,a in CONVO[k]['answers'].items()},"answersHtml":CONVO[k]['answers']}
    # what ifs
    wifs=[]
    for w in p['whatifs']:
        typ='rehearsal' if w.get('rehearse') else ('illustration' if w.get('noStart') else ('attach' if w.get('attachTo') else ('redirect' if w.get('redirect') else ('cap' if w.get('to') and 'cap' in w['t'].lower() else ('attach' if w.get('to') else 'create')))))
        effect={}
        if w.get('attachTo'): effect={"potId":w['attachTo'],"monthlyRateDelta":w['attachRate']}
        elif w.get('redirect'): effect={"from":"ef","to":"loan","monthlyAmount":22} if w['redirect'] is True else w['redirect']
        elif w.get('to'): effect={"potId":w['to'],"monthlyRateDelta":w['rate']}
        elif w.get('pt'): effect={"newPot":{"name":w['pt'],"target":w.get('target'),"monthlyRate":w.get('rate'),"openingBalance":w.get('v0',0),"growthAnnual":0.05 if w.get('grow') else None,"icon":w.get('icon')}}
        wifs.append({"id":w['id'],"type":typ,"title":w['t'],"summary":w['s'],"explainer":w.get('prev'),"cta":w.get('cta'),"effect":effect,"graph":WG.get(f"{k}:{w['id']}"),"canCommit":typ in ('create','attach','redirect','cap'),"basis":[f"l2:signals/{s['id']}" for s in signals if any(x in (w['t']+w['s']).lower() for x in ['eat','round','deposit','invest','holiday','left','premier','upgrade','leo','retir','cushion','fund','emergency','challenge','shared'] if x in s['description'].lower())] or ["l1:pots","l1:spending"]})
    stories=[]
    for st in p.get('stories',[]):
        stories.append({"id":st['id'],"state":st['state'],"title":st['title'],"claim":st['claim'],"aiLine":strip(st['ai']),"aiLineHtml":st['ai'],"figure":st.get('figure'),"rows":st.get('rows'),"chart":bool(st.get('chart')),"verb":st['verb'],"residue":st['residue'],"action":st.get('act'),"cta":st.get('cta'),"basis":[f"l2:signals/{s['id']}" for s in signals if any(x in st['title'].lower() for x in s['description'].lower().split()[:4])] or ["l1:transactions"],"trigger":"Authored for the moment; in production a story is generated when its signal crosses a threshold"})
    # projections from the engine formulas
    proj=[]
    for pot in p['pots']:
        if pot.get('root'): continue
        m=ms.get(pot['id'])
        proj.append({"potId":pot['id'],"milestoneMonth":m,"reach":reach(m),"kind":"paidOff" if pot.get('debt') else ("reached" if pot.get('target') else None),"valueAt":{str(t):money(potVal(pot,t)) for t in (0,12,60,120)},"model":"potVal (contract 15): saving v+rate·t capped at target; debt max(0, v−|rate|·t); growth v(1+g)^(t/12)+rate·t(1+g)^(t/24)"})
    events=[{"month":ms[pid],"reach":reach(ms[pid]),"potId":pid,"kind":"paidOff" if P[k]['pots'][[x['id'] for x in P[k]['pots']].index(pid)].get('debt') else "reached","then":"the rule stops; the AI asks where its money goes next (new pot or existing goal)"} for pid in ms if pid!='netWorth' and ms[pid] and [x for x in P[k]['pots'] if x['id']==pid][0].get('debt') or (pid!='netWorth' and ms[pid] and [x for x in P[k]['pots'] if x['id']==pid][0].get('stops'))]
    nw=[]
    for t in (0,12,24,60,120):
        held=sum(potVal(x,t) for x in p['pots'] if not x.get('root') and not x.get('debt'))+sum(a['v'] for a in p.get('accounts',[]) if a['kind']!='credit')
        owed=sum(potVal(x,t) for x in p['pots'] if x.get('debt'))+sum(a['v'] for a in p.get('accounts',[]) if a['kind']=='credit')
        nw.append({"month":t,"net":money(held-owed),"label":"A projection, not a promise" if t else "Today"})
    # recommendations / next best actions from companion actions + suggestions
    nba=[]
    for c in comp:
        for a in c.get('actions',[]):
            nba.append({"id":f"nba-{c['context']}-{a[0]}","context":c['context'],"action":a[0],"label":a[1],"primary":bool(len(a)>2 and a[2]),"basis":c['basis']})
    recs=[{"id":f"rec-widget-{s['id']}","kind":"module-suggestion","moduleId":s['id'],"why":s['why'],"basis":["l1:spending","l1:bills","l1:income"]} for s in p.get('suggestions',[])]
    opps=[]; risks=[]
    if k=='jordan':
        opps=[{"id":"opp-cap","text":"A £200 eating-out line frees ~£45/month for the fund (done 3 months sooner)","basis":["l2:signals/sig-eating-out"]},{"id":"opp-roundups-loan","text":"Round-ups pointed at the car loan clear it ~3 months sooner","basis":["l2:signals/sig-roundups","l2:signals/sig-loan-plan"]}]
        risks=[{"id":"risk-card-interest","text":"The card costs ~£19/month in interest; clearing it beats any savings rate","severity":"medium","basis":["l2:signals/sig-card-interest"]},{"id":"risk-house-no-rule","text":"A pot with no rule tends to stall — the deposit habit matters before the amount","severity":"low","basis":["l2:signals/sig-house-no-rule"]}]
    if k=='sam':
        opps=[{"id":"opp-invest","text":"£1,300 is genuinely safe to invest; idle it loses ~£65/year to standing still; £200/month keeps it fed","basis":["l2:signals/sig-idle-cash"]},{"id":"opp-remainder","text":"Moving the payday remainder (~£85) brings the house from 2031 into 2030","basis":["l2:signals/sig-payday-remainder"]},{"id":"opp-premier","text":"Premier rates would bring the house ~3 months closer and points 1.5×","basis":["l2:signals/sig-near-premier"]}]
        risks=[{"id":"risk-ef-stop","text":"When the fund fills in May 2028 its £40 stops — decide where it goes before then","severity":"low","basis":["l2:signals/sig-ef-stops"]}]
    if k=='elena':
        opps=[{"id":"opp-leo","text":"£100/month reaches £7,200 by Leo's 18th","basis":["l2:signals/sig-leo-age"]},{"id":"opp-hup-date","text":"£220/month gives the upgrade a date: mid-2033, eight months sooner","basis":["l2:signals/sig-hup-nodate"]}]
        risks=[]
    if k=='alex':
        opps=[{"id":"opp-safe","text":"One honest number for what's truly spendable until payday: £742","basis":["l2:signals/sig-payday-8"]},{"id":"opp-cushion","text":"£25 each payday builds a £300 cushion within a year","basis":["l2:signals/sig-no-quiz"]}]
        risks=[{"id":"risk-thin-data","text":"Nine days of data: any pattern claim would be premature — the app says 'learning'","severity":"info","basis":["l2:signals/sig-learning"]}]
    hh=[]
    if k=='elena':
        hh=[{"id":"hh-1","text":"Three ways with money that fit together — the household is a superposition, not an average","basis":["l1:household","l2:personality"]},{"id":"hh-2","text":"Aisha's £100 brought the family pot to 62%; holding the pace makes the summer window","basis":["l2:signals/sig-aisha-100"]},{"id":"hh-3","text":"Leo sees his own rows only; consent is Elena's until 16","basis":["l1:household/consentModel"]}]
    household_members=None
    if p.get('household'):
        household_members=[{"memberId":m['id'],"personality":m.get('p14')} for m in p['household'] if m.get('p14')]
    return {
     "$schema":"../../schema/schema.json#/definitions/L2","layer":2,"moment":mom,"customerId":k,"asOf":mom['asOf'],
     "signals":signals,"insights":insights,
     "personality":dict(personality,**({"members":household_members} if household_members else {})),
     "beliefs":beliefs,
     "companion":{"contexts":comp,"conversation":convo},
     "stories":stories,"whatIfs":wifs,
     "projections":{"horizonMonths":120,"perPot":proj,"ruleEnds":events,"netWorth":nw,"honestyLine":"A projection, not a promise"},
     "nextBestActions":nba,"recommendations":recs,"opportunities":opps,"risks":risks,"householdInsights":hh,
     "rewardsExplanation":{"points":p['me'].get('pointsNote'),"cashback":"Shown as a fact of the card; never a reason to spend more" if k=='sam' else None},
     "traceability":{"convention":"basis[] holds refs of the form l1:<collection>/<id> (or a path) and l2:<collection>/<id>; every generated item names what it rests on"}
    }

# ---------- write ----------
def w(path,obj): 
    os.makedirs(os.path.dirname(OUT+path),exist_ok=True); json.dump(obj,open(OUT+path,'w'),indent=1,ensure_ascii=False)
w('shared/moments.json',{"moments":MOMENTS,"note":"Four moments = four life stages with a representative customer each (Data/04 §5.4). Each moment is a snapshot with history: change over time lives inside each customer's ledger, rules (since dates), milestones and projections. See README §Design decision."})
w('shared/cast.json',CAST); w('shared/products.json',{"products":PRODUCTS}); w('shared/rules.json',{"ruleTypes":RULETYPES,"whatIfTypes":WIFTYPES,"doctrine":DOCTRINE,"bannedInCustomerCopy":["pod","sweep","ladder","breach","first step","aspiring","L0-L4","M1-M4","module","lens","the verb","ASSISTANT","RECEIPT","Moment aware"]})
w('shared/modules.json',{"note":"Front-end vocabulary: the module catalogue (Convergence/08-component-contracts/02).","modules":[{"id":k_, "title":v['t'],"category":v.get('cat'),"description":v.get('desc'),"sizes":v.get('sizes')} for k_,v in SRC['CATALOG'].items()],"newPlanIntents":SRC['NP_INTENTS'],"newPlanRecommendations":SRC['NP_RECS'],"benefits":SRC['BENEFITS'],"tiers":SRC['TIERS'],"quiz":SRC['QUIZ']})
for mom in MOMENTS:
    k=mom['customerId']; l1=l1_for(k); l2=l2_for(k,l1)
    w(f"moments/{mom['id']}-{k}/l1.json",l1); w(f"moments/{mom['id']}-{k}/l2.json",l2)
print('written')
