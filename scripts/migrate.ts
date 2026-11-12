import {sql} from '../lib/db';
import {readFile,readdir} from 'fs/promises';
await sql`CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())`;
for(const file of (await readdir('db')).filter(f=>f.endsWith('.sql')).sort()){
 const applied=await sql`SELECT name FROM schema_migrations WHERE name=${file}`;
 if(!applied.length)await sql.begin(async tx=>{await tx.unsafe(await readFile('db/'+file,'utf8'));await tx`INSERT INTO schema_migrations(name) VALUES(${file})`;});
}
console.log('Migration complete');await sql.end();
