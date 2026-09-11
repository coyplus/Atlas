from pathlib import Path
import json,re
app=Path(__file__).resolve().parents[1];mapping=json.loads((app/'scripts/source-map.json').read_text())
for file in (app/'tests/reference').glob('*.source.mjs'):
 s=file.read_text()
 for old,new in mapping.items():s=s.replace('../app/'+old+'.mjs','../src/'+new+'.mjs')
 s=s.replace("../../Scenarios/","../data/")
 if file.name=='interface.source.mjs':
  s=s.replace("../'+edition+'.html", "./fixtures/'+edition+'.html")
  s=s.replace(".src.startsWith('data:image/jpeg;base64,')",".src.includes('/assets/')")
  s=s.replace("assert.equal(b.d.querySelector('.sheet-body'),step);assert.equal(step.scrollTop,55)","assert.equal(b.d.querySelector('.sheet-body').scrollTop,55)")
  s=s.replace("assert.equal(b.d.querySelector('#transfer-form'),form);assert.equal(amount.value,'12')","assert.equal(b.d.querySelector('#transfer-form [name=amount]').value,'12')")
  s=s.replace(".src.startsWith('data:image/')",".src.includes('/assets/')")
  # Future v3 replaces the four chart selectors with View / Sandbox. Keep the
  # original unrelated journey assertions, exercising legacy idea review via
  s=s.replace("b.click('tab:future');assert.equal(state(),'expanded');", "b.click('tab:future');assert.equal(state(),'compact');")
  s=s.replace("tab==='you'?'compact':'expanded'", "['you','future'].includes(tab)?'compact':'expanded'")
  s=s.replace("querySelector('#support-details').inert,tab==='you'", "querySelector('#support-details').inert,['you','future'].includes(tab)")
  # its supported presentation API. Full new UI flows live in future-integration.
  s=s.replace("for(const v of ['rings','area','list','bubbles']){b.click('view:'+v);b.click('time:120');", "for(const v of ['view','sandbox']){b.w.atlas.dispatch('future-mode:'+v);b.w.atlas.dispatch('future-time:120');")
  s=s.replace("b.click('rules');", "b.w.atlas.dispatch('rules');")
  s=s.replace("b.click('newplan');", "b.w.atlas.dispatch('newplan');")
  s=re.sub(r"b\.click\('idea:([^']+)'\)", r"b.w.atlas.wif('\1')", s)
  s=s.replace("b.click('preview-summary');", "b.w.atlas.dispatch('preview-summary');")
  s=s.replace("querySelector('.preview-bar')", "querySelector('.future-studio[data-has-experiments=true]')")
  s=s.replace("querySelector('.money-speed')", "querySelector('[data-action=\"future-speed\"]')")
  s=s.replace("b.click('zoom:0.25');assert.equal(b.d.querySelector('.chart-viewport').style.width,'125%');b.click('zoom:fit');assert.equal(b.d.querySelector('.chart-viewport').style.width,'100%');", "b.w.atlas.dispatch('future-time:120');assert.equal(b.d.querySelector('#time-slider').value,'120');b.w.atlas.dispatch('future-time:0');assert.equal(b.d.querySelector('#time-slider').value,'0');")
  s=s.replace("b.click('time:24');assert.match(b.d.querySelector('.ai-card').textContent,/milestone/i);", "b.w.atlas.setT(24);assert.match(b.d.querySelector('#fg-moment').textContent,/2028/);")
  # The React migration restores the same screen and scroll state, not a detached DOM node.
  s=s.replace("assert.equal(b.d.querySelector('.sheet'),sheet)","assert.equal(b.d.querySelector('.sheet-header h2').textContent,sheet.querySelector('h2').textContent)")
  s=s.replace("assert.equal(b.d.querySelector('.sheet'),detail)","assert.equal(b.d.querySelector('.sheet-header h2').textContent,detail.querySelector('h2').textContent)")
 (app/'tests'/file.name.replace('.source.mjs','.test.mjs')).write_text(s)
script=(app/'tests/generated-runtime.js').read_text();data=(app/'public/scenarios.json').read_text();media=json.loads((app/'public/media.json').read_text());out=app/'tests/fixtures';out.mkdir(exist_ok=True)
for edition in ['index','bento','metro','workbench','support-blueprint']:
 direction=edition if edition in ['bento','metro'] else 'vanilla';mode='workbench' if edition=='workbench' else 'blueprint' if edition=='support-blueprint' else 'prototype'
 html=f'<html><body data-direction="{direction}" data-mode="{mode}"><div id="app"></div><script>window.ATLAS_DATA={data};window.ATLAS_PORTRAITS={json.dumps(media["portraits"])};window.ATLAS_BANK_LOGOS={json.dumps(media["bankLogos"])};window.ATLAS_AUDIO={json.dumps(media["audio"])};</script><script>'+script.replace('</script','<\\/script')+'</script></body></html>'
 (out/(edition+'.html')).write_text(html)
