#!/usr/bin/env node
import fs from 'fs'; import path from 'path';
const P=(...xs)=>path.resolve(process.cwd(),...xs);
const X=(f)=>fs.existsSync(P(f)); const R=(f)=>fs.readFileSync(P(f),'utf8');
const lines=[]; const ok=m=>lines.push(`✅ ${m}`); const warn=m=>lines.push(`⚠️  ${m}`); const bad=m=>lines.push(`❌ ${m}`);
try{
  const must=['src/pages/Studio.jsx','src/apps/ErrlLiveStudioPro.jsx','src/utils/assetStore.js','src/utils/bus.js','src/utils/zipBundler.js'];
  for(const f of must) X(f)?ok('exists: '+f):bad('missing: '+f);
  X('src/apps/PhotosTab.jsx')?ok('PhotosTab.jsx present'):warn('PhotosTab.jsx missing (ok if not using Photos yet)');
  const srcFiles=[]; const walk=(d)=>{ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name);
    if(e.isDirectory()) walk(p); else if(/\.(jsx|tsx|js|ts)$/.test(e.name)) srcFiles.push(p);} };
  walk(P('src'));
  const hasStudioRoute=srcFiles.some(f=>/Route\s+path=.*\/studio/.test(R(f)));
  hasStudioRoute?ok('Router has /studio route'):warn('No /studio route found');
  const swReg = srcFiles.some(f=>/serviceWorker\.register\(|navigator\.serviceWorker\.register\(/.test(R(f)));
  swReg?warn('ServiceWorker registration found (disable during dev to avoid crashes)'):ok('No dev SW registration detected');
}catch(e){ bad('doctor-studio crashed: '+e.message); }
console.log('──────────────────────────'); console.log('🧑‍⚕️ Studio Doctor Report'); console.log('──────────────────────────'); for(const l of lines) console.log(l);
process.exit(0);
