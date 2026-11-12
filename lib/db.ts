import postgres from 'postgres';
export const sql = postgres(process.env.DATABASE_URL || process.env.NETLIFY_DB_URL || 'postgres://boiler:boiler@localhost:5432/boiler', {max:5,prepare:false,onnotice:()=>{}});
