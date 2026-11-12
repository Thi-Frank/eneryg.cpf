const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
if(fs.existsSync('.env'))throw Error('Move local .env outside the build root before deploying');
const secrets=JSON.parse(fs.readFileSync('storage/hosting-secrets.json','utf8'));
const args=['node_modules/netlify-cli/bin/run.js','deploy','--prod','--message','Verified Boiler Insight pilot',
 '--env','PORTAL_ORIGIN=https://boiler-nongchok.netlify.app','--env','MAX_UPLOAD_MB=4',
 '--secret-env',`SESSION_SECRET=${secrets.SESSION_SECRET}`,'--secret-env',`PORTAL_API_TOKEN=${secrets.PORTAL_API_TOKEN}`];
const result=spawnSync(process.execPath,args,{stdio:'inherit'});
process.exit(result.status??1);
