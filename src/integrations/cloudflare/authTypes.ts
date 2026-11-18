export interface User {id:string;email:string;user_metadata:{full_name?:string}}
export interface Session {user:User;expires_at?:number}
export type AuthEvent='SIGNED_IN'|'SIGNED_OUT'|'USER_UPDATED'|'PASSWORD_RECOVERY'|'INITIAL_SESSION';
