const fs = require('fs');
let c = fs.readFileSync('D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts', 'utf8');

// The pattern in the file is: :3f}\")\", 
// where \" is a literal backslash followed by double-quote
const target = ':3f}\\")';
const idx = c.indexOf(target);
console.log('Searching for:', JSON.stringify(target));
console.log('Found at index:', idx);
if (idx >= 0) {
  console.log('Context before:', JSON.stringify(c.substring(idx-5, idx+10)));
  // Replace :3f}\") with :3f}')
  c = c.substring(0, idx) + ':3f}\')' + c.substring(idx + target.length);
  console.log('Context after:', JSON.stringify(c.substring(idx-5, idx+10)));
  fs.writeFileSync('D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts', c, 'utf8');
  console.log('Fixed!');
} else {
  console.log('Not found. Checking nearby...');
  for (let i = 0; i < c.length - 6; i++) {
    const chunk = c.substring(i, i+6);
    if (chunk.includes(':3f')) {
      console.log('Nearby:', JSON.stringify(c.substring(i-5, i+15)));
    }
  }
}
