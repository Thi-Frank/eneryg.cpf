import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {alert,observations} from '../lib/schema';
const w=JSON.parse(readFileSync('n8n/boiler-ingest.json','utf8'));
const code=(name:string)=>w.nodes.find((n:{name:string})=>n.name===name).parameters.jsCode;
test('n8n accepts portal UUID and rejects an unregistered form ID',()=>{
 const execute=(id:string)=>runInNewContext(`(()=>{${code('Validate Upload Request')}})()`,{$input:{first:()=>({json:{body:{upload_id:id,asset_id:'BOILER-1'}},binary:{file:{fileName:'demo.xlsx'}}})}})[0].json;
 assert.equal(execute('11111111-1111-4111-8111-111111111111').asset_id,'boiler-1');
 assert.equal(execute('FORM-20261112160701').valid,false);
});
test('n8n transport adapts rule payload without inventing document links',()=>{
 const input={event_key:'test',upload_id:'11111111-1111-4111-8111-111111111111',asset_id:'boiler-1',observed_date:'2026-11-12',timezone:'Asia/Bangkok',granularity:'daily',category:'instrument_data_anomaly',severity:'warning',status:'new',rule_id:'zero',rule_version:1,source:{file_name:'demo.xlsx',sheet:'Sheet1',row:2},evidence:[{metric:'steam_pressure',value:0,unit:null}],diagnosis:'test',template_text:'เธ•เธฃเธงเธเธซเธเนเธฒเธเธฒเธ',suspected_causes:[],reference_docs:[{doc:'Plant manual',section:'1'}],analysis_method:'rules'};
 const result=runInNewContext(`(()=>{${code('Assemble Alert Payload')}})()`,{$:()=>({all:()=>[{json:input}]}),$input:{all:()=>[{json:{}}]}})[0].json.alert;
 assert.equal(alert.safeParse(result).success,true);
 assert.equal(result.reference_docs.length,0);
 assert.match(result.diagnosis,/Plant manual/);
});
test('normalizer uses bad for invalid readings and preserves missing values',()=>{
 const nodes:Record<string,unknown>={
  'Validate Upload Request':{upload_id:'11111111-1111-4111-8111-111111111111',asset_id:'boiler-1',file_type:'xlsx',file_name:'demo.xlsx'},
  'Load Tag Mapping':[{metric_key:'steam_pressure',source_header:'Steam Pressure',unit:'bar',approval_status:'approved',asset_id:'BOILER-1'}],
 };
 const result=runInNewContext(`(()=>{${code('Normalize Daily Data')}})()`,{$:(n:string)=>({first:()=>({json:nodes[n]}),all:()=>(nodes[n] as unknown[]).map(json=>({json}))}),$input:{all:()=>[['Date','Steam Pressure'],['2026-11-10',null],['2026-11-11','broken'],['2026-11-12',0]].map(row=>({json:{row}}))}})[0].json;
 assert.equal(result.ok,true);
 assert.equal(observations.safeParse(result.obs_batches[0]).success,true);
 assert.equal(result.rows[0].metrics.steam_pressure.value,null);
 assert.equal(result.rows[1].metrics.steam_pressure.quality,'bad');
});

