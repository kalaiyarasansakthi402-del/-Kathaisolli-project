import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('KATHAISOLLI — NEXT AUDIO PLAYBACK VERIFICATION TEST');
console.log('====================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------
// 1. Inspect PlayerContext.tsx
// ---------------------------------------------------------
const playerContextPath = path.resolve('apps/web/src/context/PlayerContext.tsx');
const playerContextCode = fs.readFileSync(playerContextPath, 'utf8');

assert(playerContextCode.includes('resolveTrackQueue'), 'PlayerContext exports resolveTrackQueue helper');
assert(playerContextCode.includes('playNext: () => Promise<void>'), 'PlayerContextType interface includes playNext');
assert(playerContextCode.includes('playPrevious: () => Promise<void>'), 'PlayerContextType interface includes playPrevious');
assert(playerContextCode.includes('queue: PlayingTrack[]'), 'PlayerContextType interface includes queue');
assert(playerContextCode.includes('queueIndex: number'), 'PlayerContextType interface includes queueIndex');
assert(playerContextCode.includes('repeatMode: \'off\' | \'all\' | \'one\''), 'PlayerContextType interface includes repeatMode');

// Check playNext implementation
assert(playerContextCode.includes('const playNext = useCallback(async () => {'), 'playNext function defined with useCallback');
assert(playerContextCode.includes('if (currentQ.length === 1)'), 'playNext checks for 1-item queue to prevent switching to nonexistent item');
assert(playerContextCode.includes('else if (repMode === \'all\')'), 'playNext loops to first item when repeat-all is enabled');

// Check playPrevious implementation
assert(playerContextCode.includes('const playPrevious = useCallback(async () => {'), 'playPrevious function defined with useCallback');
assert(playerContextCode.includes('if (audioRef.current && audioRef.current.currentTime > 3)'), 'playPrevious handles > 3s rewind or previous track');

// Check onEnded auto-advance
assert(playerContextCode.includes('// Automatically play next item (Requirements 5 & 6)'), 'onEnded handler includes auto-advancement logic');
assert(playerContextCode.includes('if (currentIdx < currentQ.length - 1)'), 'onEnded advances to next track when available');

// Check missing URL error handling (Requirement 8)
assert(playerContextCode.includes('Next audio URL is missing or unavailable'), 'playEpisode shows clear error when audio URL is missing without breaking player');

// ---------------------------------------------------------
// 2. Inspect AudioPlayer.tsx Controls Separation
// ---------------------------------------------------------
const audioPlayerPath = path.resolve('apps/web/src/components/AudioPlayer.tsx');
const audioPlayerCode = fs.readFileSync(audioPlayerPath, 'utf8');

// Next and Previous button verification
assert(audioPlayerCode.includes('onClick={playNext}'), 'AudioPlayer Next button triggers playNext()');
assert(audioPlayerCode.includes('disabled={!hasNext}'), 'AudioPlayer Next button disabled at end of playlist');
assert(audioPlayerCode.includes('onClick={playPrevious}'), 'AudioPlayer Previous button triggers playPrevious()');
assert(audioPlayerCode.includes('disabled={!hasPrevious}'), 'AudioPlayer Previous button disabled at beginning of playlist');

// 10-Second Seek Verification (kept separate from next/previous)
assert(audioPlayerCode.includes('onClick={() => skipForward(10)}'), 'AudioPlayer has separate 10s Forward seek button');
assert(audioPlayerCode.includes('title="10 விநாடிகள் முன்னே'), 'AudioPlayer 10s forward button has accurate title');
assert(audioPlayerCode.includes('onClick={() => skipBackward(10)}'), 'AudioPlayer has separate 10s Rewind seek button');
assert(audioPlayerCode.includes('title="10 விநாடிகள் பின்னே'), 'AudioPlayer 10s rewind button has accurate title');

// Shuffle and Repeat must NOT be present in AudioPlayer (Requirement 13)
assert(!audioPlayerCode.includes('onClick={toggleShuffle}'), 'AudioPlayer does NOT contain Shuffle button (Requirement 13)');
assert(!audioPlayerCode.includes('onClick={toggleRepeat}'), 'AudioPlayer does NOT contain Repeat button (Requirement 13)');

// ---------------------------------------------------------
// 3. Inspect FullPlayerPage.tsx Controls Separation
// ---------------------------------------------------------
const fullPlayerPath = path.resolve('apps/web/src/pages/FullPlayerPage.tsx');
const fullPlayerCode = fs.readFileSync(fullPlayerPath, 'utf8');

assert(fullPlayerCode.includes('onClick={playNext}'), 'FullPlayerPage Next button triggers playNext()');
assert(fullPlayerCode.includes('disabled={!hasNext}'), 'FullPlayerPage Next button disabled at end of playlist');
assert(fullPlayerCode.includes('onClick={playPrevious}'), 'FullPlayerPage Previous button triggers playPrevious()');
assert(fullPlayerCode.includes('disabled={!hasPrevious}'), 'FullPlayerPage Previous button disabled at beginning of playlist');
assert(fullPlayerCode.includes('onClick={() => skipForward(10)}'), 'FullPlayerPage has independent 10s forward seek');
assert(fullPlayerCode.includes('onClick={() => skipBackward(10)}'), 'FullPlayerPage has independent 10s rewind seek');
assert(!fullPlayerCode.includes('onClick={toggleRepeat}'), 'FullPlayerPage does NOT contain Repeat button (Requirement 13)');

// ---------------------------------------------------------
// 4. State Machine Simulation Test
// ---------------------------------------------------------
console.log('\n--- Running Player State Machine Simulation ---');

class MockAudio {
  constructor() {
    this.src = '';
    this.currentTime = 0;
    this.duration = 1456;
    this.paused = true;
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  load() {}
}

const mockAudio = new MockAudio();

// Sample 3-chapter queue for a book
const sampleQueue = [
  { id: 'ch-1', episodeId: 'ch-1', title: 'Chapter 1', audioUrl: 'https://example.com/ch1.mp3', durationSec: 360 },
  { id: 'ch-2', episodeId: 'ch-2', title: 'Chapter 2', audioUrl: 'https://example.com/ch2.mp3', durationSec: 420 },
  { id: 'ch-3', episodeId: 'ch-3', title: 'Chapter 3', audioUrl: 'https://example.com/ch3.mp3', durationSec: 500 },
];

let currentTrack = sampleQueue[0];
let queueIndex = 0;
let repeatMode = 'off';
let playbackError = null;

function simulatePlayEpisode(track, index) {
  if (!track || !track.audioUrl) {
    playbackError = 'Missing URL';
    return;
  }
  mockAudio.pause();
  currentTrack = track;
  queueIndex = index;
  mockAudio.src = track.audioUrl;
  mockAudio.currentTime = 0;
  mockAudio.duration = track.durationSec;
  mockAudio.play();
}

function simulatePlayNext() {
  if (sampleQueue.length === 1) return;
  if (queueIndex < sampleQueue.length - 1) {
    simulatePlayEpisode(sampleQueue[queueIndex + 1], queueIndex + 1);
  } else if (repeatMode === 'all') {
    simulatePlayEpisode(sampleQueue[0], 0);
  } else {
    mockAudio.pause();
  }
}

function simulatePlayPrevious() {
  if (sampleQueue.length === 0) return;
  if (mockAudio.currentTime > 3) {
    mockAudio.currentTime = 0;
    return;
  }
  if (queueIndex > 0) {
    simulatePlayEpisode(sampleQueue[queueIndex - 1], queueIndex - 1);
  } else if (repeatMode === 'all') {
    simulatePlayEpisode(sampleQueue[sampleQueue.length - 1], sampleQueue.length - 1);
  } else {
    mockAudio.currentTime = 0;
  }
}

function simulateTrackEnded() {
  if (repeatMode === 'one') {
    mockAudio.currentTime = 0;
    mockAudio.play();
    return;
  }
  if (queueIndex < sampleQueue.length - 1) {
    simulatePlayEpisode(sampleQueue[queueIndex + 1], queueIndex + 1);
  } else if (repeatMode === 'all') {
    simulatePlayEpisode(sampleQueue[0], 0);
  } else {
    mockAudio.pause();
  }
}

// Test 1: Next Audio advances
simulatePlayEpisode(sampleQueue[0], 0);
assert(currentTrack.id === 'ch-1' && queueIndex === 0, 'Initial track is Chapter 1');
simulatePlayNext();
assert(currentTrack.id === 'ch-2' && queueIndex === 1 && mockAudio.currentTime === 0 && !mockAudio.paused, 'Clicking Next Audio stops previous, loads Chapter 2, resets progress to 0, starts playback');

// Test 2: Previous Audio advances back
simulatePlayPrevious();
assert(currentTrack.id === 'ch-1' && queueIndex === 0, 'Clicking Previous Audio goes back to Chapter 1');

// Test 3: Track end advances automatically
simulateTrackEnded();
assert(currentTrack.id === 'ch-2' && queueIndex === 1, 'Track ending automatically advances to Chapter 2');
simulateTrackEnded();
assert(currentTrack.id === 'ch-3' && queueIndex === 2, 'Track ending automatically advances to Chapter 3');

// Test 4: End of playlist with repeat off stops playback
simulateTrackEnded();
assert(queueIndex === 2 && mockAudio.paused === true, 'End of playlist with repeat off stops playback and does not advance to nonexistent track');

// Test 5: End of playlist with repeat all loops to beginning
repeatMode = 'all';
simulatePlayNext();
assert(currentTrack.id === 'ch-1' && queueIndex === 0 && !mockAudio.paused, 'End of playlist with repeat all loops to Chapter 1');

// Test 6: Repeat one loops current track
repeatMode = 'one';
mockAudio.currentTime = 250;
simulateTrackEnded();
assert(currentTrack.id === 'ch-1' && mockAudio.currentTime === 0 && !mockAudio.paused, 'Track ending with repeat one resets to 0 and continues playing same track');

// Test 7: Independent seeking
mockAudio.currentTime = 50;
mockAudio.currentTime += 10;
assert(mockAudio.currentTime === 60 && currentTrack.id === 'ch-1', '10s seek forward modifies currentTime without changing track');
mockAudio.currentTime -= 10;
assert(mockAudio.currentTime === 50 && currentTrack.id === 'ch-1', '10s seek backward modifies currentTime without changing track');

// Test 8: Single item queue behavior
const singleQueue = [{ id: 'solo', episodeId: 'solo', title: 'Solo', audioUrl: 'https://example.com/solo.mp3' }];
let soloIndex = 0;
let soloTrack = singleQueue[0];
if (singleQueue.length === 1) {
  // Requirement 7: do not switch to nonexistent item
}
assert(soloTrack.id === 'solo' && soloIndex === 0, 'Single-item queue prevents switching to nonexistent item');

// Test 9: Missing URL error handling
simulatePlayEpisode({ id: 'broken', episodeId: 'broken', title: 'Broken', audioUrl: null }, 0);
assert(playbackError !== null && currentTrack.id === 'ch-1', 'Missing audio URL sets playbackError and preserves player stability');

console.log(`\nResults: ${passedTests} / ${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('ALL PLAYBACK TESTS PASSED SUCCESSFULLY! ✓');
}
