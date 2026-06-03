const fs = require('fs');
const content = fs.readFileSync('D:/Ajay/ai-learning-hub/src/content/phases/phase-16/model-serving.ts', 'utf8');
const lines = content.split('\n');

// Check theory section (lines 15-118, 0-indexed: 14-117)
for (let i = 14; i <= 117; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line.charCodeAt(j) === 96) { // backtick
      let bsCount = 0, inCodeBlock = false;
      for (let k = j - 1; k >= 0 && line.charCodeAt(k) === 92; k--) bsCount++;
      console.log(`Line ${i+1}, pos ${j+1}: ${bsCount} backslashes, context: ${line.substring(0, j+2).replace(/`/g,'BT').replace(/\\/g,'BS')}`);
    }
  }
}
