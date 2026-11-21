import fs from 'node:fs';
import path from 'node:path';

const catalogFile = fs.readFileSync('apps/web/src/data/libraryCatalog.ts', 'utf8');
const slugMatches = [...catalogFile.matchAll(/slug:\s*["']([^"']+)["'][\s\S]*?category:\s*["']([^"']+)["']/g)];

console.log('Found', slugMatches.length, 'books in catalog.');

const coversDir = path.join('apps/web/public/images/covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

const imagesDir = path.join('apps/web/public/images');

const categoryMap = {
  'Motivation': 'story-motivational.jpg',
  'Self Help': 'story-motivational.jpg',
  'History': 'story-historical.jpg',
  'Biography': 'story-historical.jpg',
  'Mythology': 'krishna.jpg',
  'Literature': 'story-tamil-folk.jpg',
  'Tamil': 'story-tamil-folk.jpg',
  'English': 'story-books-stack.jpg',
  'General': 'story-books-stack.jpg',
  'All': 'hero-art.jpg',
};

let count = 0;
for (const match of slugMatches) {
  const slug = match[1];
  const cat = match[2];
  const targetImg = categoryMap[cat] || 'story-books-stack.jpg';
  const srcPath = path.join(imagesDir, targetImg);
  const destPath = path.join(coversDir, slug + '.jpg');
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    count++;
  }
}
console.log('Successfully created', count, 'cover images in', coversDir);
