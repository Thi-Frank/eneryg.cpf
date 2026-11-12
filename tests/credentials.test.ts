import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loginIdentifier} from '../lib/credentials';
test('Admin username resolves to database account; emails remain supported',()=>{
 assert.equal(loginIdentifier({username:'Admin'}),'admin@boiler.local');
 assert.equal(loginIdentifier({email:'ENGINEER@boiler.local'}),'engineer@boiler.local');
 assert.equal(loginIdentifier({username:'someone'}),'someone');
});
