import {NetlifyDB} from '@netlify/database-dev';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const db=new NetlifyDB({directory:'storage/local-db',port:55432});
const connection=await db.start();
await mkdir('storage',{recursive:true});
let previous='';try{previous=await readFile('.env','utf8')}catch{}
if(!previous.includes('SESSION_SECRET=')){
 await writeFile('.env',`DATABASE_URL=${connection}\nSESSION_SECRET=${randomBytes(32).toString('hex')}\nPORTAL_API_TOKEN=${randomBytes(32).toString('hex')}\nN8N_INGEST_WEBHOOK_URL=http://localhost:5678/webhook/boiler\nN8N_INGEST_TOKEN=${randomBytes(32).toString('hex')}\nMAX_UPLOAD_MB=20\nSEED_PASSWORD=${randomBytes(16).toString('hex')}\n`);
}else if(!previous.includes(connection))throw new Error('Existing .env database differs; refusing to overwrite');
console.log('Local test database is ready on port 55432. Credentials stay in .env.');
process.on('SIGINT',async()=>{await db.stop();process.exit(0)});
await new Promise(()=>{});
