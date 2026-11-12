import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pendingAlerts,NotificationAlert} from '../lib/notifications';
const alert=(id:string,severity='warning',status='new'):NotificationAlert=>({id,severity,status,observed_date:'2026-11-12',asset_id:'boiler-1',category:'test',payload:{source:{file:'Demo.xlsx'},evidence:[]}});
test('new alerts appear once, highest priority first; acknowledged and closed cases do not alert',()=>{
 const rows=[alert('a'),alert('b','high'),alert('a'),alert('c','info'),alert('d','high','resolved'),alert('e','warning','investigating'),alert('f','high','false_positive')];
 assert.deepEqual(pendingAlerts(rows,new Set(['c'])).map(a=>a.id),['b','a']);
 assert.deepEqual(pendingAlerts(rows,new Set(['a','b','c'])),[]);
 assert.equal(rows[0].status,'new','acknowledgement must not mutate the server case status');
});
