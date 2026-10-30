const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'audio', 'sfx');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to write 16-bit PCM WAV buffer
function createWavBuffer(sampleRate, durationSeconds, sampleGenerator) {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const bytesPerSample = 2; // 16-bit
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = sampleGenerator(t, durationSeconds, i);
    // Clamp to -1.0 to 1.0
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

const sampleRate = 44100;

const soundGenerators = [
  {
    id: 'birds-in-the-grove',
    duration: 3.5,
    gen: (t) => {
      // Periodic chirps
      const cycle = t % 0.8;
      let amp = 0;
      let freq = 2400;
      if (cycle < 0.25) {
        amp = Math.sin((cycle / 0.25) * Math.PI) * 0.45;
        freq = 2200 + Math.sin(cycle * 60) * 800 + (cycle * 2000);
      } else if (cycle > 0.4 && cycle < 0.6) {
        amp = Math.sin(((cycle - 0.4) / 0.2) * Math.PI) * 0.35;
        freq = 3100 - (cycle - 0.4) * 3000;
      }
      const wind = (Math.random() * 2 - 1) * 0.02 * (0.8 + 0.2 * Math.sin(t * 2));
      return Math.sin(2 * Math.PI * freq * t) * amp + wind;
    }
  },
  {
    id: 'birds-in-the-morning',
    duration: 4.2,
    gen: (t) => {
      const cycle = t % 0.6;
      let amp = 0;
      let freq = 2800;
      if (cycle < 0.18) {
        amp = Math.sin((cycle / 0.18) * Math.PI) * 0.5;
        freq = 2600 + Math.sin(cycle * 80) * 600;
      } else if (cycle > 0.3 && cycle < 0.45) {
        amp = Math.sin(((cycle - 0.3) / 0.15) * Math.PI) * 0.4;
        freq = 3200 + Math.sin(cycle * 90) * 500;
      }
      return Math.sin(2 * Math.PI * freq * t) * amp;
    }
  },
  {
    id: 'long-howl-far-away',
    duration: 6.8,
    gen: (t, dur) => {
      const env = Math.sin((t / dur) * Math.PI);
      const freq = 380 + Math.sin(t * 1.2) * 140 - (t > dur * 0.6 ? (t - dur * 0.6) * 60 : 0);
      const overtone = Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.2;
      const sub = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.15;
      const reverb = (Math.random() * 2 - 1) * 0.03 * env;
      return (Math.sin(2 * Math.PI * freq * t) * 0.6 + overtone + sub + reverb) * env;
    }
  },
  {
    id: 'cicadas-buzzing-loud',
    duration: 5.5,
    gen: (t) => {
      const buzzFreq = 4200;
      const pulse = (Math.sin(2 * Math.PI * 18 * t) + 1) * 0.5;
      const wave = Math.sin(2 * Math.PI * buzzFreq * t) * (0.3 + 0.4 * pulse);
      const noise = (Math.random() * 2 - 1) * 0.15 * pulse;
      return (wave + noise) * 0.6;
    }
  },
  {
    id: 'birds',
    duration: 3.2,
    gen: (t) => {
      const cycle = t % 0.5;
      let amp = 0;
      let freq = 2500;
      if (cycle < 0.15) {
        amp = Math.sin((cycle / 0.15) * Math.PI) * 0.45;
        freq = 2400 + cycle * 4000;
      }
      return Math.sin(2 * Math.PI * freq * t) * amp;
    }
  },
  {
    id: 'owl-hoots',
    duration: 4.5,
    gen: (t) => {
      let amp = 0;
      let freq = 290;
      const hoot1 = t > 0.5 && t < 1.3;
      const hoot2 = t > 1.8 && t < 2.9;
      if (hoot1) {
        const p = (t - 0.5) / 0.8;
        amp = Math.sin(p * Math.PI) * 0.55;
        freq = 300 - p * 30;
      } else if (hoot2) {
        const p = (t - 1.8) / 1.1;
        amp = Math.sin(p * Math.PI) * 0.65;
        freq = 280 - p * 40;
      }
      return Math.sin(2 * Math.PI * freq * t) * amp + (Math.random() * 2 - 1) * 0.01;
    }
  },
  {
    id: 'chorus-of-frogs',
    duration: 5.0,
    gen: (t) => {
      const ribbit1 = Math.floor(t * 3) % 2 === 0 ? Math.sin((t * 3 % 1) * Math.PI) : 0;
      const frogTone = Math.sin(2 * Math.PI * 160 * t) * Math.sin(2 * Math.PI * 28 * t);
      const highFrog = Math.sin(2 * Math.PI * 340 * t) * Math.sin(2 * Math.PI * 45 * (t + 0.2)) * 0.4;
      return (frogTone + highFrog) * ribbit1 * 0.5;
    }
  },
  {
    id: 'chorus-of-birds',
    duration: 4.8,
    gen: (t) => {
      const b1 = Math.sin(2 * Math.PI * (2100 + Math.sin(t * 15) * 400) * t) * ((t % 0.7 < 0.25) ? 0.35 : 0.05);
      const b2 = Math.sin(2 * Math.PI * (3400 + Math.cos(t * 22) * 500) * t) * (((t + 0.3) % 0.9 < 0.2) ? 0.3 : 0.05);
      const b3 = Math.sin(2 * Math.PI * (1800 + Math.sin(t * 8) * 300) * t) * (((t + 0.5) % 1.1 < 0.3) ? 0.25 : 0.02);
      return b1 + b2 + b3;
    }
  },
  {
    id: 'urban-birdsong',
    duration: 3.8,
    gen: (t) => {
      const chirp = Math.sin(2 * Math.PI * (2700 + Math.sin(t * 40) * 800) * t) * ((t % 0.6 < 0.2) ? 0.45 : 0.02);
      const cityHum = Math.sin(2 * Math.PI * 65 * t) * 0.08 + (Math.random() * 2 - 1) * 0.03;
      return chirp + cityHum;
    }
  },
  {
    id: 'birds-chirping',
    duration: 3.0,
    gen: (t) => {
      const phase = t % 0.35;
      const amp = phase < 0.12 ? Math.sin((phase / 0.12) * Math.PI) * 0.5 : 0;
      const freq = 3100 + Math.sin(phase * 90) * 700;
      return Math.sin(2 * Math.PI * freq * t) * amp;
    }
  },
  {
    id: 'chirping-of-crickets',
    duration: 4.0,
    gen: (t) => {
      const pulse = (Math.sin(2 * Math.PI * 14 * t) > 0.4) ? 0.45 : 0.02;
      return Math.sin(2 * Math.PI * 4600 * t) * pulse;
    }
  },
  {
    id: 'pigeon-singing',
    duration: 3.6,
    gen: (t) => {
      const coo = (t % 1.2 < 0.7) ? Math.sin(((t % 1.2) / 0.7) * Math.PI) * 0.5 : 0;
      const freq = 220 + Math.sin(t * 12) * 25;
      return Math.sin(2 * Math.PI * freq * t) * coo;
    }
  },
  {
    id: 'machines-electric-drill',
    duration: 3.2,
    gen: (t) => {
      const rpm = 450 + Math.sin(t * 3) * 50;
      const motor = Math.sin(2 * Math.PI * rpm * t) * 0.4;
      const gear = Math.sin(2 * Math.PI * (rpm * 3.5) * t) * 0.25;
      const hum = (Math.random() * 2 - 1) * 0.15;
      return (motor + gear + hum) * 0.6;
    }
  },
  {
    id: 'household-clock-ticking',
    duration: 4.0,
    gen: (t) => {
      const tick = (t % 1.0 < 0.04) ? Math.sin(((t % 1.0) / 0.04) * Math.PI) * 0.6 : 0;
      const freq = (Math.floor(t) % 2 === 0) ? 1400 : 1200;
      return Math.sin(2 * Math.PI * freq * t) * tick;
    }
  },
  {
    id: 'cars-engine-accelerate',
    duration: 5.2,
    gen: (t, dur) => {
      const progress = t / dur;
      const rpm = 70 + progress * 240;
      const engine = Math.sin(2 * Math.PI * rpm * t) * 0.5 + Math.sin(2 * Math.PI * (rpm * 2) * t) * 0.3;
      const exhaust = (Math.random() * 2 - 1) * 0.1 * (0.5 + 0.5 * progress);
      return (engine + exhaust) * 0.7;
    }
  },
  {
    id: 'water-river-stream',
    duration: 6.0,
    gen: (t) => {
      const gurgle1 = Math.sin(2 * Math.PI * 450 * t) * (0.15 + 0.1 * Math.sin(t * 5));
      const gurgle2 = Math.sin(2 * Math.PI * 720 * t) * (0.12 + 0.08 * Math.cos(t * 7));
      const splash = (Math.random() * 2 - 1) * 0.25;
      return (gurgle1 + gurgle2 + splash) * 0.5;
    }
  },
  {
    id: 'electronic-digital-beep',
    duration: 2.5,
    gen: (t) => {
      const beep = (t > 0.2 && t < 0.45) || (t > 0.65 && t < 0.9) ? 0.5 : 0;
      return Math.sin(2 * Math.PI * 1800 * t) * beep;
    }
  },
  {
    id: 'pets-dog-bark-distant',
    duration: 3.4,
    gen: (t) => {
      let amp = 0;
      const b1 = t > 0.4 && t < 0.75;
      const b2 = t > 1.1 && t < 1.45;
      if (b1) {
        amp = Math.sin(((t - 0.4) / 0.35) * Math.PI) * 0.6;
      } else if (b2) {
        amp = Math.sin(((t - 1.1) / 0.35) * Math.PI) * 0.55;
      }
      const pitch = 260 - ((t % 0.7) * 90);
      return Math.sin(2 * Math.PI * pitch * t) * amp + (Math.random() * 2 - 1) * 0.05 * amp;
    }
  },
  {
    id: 'transitions-fast-whoosh',
    duration: 2.2,
    gen: (t, dur) => {
      const p = t / dur;
      const env = Math.sin(p * Math.PI);
      const sweepFreq = 200 + Math.pow(p, 2) * 1400;
      const tone = Math.sin(2 * Math.PI * sweepFreq * t) * 0.35;
      const air = (Math.random() * 2 - 1) * 0.45;
      return (tone + air) * env * 0.75;
    }
  },
  {
    id: 'transitions-cinematic-impact',
    duration: 4.5,
    gen: (t, dur) => {
      const env = Math.exp(-t * 2.2);
      const sub = Math.sin(2 * Math.PI * (80 - t * 12) * t) * 0.7;
      const crack = (t < 0.1 ? (Math.random() * 2 - 1) * 0.6 : 0);
      return (sub + crack) * env;
    }
  },
  {
    id: 'ambience-gentle-rain-thunder',
    duration: 6.5,
    gen: (t, dur) => {
      const rain = (Math.random() * 2 - 1) * 0.2;
      const thunder = (t > 2.0 && t < 4.8) ? Math.sin(2 * Math.PI * 45 * t) * Math.sin(((t - 2.0) / 2.8) * Math.PI) * 0.4 : 0;
      return rain + thunder;
    }
  },
  {
    id: 'foley-wood-door-creak',
    duration: 3.5,
    gen: (t, dur) => {
      const p = t / dur;
      const creakFreq = 320 + Math.sin(t * 35) * 80;
      const jitter = Math.sin(2 * Math.PI * creakFreq * t) * 0.4 * Math.sin(p * Math.PI);
      const rub = (Math.random() * 2 - 1) * 0.1 * Math.sin(p * Math.PI);
      return jitter + rub;
    }
  },
  {
    id: 'musical-cinematic-brass-stinger',
    duration: 3.8,
    gen: (t, dur) => {
      const env = Math.sin(Math.min(1, t * 8) * Math.PI * 0.5) * Math.exp(-t * 0.7);
      const f1 = 130.81; // C3
      const f2 = 196.00; // G3
      const f3 = 261.63; // C4
      const brass = Math.sin(2 * Math.PI * f1 * t) * 0.4 + Math.sin(2 * Math.PI * f2 * t) * 0.3 + Math.sin(2 * Math.PI * f3 * t) * 0.2;
      return brass * env;
    }
  },
  {
    id: 'genre-sci-fi-glitch',
    duration: 2.8,
    gen: (t) => {
      const step = Math.floor(t * 16);
      const f = 400 + (step % 5) * 350;
      const noise = (Math.random() * 2 - 1) * ((step % 3 === 0) ? 0.4 : 0.05);
      return (Math.sin(2 * Math.PI * f * t) * 0.4 + noise) * 0.7;
    }
  }
];

console.log(`Generating ${soundGenerators.length} authentic sound effects in ${outputDir}...`);

soundGenerators.forEach((item) => {
  const filePath = path.join(outputDir, `${item.id}.wav`);
  const buf = createWavBuffer(sampleRate, item.duration, item.gen);
  fs.writeFileSync(filePath, buf);
  console.log(`✓ Generated ${item.id}.wav (${buf.length} bytes, ${item.duration}s)`);
});

console.log('All sound effects generated successfully!');
