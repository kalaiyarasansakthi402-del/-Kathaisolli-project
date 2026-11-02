const fs = require('fs');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

const webNodeModules = path.join(__dirname, '..', 'apps', 'web', 'node_modules');
const { initializeApp } = require(path.join(webNodeModules, 'firebase', 'app'));
const { getStorage, ref, uploadBytes, getDownloadURL } = require(path.join(webNodeModules, 'firebase', 'storage'));

const firebaseConfig = {
  projectId: 'vaagai-audio-books-36a4e',
  storageBucket: 'vaagai-audio-books-36a4e.appspot.com'
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app, 'gs://vaagai-audio-books-36a4e.appspot.com');

async function transcodeAndUpload(folder, tsFileName, mp3FileName) {
  const sourceUrl = `https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/${encodeURIComponent(folder + '/' + tsFileName)}?alt=media`;
  const localTs = path.join(__dirname, '..', 'apps', 'web', 'public', 'audio', `${folder.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${tsFileName}`);
  const localMp3 = path.join(__dirname, '..', 'apps', 'web', 'public', 'audio', `${folder.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${mp3FileName}`);

  console.log(`Downloading ${folder}/${tsFileName} from Firebase Storage...`);
  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localTs);
    https.get(sourceUrl, resp => {
      resp.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });

  console.log(`Downloaded ${localTs} (${fs.statSync(localTs).size} bytes). Converting to MP3 with FFmpeg...`);
  const ffmpegPath = path.join(__dirname, '..', 'node_modules', '.pnpm', '@ffmpeg-installer+ffmpeg@1.1.0', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
  execSync(`"${ffmpegPath}" -y -i "${localTs}" -vn -acodec libmp3lame -b:a 128k -ar 44100 "${localMp3}"`);

  console.log(`Converted ${localMp3} (${fs.statSync(localMp3).size} bytes). Uploading to Firebase Storage at ${folder}/${mp3FileName}...`);
  const fileBuf = fs.readFileSync(localMp3);
  const destRef = ref(storage, `${folder}/${mp3FileName}`);
  await uploadBytes(destRef, fileBuf, {
    contentType: 'audio/mpeg',
    customMetadata: {
      originalSource: `${folder}/${tsFileName}`,
      transcoder: 'FFmpeg libmp3lame 128kbps stereo 44100Hz'
    }
  });

  const downloadUrl = await getDownloadURL(destRef);
  console.log(`UPLOAD SUCCESS: ${folder}/${mp3FileName} -> ${downloadUrl}`);
  return downloadUrl;
}

async function main() {
  await transcodeAndUpload('Arthashastram', '02.ts', '02.mp3');
}

main().catch(console.error);
