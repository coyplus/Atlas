from pathlib import Path
import json,re,hashlib,shutil
root=Path(__file__).resolve().parents[2]; dest=root/'atlas-app'; old=root/'prototype/app'
mapping={'core':'domain/money','arrangements':'domain/agreements','container-model':'domain/containers','models':'domain/numbers','icons':'design-system/icons','primitives':'design-system/templates','now-system':'features/now/actions','accounts-system':'features/accounts/accounts','screens':'features/screens','dialogs':'features/dialogs','container-views':'features/pots/views','workbench':'features/workbench','support':'features/support/model','support-system':'features/support/specimens','support-controller':'features/support/controller','app':'app/runtime'}
import os
for name,new in mapping.items():
 p=dest/'src'/f'{new}.mjs';p.parent.mkdir(parents=True,exist_ok=True);s=(old/f'{name}.mjs').read_text()
 for dep,target in mapping.items():
  rel=os.path.relpath(dest/'src'/f'{target}.mjs',p.parent)
  if not rel.startswith('.'):rel='./'+rel
  s=s.replace("'./"+dep+".mjs'",repr(rel))
 p.write_text(s)
styles={'base':'foundations','experience':'components','workbench':'workbench','z-directions':'themes','zz-now':'numbers-actions','zz-support':'support','zzz-accounts':'accounts','zzz-containers':'pots','zzzz-numbers':'number-cards'}
for name,new in styles.items():shutil.copy(old/'styles'/f'{name}.css',dest/'src/design-system'/f'{new}.css')
manifest={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in old.rglob('*') if p.is_file()}
(dest/'docs/reference-hashes.json').write_text(json.dumps(manifest,indent=2))
(dest/'scripts/source-map.json').write_text(json.dumps(mapping,indent=2))
