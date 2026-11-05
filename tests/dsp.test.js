// Run: node tests/dsp.test.js
// Extracts the DSP block from the app and checks it on synthetic vowels with known formants.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'singerflow.body.html'), 'utf8');
const m = html.match(/\/\/ <DSP>([\s\S]*?)\/\/ <\/DSP>/);
if (!m) { console.error('DSP block not found'); process.exit(1); }
const DSP = new Function(m[1] + '; return DSP;')();

const FS = 48000;
// Cascade-resonator vowel: harmonic k has amplitude (1/k) * product of formant resonance magnitudes.
function vowel(f0, forms, bws, dur = 0.12) {
  const n = Math.round(dur * FS), x = new Float32Array(n);
  for (let k = 1; k * f0 < 5500; k++) {
    const f = k * f0;
    let amp = 1 / k;
    forms.forEach((F, i) => {
      const q = F / bws[i], r = f / F;
      amp *= 1 / Math.sqrt(Math.pow(1 - r * r, 2) + (r / q) * (r / q));
    });
    for (let i = 0; i < n; i++) x[i] += amp * Math.sin(2 * Math.PI * f * i / FS);
  }
  let mx = 0; for (let i = 0; i < n; i++) mx = Math.max(mx, Math.abs(x[i]));
  for (let i = 0; i < n; i++) x[i] = x[i] / mx * 0.3;
  return x;
}

let fails = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : ''));
  if (!ok) fails++;
}

// Music helpers
const a4 = DSP.hzToNote(440);
check('A4 note name', a4.name === 'A4' && a4.cents === 0, JSON.stringify(a4));
const ho = DSP.harmonicOffset(800, 200);
check('harmonic offset 800 Hz over f0 200', ho.n === 4 && Math.abs(ho.cents) < 0.01, JSON.stringify(ho));
check('midiToHz(69) = 440', Math.abs(DSP.midiToHz(69) - 440) < 1e-9);

// Pitch and formant cases: [label, f0, [F1,F2,F3], tolerance on formants]
const cases = [
  ['male /ae/ f0=110',   110, [660, 1720, 2600], 0.15],
  ['male /u/ f0=110',    110, [300, 870, 2240],  0.20],
  ['male /a/ f0=130',    130, [730, 1090, 2440], 0.15],
  ['female /a/ f0=200',  200, [850, 1220, 2810], 0.18],
  ['female /i/ f0=200',  200, [310, 2790, 3310], 0.20],
  ['female /e/ f0=220',  220, [610, 2330, 3000], 0.18],
];
const results = [];
for (const [label, f0, F, tol] of cases) {
  const sig = vowel(f0, F, [70, 90, 140]);
  const r = DSP.analyze(sig, FS);
  const pitchOk = r.voiced && Math.abs(r.f0 - f0) / f0 < 0.01;
  check(label + ' pitch', pitchOk, r.voiced ? 'got ' + r.f0.toFixed(1) + ' Hz' : 'not voiced');
  const e1 = r.voiced ? Math.abs(r.F1 - F[0]) / F[0] : 1, e2 = r.voiced ? Math.abs(r.F2 - F[1]) / F[1] : 1;
  check(label + ' F1/F2', e1 < tol && e2 < tol, 'got F1=' + (r.F1 || 0).toFixed(0) + ' (want ' + F[0] + '), F2=' + (r.F2 || 0).toFixed(0) + ' (want ' + F[1] + ')');
  results.push({ label, e1, e2 });
}

// Silence and noise should not report a voiced pitch
const silence = new Float32Array(FS * 0.1);
check('silence is unvoiced', !DSP.analyze(silence, FS).voiced);
const noise = Float32Array.from({ length: FS * 0.1 }, () => (Math.random() - 0.5) * 0.2);
check('white noise is unvoiced', !DSP.analyze(noise, FS).voiced);

console.log(fails ? '\n' + fails + ' check(s) failed' : '\nall checks passed');
process.exit(fails ? 1 : 0);
