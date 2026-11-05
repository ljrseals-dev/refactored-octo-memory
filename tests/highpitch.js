// Informational: how formant estimates degrade as pitch rises (not a pass/fail test).
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','src','singerflow.body.html'),'utf8');
const DSP=new Function(html.match(/\/\/ <DSP>([\s\S]*?)\/\/ <\/DSP>/)[1]+';return DSP;')();
const FS=48000;
function vowel(f0,forms,bws,dur=0.12){const n=Math.round(dur*FS),x=new Float32Array(n);
 for(let k=1;k*f0<5500;k++){const f=k*f0;let a=1/k;forms.forEach((F,i)=>{const q=F/bws[i],r=f/F;a*=1/Math.sqrt(Math.pow(1-r*r,2)+(r/q)*(r/q));});
  for(let i=0;i<n;i++)x[i]+=a*Math.sin(2*Math.PI*f*i/FS);}
 let m=0;for(const v of x)m=Math.max(m,Math.abs(v));for(let i=0;i<n;i++)x[i]=x[i]/m*.3;return x;}
for(const f0 of [260,330,440,523,660]){
  const r=DSP.analyze(vowel(f0,[850,1220,2810],[70,90,140]),FS);
  console.log('f0',f0,'-> pitch',r.voiced?r.f0.toFixed(0):'none','F1',r.voiced?r.F1.toFixed(0):'-','(want 850) F2',r.voiced?r.F2.toFixed(0):'-','(want 1220)');
}
