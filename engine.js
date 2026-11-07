/* Dependency-free Monte Carlo engine, also importable in Node for testing. */
(function(root){
'use strict';
const correlation=[[1,.75,-.1,.05],[.75,1,-.05,.1],[-.1,-.05,1,.1],[.05,.1,.1,1]];
function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function quantile(sorted,p){const x=(sorted.length-1)*p,i=Math.floor(x);return sorted[i]+(sorted[Math.min(i+1,sorted.length-1)]-sorted[i])*(x-i);}
function simulate(c){
if(!Number.isFinite(c.balance)||c.balance<=0||!Number.isFinite(c.years)||c.years<=0||!Number.isInteger(c.count)||c.count<100||c.count>25000||!Number.isInteger(c.seed)||c.seed<1||c.seed>2147483647||![.95,.99].includes(c.confidence)||!Number.isFinite(c.threshold)||c.threshold<0||c.threshold>1)throw Error('Please enter valid simulation settings.');
if(c.weights.length!==4||c.mu.length!==4||c.vol.length!==4||c.weights.some(x=>!Number.isFinite(x)||x<0)||Math.abs(c.weights.reduce((a,b)=>a+b,0)-1)>1e-8||c.mu.some(x=>!Number.isFinite(x)||x<-.5||x>.5)||c.vol.some(x=>!Number.isFinite(x)||x<0||x>1))throw Error('Allocations must total 100%. Drift must be −50% to 50%, and volatility 0% to 100%.');
const mu=c.weights.reduce((s,w,i)=>s+w*c.mu[i],0);let variance=0;
for(let i=0;i<4;i++)for(let j=0;j<4;j++)variance+=c.weights[i]*c.weights[j]*c.vol[i]*c.vol[j]*correlation[i][j];
const sigma=Math.sqrt(Math.max(variance,0)),random=rng(c.seed),steps=120,dt=c.years/steps,drift=(mu-variance/2)*dt,shock=sigma*Math.sqrt(dt),columns=Array.from({length:steps+1},()=>[]),samples=[],ends=[];
for(let i=0;i<c.count;i++){let v=c.balance,path=[v];columns[0].push(v);for(let t=1;t<=steps;t++){const z=Math.sqrt(-2*Math.log(1-random()))*Math.cos(2*Math.PI*random());v*=Math.exp(drift+shock*z);columns[t].push(v);if(i<35)path.push(v);}if(i<35)samples.push(path);ends.push(v);}
const bands=columns.map(a=>{a.sort((x,y)=>x-y);return[quantile(a,.05),quantile(a,.5),quantile(a,.95)];});
const sorted=[...ends].sort((a,b)=>a-b),tailN=Math.max(1,Math.ceil((1-c.confidence)*c.count-1e-8)),cut=quantile(sorted,1-c.confidence),es=c.balance-sorted.slice(0,tailN).reduce((a,b)=>a+b,0)/tailN;
return{ends,bands,samples,median:quantile(sorted,.5),var:c.balance-cut,es,loss:ends.filter(x=>x<c.balance*(1-c.threshold)).length/c.count,mu,sigma,config:JSON.parse(JSON.stringify(c))};
}
const api={simulate,quantile,correlation};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RiskEngine=api;
})(typeof window==='undefined'?this:window);
