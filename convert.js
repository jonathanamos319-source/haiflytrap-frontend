import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const convertToWebp = async (inputFile, outputFile) => {
  try {
    await sharp(inputFile)
      .webp({ quality: 80 })
      .toFile(outputFile);
    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error(`Error converting ${inputFile}:`, error);
  }
};

const main = async () => {
  const logoIn = path.join(process.cwd(), 'public', 'products', 'HAIFLYLOGO.png');
  const logoOut = path.join(process.cwd(), 'public', 'products', 'HAIFLYLOGO.webp');
  
  const bgIn = path.join(process.cwd(), 'public', 'mobile responsive bg.png');
  const bgOut = path.join(process.cwd(), 'public', 'mobile responsive bg.webp');

  await convertToWebp(logoIn, logoOut);
  await convertToWebp(bgIn, bgOut);
};

main();
