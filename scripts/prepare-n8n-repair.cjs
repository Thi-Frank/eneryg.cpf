const fs = require('node:fs');
const path = require('node:path');
const source = process.argv[2];
if (!source) throw Error('Pass the exported n8n workflow JSON path');
const workflow = JSON.parse(fs.readFileSync(source, 'utf8'));
const node = name => workflow.nodes.find(n => n.name === name);
// Portal owns upload registration, IDs and the server-side upload permission check.
node('Upload Excel File (Form)').disabled = true;
for (const name of ['Validate Webhook Request', 'Validate Upload Request']) {
  node(name).parameters.jsCode = `const item=$input.first();
const body=item.json.body||item.json;
const binary=item.binary||{};
const key=Object.keys(binary).find(k=>k==='file')||Object.keys(binary)[0];
const upload_id=String(body.upload_id||'').trim();
const asset_id=String(body.asset_id||'').trim().toLowerCase();
const missing=[];
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(upload_id))missing.push('portal upload_id (UUID)');
if(asset_id!=='boiler-1')missing.push('asset_id must be boiler-1');
if(!key)missing.push('file');
const file_name=key?binary[key].fileName||'upload':'';
const file_ext=file_name.split('.').pop().toLowerCase();
return [{json:{valid:!missing.length,missing,upload_id,asset_id,file_name,file_ext,mime_type:key?binary[key].mimeType||'':'',file_type:['xls','xlsx'].includes(file_ext)?file_ext:'unsupported',binary_key:key||'file',source:'webhook',received_at:new Date().toISOString()},binary}];`;
}
node('Mark Upload Processing').parameters.jsonBody=JSON.stringify({status:'processing',row_count:0,rejected_count:0,alert_count:0,errors:[]});
for(const name of ['Normalize Daily Data','Run Rule Engine']) {
  node(name).parameters.jsCode=node(name).parameters.jsCode
    .replaceAll('m.asset_id === req.asset_id', 'String(m.asset_id).toLowerCase() === req.asset_id')
    .replaceAll('r.asset_id === req.asset_id', 'String(r.asset_id).toLowerCase() === req.asset_id')
    .replaceAll('c.asset_id === req.asset_id', 'String(c.asset_id).toLowerCase() === req.asset_id');
}
node('Normalize Daily Data').parameters.jsCode=node('Normalize Daily Data').parameters.jsCode
  .replace("quality = 'invalid'", "quality = 'bad'")
  .replace('unit: mp.unit || null', "unit: mp.unit || ''");
// Keep rule definitions unchanged; adapt only the API transport contract.
node('Assemble Alert Payload').parameters.jsCode += `
// The code above returns directly; transport adaptation is added by the wrapper below.
`;
node('Assemble Alert Payload').parameters.jsCode=`const run=()=>{\n${node('Assemble Alert Payload').parameters.jsCode}\n};
return run().map(item=>{
 const a=item.json.alert;
 a.rule_version=String(a.rule_version??'1');
 a.source={file:a.source.file||a.source.file_name||'',sheet:a.source.sheet,row:a.source.row};
 a.evidence=a.evidence.map(e=>({...e,unit:e.unit||''}));
 const docs=a.reference_docs||[];
 const notes=docs.filter(d=>!/^https?:\\/\\//.test(d.url||d.doc||''));
 if(notes.length)a.diagnosis+='\\nเอกสารอ้างอิงตามกฎ: '+notes.map(d=>[d.title||d.doc,d.section].filter(Boolean).join(' · ')).join('; ');
 a.reference_docs=docs.filter(d=>/^https?:\\/\\//.test(d.url||d.doc||'')).map(d=>({title:d.title||d.doc,url:d.url||d.doc}));
 return {json:{alert:a}};
});`;
workflow.active=false;
delete workflow.pinData;
const out=path.join('storage','n8n-workflow-repaired.json');
fs.writeFileSync(out,JSON.stringify(workflow,null,2));
console.log('Prepared',out,'('+workflow.nodes.length+' nodes; no secret values)');
