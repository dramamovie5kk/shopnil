import { QueryBuilder } from '../shared/query';
import { Env } from './core';
import { Query, runQuery } from './database';
// Internal-only capability: never exposed to a browser or returned in an API.
export function serviceDatabase(env:Env) {
  return { from:(table:string)=>new QueryBuilder(table,async q=>{
    try {return await runQuery(env,q as unknown as Query,{id:'internal',email:'',full_name:'',sid:'',authenticated_at:0,roles:['admin']},new Request('https://internal.invalid'));}
    catch{return {data:null,error:new Error('Database operation failed')};}
  })};
}
