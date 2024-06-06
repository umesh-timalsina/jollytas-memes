// generate-image-list.js
import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';

const imageDir = path.join('jollyta/memes');
const outputFile = path.join('src/lib/memeList.json');
const isGHActions = process.env.GITHUB_ACTIONS === 'true';

const images = fs.readdirSync(imageDir).map((file) => {
	const filePath = path.join(imageDir, file);
	const dimensions = sizeOf(filePath);
	return {
		src: `jollyta/memes/${file}`,
		width: dimensions.width,
		height: dimensions.height
	};
});

fs.writeFileSync(outputFile, JSON.stringify(images, null, 2));

console.log('Image list with dimensions generated');
