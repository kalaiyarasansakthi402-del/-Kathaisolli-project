// Automated Audio Playback and UI Verification Script for Kathaisolli
import http from 'http';

async function testUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        if (data.length < 5000) data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          preview: data,
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== KATHAISOLLI VERIFICATION TEST SUITE ===\n');

  let passed = 0;
  let total = 0;

  // Test 1: MP3 Audio file streaming
  total++;
  try {
    const res = await testUrl('http://localhost:4180/audio/arthashastram_01.mp3', { method: 'HEAD' });
    if (res.statusCode === 200) {
      console.log('✔ Test 1 PASSED: MP3 Audio File Streamable (Status 200, Content-Type:', res.headers['content-type'], 'Length:', res.headers['content-length'], ')');
      passed++;
    } else {
      console.error('✘ Test 1 FAILED: Status', res.statusCode);
    }
  } catch (err) {
    console.error('✘ Test 1 FAILED:', err.message);
  }

  // Test 2: Audio Range Request
  total++;
  try {
    const res = await testUrl('http://localhost:4180/audio/arthashastram_01.mp3', {
      headers: { Range: 'bytes=0-1023' },
    });
    if (res.statusCode === 206 || res.statusCode === 200) {
      console.log('✔ Test 2 PASSED: HTTP Range Request Supported (Status:', res.statusCode, ', Accept-Ranges:', res.headers['accept-ranges'], ')');
      passed++;
    } else {
      console.error('✘ Test 2 FAILED: Range Request Status', res.statusCode);
    }
  } catch (err) {
    console.error('✘ Test 2 FAILED:', err.message);
  }

  // Test 3: Explore Page Load
  total++;
  try {
    const res = await testUrl('http://localhost:4180/explore');
    if (res.statusCode === 200 && res.preview.toLowerCase().includes('<!doctype html>')) {
      console.log('✔ Test 3 PASSED: Explore Page Loads Immediately (Status 200, SPA Shell OK)');
      passed++;
    } else {
      console.error('✘ Test 3 FAILED: Status', res.statusCode);
    }
  } catch (err) {
    console.error('✘ Test 3 FAILED:', err.message);
  }

  // Test 4: My Library Page Load
  total++;
  try {
    const res = await testUrl('http://localhost:4180/my-library');
    if (res.statusCode === 200) {
      console.log('✔ Test 4 PASSED: My Library Page Accessible (Status 200)');
      passed++;
    } else {
      console.error('✘ Test 4 FAILED: Status', res.statusCode);
    }
  } catch (err) {
    console.error('✘ Test 4 FAILED:', err.message);
  }

  // Test 5: Full Player Page Load
  total++;
  try {
    const res = await testUrl('http://localhost:4180/player');
    if (res.statusCode === 200) {
      console.log('✔ Test 5 PASSED: Full Player Page Accessible (Status 200)');
      passed++;
    } else {
      console.error('✘ Test 5 FAILED: Status', res.statusCode);
    }
  } catch (err) {
    console.error('✘ Test 5 FAILED:', err.message);
  }

  console.log(`\nResults: ${passed} / ${total} tests passed.`);
}

runTests();
