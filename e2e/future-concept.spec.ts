import {test,expect} from '@playwright/test';
const url='http://127.0.0.1:4174/concepts/future/';
test.beforeEach(async({page})=>{await page.goto(url);await page.waitForFunction(()=>!!(window as any).futureStudy);});
test('six bubbles stay in one field while time travel and details respond',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await expect(page.locator('.bubble')).toHaveCount(6);
 const field=await page.locator('#field').boundingBox();expect(field!.height).toBeLessThanOrEqual(301);
 await page.locator('[data-goal="loan"]').click();await page.locator('#land').click();
 await expect(page.locator('#date')).toHaveText(/Sep(t)? 2027/);
 await page.locator('#today').click();await expect(page.locator('#date')).toHaveText('Today');
 await page.locator('#speed').click();await expect(page.locator('#sheet-content')).toContainText('£850');
 await page.locator('#close-sheet').click();expect(errors).toEqual([]);
});
test('quick ideas combine, preserve View and reset the complete sandbox',async({page})=>{
 await page.locator('#sandbox').click();
 const original=await page.evaluate(()=>(window as any).futureStudy.getState().base.dates);
 const tick=await page.locator('#tick-home').evaluate(e=>e.getBoundingClientRect().x);
 await page.locator('[data-idea="home-extra"]').click();
 await expect(page.locator('#impact')).toContainText('Home 3mo earlier');
 await expect.poll(()=>page.locator('#tick-home').evaluate(e=>e.getBoundingClientRect().x)).toBeLessThan(tick);
 await page.locator('[data-idea="buffer-first"]').click();
 expect(await page.evaluate(()=>(window as any).futureStudy.getState().ideas.length)).toBe(2);
 await page.locator('#view').click();
 expect(await page.evaluate(()=>(window as any).futureStudy.getState().forecast.dates)).toEqual(original);
 await page.locator('#sandbox').click();await expect(page.locator('#primary')).toContainText('2');
 await page.locator('#reset').click();
 expect(await page.evaluate(()=>(window as any).futureStudy.getState().forecast.dates)).toEqual(original);
 await expect(page.locator('[aria-pressed="true"].idea')).toHaveCount(0);
 await expect(page.locator('#primary')).toBeDisabled();
});
test('conversation refines a pause and makes the money destination explicit',async({page})=>{
 await page.locator('#sandbox').click();await page.locator('#ask-ai').click();
 await page.locator('#chat-input').fill('What if I pause my Future Home contributions for six months?');
 await page.getByRole('button',{name:'Send idea',exact:true}).click();
 await expect(page.locator('.proposal')).toContainText('6 months');
 await page.locator('#chat-input').fill('Make it three months instead');
 await page.getByRole('button',{name:'Send idea',exact:true}).click();
 await expect(page.locator('.proposal')).toContainText('3 months');
 await page.locator('[data-destination="buffer"]').click();await page.locator('#try-proposal').click();
 const s=await page.evaluate(()=>(window as any).futureStudy.getState());
 expect(s.ideas[0].months).toBe(3);expect(s.forecast.snapshots[0].flow.home).toBe(0);expect(s.forecast.snapshots[0].flow.cash).toBe(0);
 await page.locator('#reset').click();await page.locator('#ask-ai').click();
 await expect(page.locator('.proposal')).toHaveCount(0);await expect(page.locator('#messages')).not.toContainText('six months?');
});
test('adding a seventh priority keeps the field compact and Reset removes it',async({page})=>{
 const old=await page.locator('#field').boundingBox();
 await page.locator('#add-goal').click();await page.locator('[name="name"]').fill('A big adventure');
 await page.getByRole('button',{name:'Place it in my future'}).click();
 await expect(page.locator('.bubble')).toHaveCount(7);
 const sizes=await page.locator('.bubble').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height};}));
 for(const size of sizes){expect(Math.abs(size.w-size.h)).toBeLessThan(1);expect(size.w).toBeGreaterThanOrEqual(43.9);}
 const box=await page.locator('#field').boundingBox();expect(Math.abs(box!.height-old!.height)).toBeLessThan(1);
 const bounds=await page.evaluate(()=>{
  const field=document.querySelector('#field')!.getBoundingClientRect(),foot=document.querySelector('footer')!.getBoundingClientRect(),rail=document.querySelector('.time-travel')!.getBoundingClientRect();
  return {fieldTop:field.top,railBottom:rail.bottom,footTop:foot.top,width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
 });
 expect(bounds.fieldTop).toBeGreaterThan(0);expect(bounds.railBottom).toBeLessThan(bounds.footTop);expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width);
 await page.locator('#reset').click();await expect(page.locator('.bubble')).toHaveCount(6);
 await page.screenshot({path:'/tmp/future-bubbles-'+test.info().project.name+'.png'});
});
