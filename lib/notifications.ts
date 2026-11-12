export type NotificationAlert={id:string;status:string;severity:string;created_at?:string;observed_date:string;asset_id:string;category:string;payload:{source:{file:string};evidence:Array<{metric:string;value:number|null;unit:string}>}};
const priority:Record<string,number>={high:3,warning:2,info:1};
export function pendingAlerts(alerts:NotificationAlert[],acknowledged:ReadonlySet<string>){
 return [...new Map(alerts.filter(a=>a.status==='new'&&!acknowledged.has(a.id)).map(a=>[a.id,a])).values()]
 .sort((a,b)=>(priority[b.severity]||0)-(priority[a.severity]||0)||(b.created_at||'').localeCompare(a.created_at||''));
}
