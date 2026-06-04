const fs = require('fs');
let c = fs.readFileSync('D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts', 'utf8');

// Print the last part of the file around the error
const idx = c.indexOf(':3f}');
if (idx > 0) {
  console.log('Found :3f} at index', idx);
  console.log('Context:', JSON.stringify(c.substring(idx-5, idx+15)));
}

// Check for the exact pattern
const pattern = ':3f}\")';
const pi = c.indexOf(pattern);
if (pi > 0) {
  console.log('Found pattern at', pi, ':', JSON.stringify(c.substring(pi, pi+15)));
  // Fix it
  c = c.substring(0, pi) + ":3f}')" + c.substring(pi + pattern.length);
  console.log('Fixed!');
  fs.writeFileSync('D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts', c, 'utf8');
} else {
  console.log('Pattern :3f}") not found');
  // Search for what's actually there
  for (let i = 0; i < c.length - 6; i++) {
    if (c.substring(i, i+4) === ':3f}' && c[i+4] === '\\' && c[i+5] === '"') {
      console.log('Alternative pattern found at', i, ':', JSON.stringify(c.substring(i, i+10)));
      c = c.substring(0, i+4) + "'" + c.substring(i+6);
      console.log('Fixed with alt pattern');
      fs.writeFileSync('D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts', c, 'utf8');
    }
  }
}

// Also check for the line 427 issues
const pipeNo = c.indexOf("pipe_no = Pipeline([");
if (pipeNo > 0) {
  console.log('\nLine 427 context:', JSON.stringify(c.substring(pipeNo, pipeNo+60)));
}
