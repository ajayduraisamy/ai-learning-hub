const fs = require('fs');
let c = fs.readFileSync('D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts', 'utf8');

// Fix the specific pattern: [...:3f}\")",...] -> [...:3f}')",...]
const target = String.raw`]:.3f}\")\","`;
const replace = String.raw`]:.3f}')\","`;
console.log('Looking for:', JSON.stringify(target));
const idx = c.indexOf(target);
if (idx >= 0) {
  c = c.substring(0, idx) + replace + c.substring(idx + target.length);
  fs.writeFileSync('D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts', c, 'utf8');
  console.log('Fixed pattern at index', idx);
} else {
  console.log('Pattern not found directly, checking alternatives');
  // Try without the comma at the end
  const altTarget = String.raw`]:.3f}\")"`;
  const idx2 = c.indexOf(altTarget);
  if (idx2 >= 0) {
    console.log('Found alt pattern at', idx2);
    console.log('Context:', JSON.stringify(c.substring(idx2 - 5, idx2 + 10)));
  }
}

// Also read the end of the line to verify
let lines = c.split('\n');
console.log('Line 206 end:', JSON.stringify(lines[205].substring(lines[205].length - 30)));
