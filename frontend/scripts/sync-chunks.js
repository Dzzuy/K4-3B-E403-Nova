const fs = require('fs');
const path = require('path');

const chunksDir = path.resolve(__dirname, '../.next/server/chunks');
const serverDir = path.resolve(__dirname, '../.next/server');

if (fs.existsSync(chunksDir)) {
  const files = fs.readdirSync(chunksDir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const src = path.join(chunksDir, file);
      const dest = path.join(serverDir, file);
      try {
        fs.copyFileSync(src, dest);
      } catch (e) {
        console.warn(`Could not sync chunk ${file}:`, e.message);
      }
    }
  }
}
