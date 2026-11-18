// Fluent query protocol for the application's typed table/relationship calls.
// The server validates every identifier, operation, field and access scope.
export type Result = { data: any; error: (Error & {code?:string;status?:number}) | null; count?: number };
export class QueryBuilder implements PromiseLike<Result> {
  q: Record<string, any>;
  constructor(table:string, private execute:(query:Record<string,any>)=>Promise<Result>) {this.q={table,action:'select',filters:[],orders:[]};}
  select(fields='*',options:{count?:string;head?:boolean}={}) {this.q.select=fields;Object.assign(this.q,options);return this;}
  insert(values:unknown) {this.q.action='insert';this.q.values=values;delete this.q.select;return this;}
  upsert(values:unknown,options:{onConflict?:string}={}) {this.q.action='upsert';this.q.values=values;Object.assign(this.q,options);delete this.q.select;return this;}
  update(values:unknown) {this.q.action='update';this.q.values=values;delete this.q.select;return this;}
  delete() {this.q.action='delete';delete this.q.select;return this;}
  filter(column:string,op:string,value:unknown) {this.q.filters.push({column,op,value});return this;}
  eq(c:string,v:unknown){return this.filter(c,'eq',v);} neq(c:string,v:unknown){return this.filter(c,'neq',v);}
  gt(c:string,v:unknown){return this.filter(c,'gt',v);} gte(c:string,v:unknown){return this.filter(c,'gte',v);}
  lt(c:string,v:unknown){return this.filter(c,'lt',v);} lte(c:string,v:unknown){return this.filter(c,'lte',v);}
  in(c:string,v:unknown[]){return this.filter(c,'in',v);} is(c:string,v:unknown){return this.filter(c,'is',v);}
  like(c:string,v:string){return this.filter(c,'like',v);} ilike(c:string,v:string){return this.filter(c,'ilike',v);}
  not(c:string,op:string,v:unknown){if(op!=='eq')throw new Error('Unsupported negated filter');return this.filter(c,'neq',v);}
  order(column:string,options:{ascending?:boolean}={}) {this.q.orders.push({column,ascending:options.ascending!==false});return this;}
  limit(n:number){this.q.limit=n;return this;} range(from:number,to:number){this.q.offset=from;this.q.limit=to-from+1;return this;}
  single(){this.q.single='one';return this;} maybeSingle(){this.q.single='maybe';return this;}
  then<A=Result,B=never>(fulfilled?:((value:Result)=>A|PromiseLike<A>)|null,rejected?:((reason:unknown)=>B|PromiseLike<B>)|null):PromiseLike<A|B>{return this.execute(this.q).then(fulfilled,rejected);}
}
