const fs = require('fs');
const path = 'D:/Ajay/ai-learning-hub/src/content/phases/phase-16/model-serving.ts';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix line 49 (index 48): \\```python -> \```python
lines[48] = lines[48].replace(/\\\\`\\\\`\\\\`python/g, '\\`\\`\\`python');

// Fix line 72 (index 71): \\``` -> \```
lines[71] = lines[71].replace(/\\\\`\\\\`\\\\`/g, '\\`\\`\\`');

// Fix line 69: check content
if (lines[68]) console.log('Line 69 before:', JSON.stringify(lines[68]));
if (lines[68]) lines[68] = lines[68].replace(/\\\\`\\\\`python/g, '\\`\\`python');

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed model-serving.ts');
