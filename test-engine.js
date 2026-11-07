const assert=require('node:assert/strict');
const {simulate,correlation}=require('./engine');
const base={balance:10000,years:1,count:10000,confidence:.95,threshold:.1,seed:42,weights:[.45,.15,.3,.1],mu:[.08,.07,.035,.045],vol:[.18,.2,.06,.15]};
const a=simulate(base),b=simulate(base);assert.deepEqual(a.ends,b.ends);assert(a.es>=a.var);assert(a.ends.every(x=>x>0));
const deterministic=simulate({...base,count:100,vol:[0,0,0,0]});assert(Math.abs(deterministic.median-base.balance*Math.exp(a.mu))<1e-7);
const zero=simulate({...base,count:100,mu:[0,0,0,0],vol:[0,0,0,0]});assert.equal(zero.var,0);assert.equal(zero.es,0);assert.equal(zero.loss,0);
const analyticMean=base.balance*Math.exp(a.mu),sampleMean=a.ends.reduce((x,y)=>x+y,0)/base.count;assert(Math.abs(sampleMean/analyticMean-1)<.01);
const expectedMedian=base.balance*Math.exp(a.mu-a.sigma*a.sigma/2);assert(Math.abs(a.median/expectedMedian-1)<.01);
assert.throws(()=>simulate({...base,weights:[1,1,0,0]}));assert.throws(()=>simulate({...base,mu:[NaN,0,0,0]}));assert.throws(()=>simulate({...base,seed:1.5}));
// Cholesky confirms the assumed correlation matrix is positive definite.
const L=Array.from({length:4},()=>Array(4).fill(0));for(let i=0;i<4;i++)for(let j=0;j<=i;j++){let s=correlation[i][j];for(let k=0;k<j;k++)s-=L[i][k]*L[j][k];if(i===j){assert(s>0);L[i][j]=Math.sqrt(s);}else L[i][j]=s/L[j][j];}
console.log('Passed: reproducibility, tail ordering, zero risk, analytic moments, validation, correlation matrix.');
