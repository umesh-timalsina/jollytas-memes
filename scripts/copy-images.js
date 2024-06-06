// copy-images.mjs
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the source and destination directories
const sourceDir = path.join(__dirname, '..', 'public', 'memes');
const destDir = path.join(__dirname, '..', 'build', 'public', 'memes');

// Ensure the destination directory exists
fs.ensureDirSync(destDir);

// Copy the images from source to destination
fs.copySync(sourceDir, destDir);

console.log('Images copied successfully!');
