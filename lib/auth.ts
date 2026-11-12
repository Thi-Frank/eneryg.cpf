import {cookies} from 'next/headers';
import {SignJWT,jwtVerify} from 'jose';
import {sql} from './db';
import {timingSafeEqual} from 'crypto';
export function secret(){ const s=process.env.SESSION_SECRET; if(!s || s.length<32) throw new Error('SESSION_SECRET must have 32 characters'); return new TextEncoder().encode(s); }
export async function session(id:string){return new SignJWT({}).setProtectedHeader({alg:'HS256'}).setSubject(id).setExpirationTime('8h').sign(secret());}
export async function user(){try{const token=(await cookies()).get('session')?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret());const [u]=await sql`SELECT id,name,email,role FROM users WHERE id=${payload.sub!}`;return u||null;}catch{return null;}}
export async function requireUser(write=false){const u=await user();if(!u)throw new Error('401');if(write&&!['engineer','admin'].includes(u.role))throw new Error('403');return u;}
export function machine(req:Request){const expected=process.env.PORTAL_API_TOKEN;const actual=req.headers.get('authorization')||'';if(!expected||actual.length!==('Bearer '+expected).length||!timingSafeEqual(Buffer.from(actual),Buffer.from('Bearer '+expected)))throw new Error('401');}
