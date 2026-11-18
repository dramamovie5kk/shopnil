// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { runQuery } from '../../server/database';
import type { Env } from '../../server/core';
import type { Identity } from '../../server/auth';
const owner:Identity={id:'owner',email:'owner@example.invalid',full_name:'Owner',sid:'session',authenticated_at:0,roles:['admin']};
describe('settings save within D1 query and binding budgets',()=>{
  it('saves the full settings form atomically without a query per setting',async()=>{
    const prepare=vi.fn((sql:string)=>({bind:(...values:unknown[])=>{
      expect(values.length).toBeLessThanOrEqual(100);
      expect(sql).toContain('ON CONFLICT(setting_key)');
      return {sql,values};
    }}));
    const batch=vi.fn(async(statements:unknown[])=>{
      if(statements.length>45)throw new Error('D1 query limit exceeded');
      return statements.map(()=>({success:true,results:[]}));
    });
    const env={DB:{prepare,batch}} as unknown as Env;
    const values=Array.from({length:200},(_,i)=>({setting_key:'field_'+i,setting_value:'value-'+i,updated_at:new Date().toISOString()}));
    const result=await runQuery(env,{table:'site_settings',action:'upsert',onConflict:'setting_key',values},owner,new Request('https://example.test/api/database'));
    expect(result.error).toBeNull();expect(batch).toHaveBeenCalledOnce();
    expect(prepare.mock.calls.length).toBeLessThanOrEqual(10);
  });
  it('keeps bulk settings restricted to admins',async()=>{
    const batch=vi.fn(),prepare=vi.fn(),env={DB:{prepare,batch}} as unknown as Env;
    await expect(runQuery(env,{table:'site_settings',action:'upsert',onConflict:'setting_key',values:[{setting_key:'site_name',setting_value:'bad'}]},null,new Request('https://example.test/api/database'))).rejects.toMatchObject({status:403});
    expect(batch).not.toHaveBeenCalled();expect(prepare).not.toHaveBeenCalled();
  });
});
