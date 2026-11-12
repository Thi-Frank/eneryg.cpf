import {test} from 'node:test';
import assert from 'node:assert/strict';
import {observations,feedback,date} from '../lib/schema';
test('missing values remain null; dates cannot roll over',()=>{const b=observations.parse({upload_id:'11111111-1111-4111-8111-111111111111',asset_id:'boiler-1',rows:[{observed_date:'2026-11-01',timezone:'Asia/Bangkok',source_sheet:'Daily',source_row:2,metrics:{steam_pressure:{value:null,unit:'bar',quality:'missing'}}}]});assert.equal(b.rows[0].metrics.steam_pressure.value,null);assert.equal(date.safeParse('2026-02-30').success,false);});
test('unknown inspection is valid, arbitrary result is rejected',()=>{const b={result:'unknown',cause:'',correction:'',tags:'',outcome:'',reviewed_at:'2026-11-12T00:00:00Z',status:'investigating'};assert.equal(feedback.safeParse(b).success,true);assert.equal(feedback.safeParse({...b,result:'guess'}).success,false);});
