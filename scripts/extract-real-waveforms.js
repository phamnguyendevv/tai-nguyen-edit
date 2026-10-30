const fs = require('fs');
const path = require('path');

const sfxDir = path.join(__dirname, '..', 'backend', 'public', 'audio', 'sfx');
const files = fs.readdirSync(sfxDir).filter(f => f.endsWith('.wav'));

console.log(`Analyzing ${files.length} real audio files in ${sfxDir}...`);

function extractRealWaveform(filePath, barCount = 64) {
  const buffer = fs.readFileSync(filePath);
  // Find 'data' chunk
  let dataOffset = 44;
  for (let i = 12; i < buffer.length - 8; i++) {
    if (buffer.toString('ascii', i, i + 4) === 'data') {
      dataOffset = i + 8;
      break;
    }
  }

  const numSamples = Math.floor((buffer.length - dataOffset) / 2);
  const samplesPerBar = Math.floor(numSamples / barCount);
  const rawPeaks = [];

  for (let b = 0; b < barCount; b++) {
    let maxAmp = 0;
    const start = dataOffset + b * samplesPerBar * 2;
    for (let s = 0; s < samplesPerBar; s++) {
      const idx = start + s * 2;
      if (idx + 1 < buffer.length) {
        const val = Math.abs(buffer.readInt16LE(idx)) / 32767;
        if (val > maxAmp) maxAmp = val;
      }
    }
    rawPeaks.push(maxAmp);
  }

  // Normalize with dynamic thresholding so silence is tiny dots (~0.02 - 0.05)
  // and audio impacts/steps form sharp visible spikes (up to 0.95)
  const maxOverall = Math.max(...rawPeaks, 0.01);
  return rawPeaks.map((p) => {
    const ratio = p / maxOverall;
    if (ratio < 0.12) {
      // Quiet background noise / silence -> minimal dot value
      return Number(Math.max(0.02, ratio * 0.35).toFixed(2));
    }
    // Sound events & peaks scale with high contrast
    const scaled = 0.1 + Math.pow((ratio - 0.12) / 0.88, 1.15) * 0.85;
    return Number(Math.min(0.96, Math.max(0.04, scaled)).toFixed(2));
  });
}

const waveforms = {};
files.forEach((f) => {
  const id = f.replace('.wav', '');
  const filePath = path.join(sfxDir, f);
  const waveform = extractRealWaveform(filePath, 64);
  waveforms[id] = waveform;
  console.log(`✓ Extracted waveform for ${id}: [${waveform.slice(0, 8).join(', ')} ... max: ${Math.max(...waveform)}]`);
});

// Now update both frontend/src/lib/data/sound-effects.ts and backend/src/data/sound-effects.ts
function updateSoundEffectsFile(targetFile) {
  if (!fs.existsSync(targetFile)) return;
  let content = fs.readFileSync(targetFile, 'utf8');

  Object.entries(waveforms).forEach(([id, wf]) => {
    // Regex to match sound effect block by id or audioUrl
    const regex = new RegExp(`(id:\\s*['"]sfx-${id}['"][\\s\\S]*?waveform:\\s*)(?:\\[[\\s\\S]*?\\]|makeWaveform\\(\\d+\\))`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1[${wf.join(', ')}]`);
    } else {
      // Try matching by filename in audioUrl
      const regexByUrl = new RegExp(`(audioUrl:\\s*['"][^'"]*${id}\\.wav['"][\\s\\S]*?waveform:\\s*)(?:\\[[\\s\\S]*?\\]|makeWaveform\\(\\d+\\))`, 'g');
      content = content.replace(regexByUrl, `$1[${wf.join(', ')}]`);
    }
  });

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log(`Updated real waveforms in ${targetFile}`);
}

const feFile = path.join(__dirname, '..', 'frontend', 'src', 'lib', 'data', 'sound-effects.ts');
const beFile = path.join(__dirname, '..', 'backend', 'src', 'data', 'sound-effects.ts');

updateSoundEffectsFile(feFile);
updateSoundEffectsFile(beFile);

console.log('Real audio intensity extraction complete!');
