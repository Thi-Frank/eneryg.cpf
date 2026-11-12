export function error(e:unknown){const m=e instanceof Error?e.message:''; const code=['401','403','404','409','413'].includes(m)?Number(m):400;return Response.json({error:code===400?'Invalid request':m,details:code===400?m:undefined},{status:code});}
export async function json(req:Request){const text=await req.text();if(Buffer.byteLength(text)>10*1024*1024)throw new Error('413');return JSON.parse(text);}
export function origin(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)throw new Error('403');}
