from pathlib import Path
import json,re,base64,shutil,hashlib
app=Path(__file__).resolve().parents[1];public=app/'public';public.mkdir(exist_ok=True)
assets=public/'assets'
if assets.exists(): shutil.rmtree(assets)
# Original high-resolution photography stays in source; ship the reviewed web renditions.
def skip_original_plates(directory, names):
 # Limit exclusions to the original root plates; nested, optimised feature assets may share a name.
 return set(names) & {'conversation.jpg','everyday.jpg','landscape.jpg'} if Path(directory) == app/'assets' else set()
shutil.copytree(app/'assets',assets,ignore=skip_original_plates)
data={'moments':{},'shared':{}}
for folder in sorted((app/'data/moments').iterdir()):
 l1=json.loads((folder/'l1.json').read_text());l2=json.loads((folder/'l2.json').read_text());assert l1['customer']['id'] not in data['moments'];data['moments'][l1['customer']['id']]={'l1':l1,'l2':l2}
for file in (app/'data/shared').glob('*.json'):data['shared'][file.stem]=json.loads(file.read_text())
assert set(data['moments'])=={'alex','jordan','sam','elena'}
(public/'scenarios.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
logos={r['bank']:'/assets/bank-logos/'+r['file'] for r in json.loads((assets/'bank-logos/sources.json').read_text())}
meta={'portraits':{p.stem:'/assets/portraits/'+p.name for p in (assets/'portraits').glob('*.jpg')},'bankLogos':logos,'audio':{'src':'/assets/audio/sam-recap.mp3','transcript':(assets/'audio/sam-recap.txt').read_text().strip(),'duration':66.451701}}
(public/'media.json').write_text(json.dumps(meta))
(app/'src/design-system/media.css').write_text(':root{'+''.join('--photo-'+k+':url(/assets/'+v+');' for k,v in {'conversation':'conversation-web.jpg','landscape':'landscape-web.jpg','everyday':'everyday-web.jpg'}.items())+'}')
version=hashlib.sha256((public/'scenarios.json').read_bytes()).hexdigest()[:12];(public/'scenario-version.json').write_text(json.dumps({'schema':1,'version':version}))
for old in public.glob('*.md'): old.unlink()
for file in (app/'docs').glob('*.md'): shutil.copy2(file,public/file.name)
print('Prepared 4 scenarios, independently cached media and fonts')
