# SingerFlow

Practice tools for singers, in the spirit of BiggieFlow but for sung phrasing. One self-contained web page with three tools, plus an LLM system prompt.

| Tool | What it does |
|---|---|
| **Formant Tuner** | Live pitch, F1 and F2 on a vowel chart. Shows the harmonics of your sung note and whether F1 sits within 25 cents of one. Sources: microphone, an audio file, or a built-in demo vowel. |
| **Blow! Singer** | Paste a lyric line. Each word is split into onset, vowel and coda, consonants are classed (plosive, fricative, nasal, glide or liquid, affricate, voiced or unvoiced), and a per-word timing bar shows how early the consonant starts and when it releases. |
| **Gospel Runs** | Generates a held note and a 4 to 7 note pentatonic or blues run, with glide-in, vibrato, a syllable ladder (consonant, narrow vowel, lyric vowel) and a pitch-guide playback. |

## Use it

Open `index.html` in Chrome or Firefox. The microphone needs permission and works from a local file in most browsers. If your browser refuses on a `file://` page, serve the folder instead:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Or publish the folder with GitHub Pages (Settings, Pages, deploy from branch).

Audio is analysed in the browser and never uploaded.

## Files

| Path | What it is |
|---|---|
| `index.html` | Standalone page (built from the source below) |
| `src/singerflow.body.html` | Source of truth; also the file published as an Artifact |
| `build.py` | Rebuilds `index.html` and `dist/artifact.html` |
| `prompts/singerflow_system_prompt.md` | LLM system prompt: consonant coach, formant coach, run writer |
| `tests/dsp.test.js` | Node tests for pitch and formant estimation on synthetic vowels |
| `tests/highpitch.js` | Prints how formant accuracy degrades as pitch rises |

```bash
node tests/dsp.test.js     # 17 checks
node tests/highpitch.js    # informational
```

## How the formant estimate works

Audio is downsampled, pre-emphasised and windowed (40 ms). Linear prediction (autocorrelation with Levinson-Durbin, order about 13) gives a spectral envelope, and the first two envelope peaks above 180 Hz are reported as F1 and F2. Pitch comes from a normalised autocorrelation tracker. The nearest-harmonic offset is `1200 * log2(F / (n * f0))` with `n = round(F / f0)`, the proximity idea used by the Finding Resonance tool (Warwick).

## Known limits (measured on synthetic vowels)

- Close up to about 260 Hz (middle C). From about 330 Hz (E4) up, the estimate tends to lock onto a harmonic instead of the true formant, because harmonics are too sparse to outline the vocal tract. Expect rough values for higher notes.
- Reference vowels are approximate speech averages (Peterson and Barney style) typed in from memory of the commonly tabulated values; they were not re-verified against the original table. Singing shifts them.
- Consonant parsing works from spelling, so silent letters, soft c and unusual words can be misread. Lead and release times are starting estimates to tune by ear.
- The run generator and its pitch guide are a plain synthesized tone. It does not model any person's voice.
- The vibrato and run facts come from published analysis of Mahalia Jackson recordings (HfM Weimar pop voices study). That analysis covers the recordings it studied, not every performance.

## Consent and style

Mahalia Jackson cannot consent to voice cloning, so this project does not imitate or synthesize her voice. It uses published analysis of her phrasing as a style reference only. The prompt in `prompts/` refuses voice cloning without documented consent and a liveness check, and refuses to reproduce copyrighted lyrics.

Add a LICENSE of your choice before publishing.
