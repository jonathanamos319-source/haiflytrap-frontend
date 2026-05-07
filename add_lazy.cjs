const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx', { cwd: __dirname });

let changed = 0;

for (const file of files) {
  const filePath = __dirname + '/' + file;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('<img ') && !content.includes('loading="lazy"')) {
    // Only replace if it doesn't already have loading="lazy" and isn't the hero image
    content = content.replace(/<img(?!([^>]*?id="product-detail-hero-image"|[^>]*?id="hero-image"))([^>]*?)>/g, (match, p1, p2) => {
      if (match.includes('loading=')) return match; // skip if it already has loading attr
      return `<img loading="lazy"${p2}>`;
    });
    fs.writeFileSync(filePath, content);
    changed++;
  }
}

console.log(`Updated ${changed} files with loading="lazy"`);
