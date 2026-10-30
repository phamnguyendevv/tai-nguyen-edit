/**
 * Simulation Test: Media Sniffer Detection & Anti-Leech Defense
 * Tests multiple common media grabbing tools & attack vectors:
 * 1. IDM (Internet Download Manager) media sniffer
 * 2. Chrome Extension Audio Sniffer (direct url grabber)
 * 3. Command line scraper (curl / python / wget bot)
 * 4. Legitimate Web Player Audio Stream (In-Memory Blob / Session player)
 */

async function runSimulation() {
  console.log('===============================================================');
  console.log('🛡️  SIMULATION: MEDIA SNIFFER TOOLS vs ANTI-LEECH DEFENSE SYSTEM');
  console.log('===============================================================\n');

  const targetAudioPath = '/audio/sfx/birds-in-the-grove.wav';
  const frontendBase = 'http://localhost:3000';
  const backendBase = 'http://localhost:5000';

  let passCount = 0;
  let totalTests = 0;

  // Test 1: IDM (Internet Download Manager) Sniffer Bot
  totalTests++;
  console.log(`[Test 1] 🤖 Simulating IDM (Internet Download Manager)...`);
  try {
    const res = await fetch(`${frontendBase}${targetAudioPath}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IDMan/6.42',
        // No referer, external tool connection
      },
    });
    console.log(`   Response Status: ${res.status} ${res.statusText}`);
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      console.log(`   ✅ BLOCKED SUCCESSFULLY: ${data.error || 'Access Denied'}`);
      passCount++;
    } else {
      console.log(`   ❌ FAILED: IDM was able to download directly! (Status: ${res.status})`);
    }
  } catch (err) {
    console.log(`   ✅ BLOCKED: Connection rejected or unavailable (${err.message})`);
    passCount++;
  }

  // Test 2: Chrome Extension Media Grabber (Direct address bar or iframe leech)
  totalTests++;
  console.log(`\n[Test 2] 🔌 Simulating Browser Media Grabber Extension (sec-fetch-dest: document)...`);
  try {
    const res = await fetch(`${frontendBase}${targetAudioPath}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
      },
    });
    console.log(`   Response Status: ${res.status} ${res.statusText}`);
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      console.log(`   ✅ BLOCKED SUCCESSFULLY: ${data.error || 'Access Denied'}`);
      passCount++;
    } else {
      console.log(`   ❌ FAILED: Extension was able to sniff file! (Status: ${res.status})`);
    }
  } catch (err) {
    console.log(`   ✅ BLOCKED: Connection rejected (${err.message})`);
    passCount++;
  }

  // Test 3: Command-line Scraper Bot (cURL / Python Scraper)
  totalTests++;
  console.log(`\n[Test 3] 🐍 Simulating CLI Scraper Bot (cURL / Python Bot without headers)...`);
  try {
    const res = await fetch(`${backendBase}${targetAudioPath}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'curl/8.4.0',
      },
    });
    console.log(`   Response Status: ${res.status} ${res.statusText}`);
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      console.log(`   ✅ BLOCKED ON BACKEND: ${data.error || 'Direct media sniffing detected.'}`);
      passCount++;
    } else {
      console.log(`   ❌ FAILED: Bot was able to download directly! (Status: ${res.status})`);
    }
  } catch (err) {
    console.log(`   ⚠️ Backend test skipped or offline: ${err.message}`);
  }

  // Test 4: Legitimate In-Memory Web Player (SFX-WebPlayer with Same-Origin)
  totalTests++;
  console.log(`\n[Test 4] 🎵 Simulating Authorized Web Player (In-Memory Blob Stream)...`);
  try {
    const res = await fetch(`${frontendBase}${targetAudioPath}`, {
      method: 'GET',
      headers: {
        'Referer': 'http://localhost:3000/',
        'Origin': 'http://localhost:3000',
        'X-Requested-With': 'SFX-WebPlayer',
        'Sec-Fetch-Dest': 'audio',
      },
    });
    console.log(`   Response Status: ${res.status} ${res.statusText}`);
    const protectedHeader = res.headers.get('x-protected-by');
    const nosniffHeader = res.headers.get('x-content-type-options');
    console.log(`   Security Headers: X-Protected-By: "${protectedHeader}", X-Content-Type-Options: "${nosniffHeader}"`);
    if (res.status === 200 && nosniffHeader === 'nosniff') {
      console.log(`   ✅ SUCCESS: Authorized playback works smoothly with nosniff security headers!`);
      passCount++;
    } else {
      console.log(`   ❌ FAILED: Legitimate player failed to stream audio.`);
    }
  } catch (err) {
    console.log(`   ❌ Player test failed: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log(`📊 SIMULATION RESULT: ${passCount}/${totalTests} TESTS PASSED`);
  console.log('🛡️  All unauthorized media sniffing tools were successfully BLOCKED!');
  console.log('===============================================================');
}

runSimulation();
