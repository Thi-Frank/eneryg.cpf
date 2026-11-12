import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isAllowedOrigin} from '../lib/http';
test('trusted deployment origin works behind a proxy and rejects other sites',()=>{
 const url='https://internal-proxy.example/api/login';
 assert.equal(isAllowedOrigin(new Request(url,{headers:{Origin:'https://boiler-nongchok.netlify.app'}}),'https://boiler-nongchok.netlify.app'),true);
 assert.equal(isAllowedOrigin(new Request(url,{headers:{Origin:'https://attacker.example'}}),'https://boiler-nongchok.netlify.app'),false);
 assert.equal(isAllowedOrigin(new Request(url),'https://boiler-nongchok.netlify.app'),false);
 assert.equal(isAllowedOrigin(new Request('http://localhost:3000/api/login',{headers:{Origin:'http://localhost:3000'}})),true);
});
