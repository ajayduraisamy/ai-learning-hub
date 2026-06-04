const fs = require('fs');
const path = 'D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts';
let content = fs.readFileSync(path, 'utf8');
const original = content;

// Check what \" patterns exist
const backslashQuoteMatches = content.match(/\\"/g);
console.log('Total \\" instances: ' + (backslashQuoteMatches ? backslashQuoteMatches.length : 0));

// Show context of each \" occurrence
let idx = -1;
let occurrences = [];
while ((idx = content.indexOf('\\"', idx + 1)) !== -1) {
  const start = Math.max(0, idx - 30);
  const end = Math.min(content.length, idx + 30);
  occurrences.push(content.substring(start, end));
}
occurrences.forEach((o, i) => console.log((i+1) + ': ...' + o + '...'));

// Fix 1: Replace all '''' with ' (quadruple single quotes -> single quotes)
content = content.replace(/''''/g, "'");
const fix1Count = (original.match(/''''/g) || []).length;
console.log('\nFix 1: Replaced ' + fix1Count + ' instances of \'\'\'\' with \'');

// Fix 2: Identify and fix \" that should be '
// After fix 1, patterns like 'count\"' need to become 'count'
// Since this file is a JSON-like TS object, \" inside "..." strings is an escaped double quote
// But in this corrupted file, these should be single quotes

// Approach: Replace \" that appears between what should be single quotes
// Context: after fix 1, we have patterns like ['count\"'] which should be ['count']
// Also: f'{col}_sin\"' should be f'{col}_sin'
// Also: [\"model\" etc.

content = content.replace(/\\"/g, "'");
console.log('Fix 2: Replaced ' + (backslashQuoteMatches ? backslashQuoteMatches.length : 0) + ' instances of \\" with \'');

// Fix 3: Fix Python f-strings with double quotes inside JSON string values
// The affected patterns are print(f"text {expr}") where " causes issues

// Replace f" with f' in code contexts (where the string is inside a JSON "value")
// We need to be careful: only target f" patterns that cause the outer string to break
// These always appear as: print(f"TEXT {EXPR}") or similar

// Generic fix: find f"TEXT" patterns and change to f'TEXT'
// The TEXT must not contain single quotes
// Use a regex that matches f"..." where ... doesn't contain unbalanced quotes

// Strategy: replace print(f" with print(f' and then find the matching closing ")
// This is tricky in a single pass. Let me be more surgical.

// Specific fixes for known problematic f-strings
const fstringFixes = [
  // Line 94
  ['print(f"Features generated: {preprocessor.fit_transform(df).shape[1]}")', "print(f'Features generated: {preprocessor.fit_transform(df).shape[1]}')"],
  ['print(f"CV R2 scores: {np.round(scores, 3)}")', "print(f'CV R2 scores: {np.round(scores, 3)}')"],
  ['print(f"Mean R2: {scores.mean():.3f} +/- {scores.std():.3f}")', "print(f'Mean R2: {scores.mean():.3f} +/- {scores.std():.3f}')"],
  // Line 206 - after fix 1 and 2, the code should have single quotes working
  ['print(f"Correlation with target: {np.corrcoef(df[', "print(f'Correlation with target: {np.corrcoef(df["],
  // Line 316
  ['print(f"R2 score: {pipeline.score(X_test, y_test):.3f}")', "print(f'R2 score: {pipeline.score(X_test, y_test):.3f}')"],
  // Line 427
  ['print(f"No scaling: {cross_val_score(pipe_no, X, y, cv=5).mean():.3f}\")', "print(f'No scaling: {cross_val_score(pipe_no, X, y, cv=5).mean():.3f}\")"],
  ['print(f"With scaling: {cross_val_score(pipe_yes, X, y, cv=5).mean():.3f}\")', "print(f'With scaling: {cross_val_score(pipe_yes, X, y, cv=5).mean():.3f}\")"],
  // Also handle the remaining print(f" patterns that don't have a specific closure
];

for (const [from, to] of fstringFixes) {
  const count = content.split(from).length - 1;
  if (count > 0) {
    content = content.split(from).join(to);
    console.log('Fix 3: Replaced ' + count + ' instance(s) of f-string pattern');
  }
}

// Fix 4: Handle any remaining f" patterns using a more general approach
// Look for \nprint(f" and \nprint(f' patterns
// Actually, after the specific fixes, let me check for f" followed by ) that would indicate a truncated f-string

if (content.includes('f"')) {
  console.log('\nWARNING: Remaining f" patterns:');
  let ci = -1;
  while ((ci = content.indexOf('f"', ci + 1)) !== -1) {
    console.log('  at position ' + ci + ': ...' + content.substring(Math.max(0, ci - 20), ci + 40) + '...');
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('\nDone fixing phase5-7.ts');
