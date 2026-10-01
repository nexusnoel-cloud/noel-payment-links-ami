import {createHmac, timingSafeEqual} from 'node:crypto';
export const RECOVERY_COOKIE='sdj_receipt';
const MAX_AGE=60*60*24*90;
function signature(value,key){return createHmac('sha256',key).update('sdj-recovery-v1:'+value).digest('base64url');}
export function recoveryToken(id,key,now=Date.now()){
 if(!/^pi_[A-Za-z0-9]+$/.test(id)||!key)throw new Error('Invalid recovery configuration');
 const value=id+'.'+Math.floor(now/1000+MAX_AGE);return value+'.'+signature(value,key);
}
export function readRecoveryToken(token,key,now=Date.now()){
 if(!token||!key)return null;
 const parts=token.split('.');if(parts.length!==3)return null;
 const [id,expires,sig]=parts;
 if(!/^pi_[A-Za-z0-9]+$/.test(id)||!/^\d+$/.test(expires)||Number(expires)<=now/1000||Number(expires)>now/1000+MAX_AGE+60)return null;
 const expected=Buffer.from(signature(id+'.'+expires,key)),actual=Buffer.from(sig);
 return expected.length===actual.length&&timingSafeEqual(expected,actual)?id:null;
}
export function recoveryCookie(id){return `${RECOVERY_COOKIE}=${recoveryToken(id,process.env.STRIPE_SECRET_KEY)}; Path=/api/sdj; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;}
export function recoveryId(request){const value=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(RECOVERY_COOKIE+'='))?.slice(RECOVERY_COOKIE.length+1);return readRecoveryToken(value,process.env.STRIPE_SECRET_KEY);}
