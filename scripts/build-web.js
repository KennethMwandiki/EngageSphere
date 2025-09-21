const fs = require('fs');
const path = require('path');

const filesToCopy = [
  'frontend-prototype.html',
  'styles.css'
];

const outDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

filesToCopy.forEach((f) => {
  const src = path.join(__dirname, '..', f);
  const dest = path.join(outDir, path.basename(f));
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} -> ${dest}`);
  } else {
    console.log(`Skipping missing file: ${src}`);
  }
});

console.log('Build finished.');
