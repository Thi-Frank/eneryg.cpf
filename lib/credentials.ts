export function loginIdentifier(body:{username?:unknown;email?:unknown}){
 const identifier=String(body.username??body.email??'').trim().toLowerCase();
 return identifier==='admin'?'admin@boiler.local':identifier;
}
