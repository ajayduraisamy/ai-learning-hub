const fs = require('fs');
const path = 'D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts';
let content = fs.readFileSync(path, 'utf8');

// Remaining issues after v1 fixes:

// Line 206: fix 'count'''' -> should be 'count' but after previous fixes it's 'count''''
// Let me fix the remaining issues specifically
const fixes = [
  // Line 206: cat_stats issues - extra ' from the \" -> ' conversion
  // 'count'''' should become 'count'
  ["['count''''']", "['count']"],
  ["['count''''']", "['count']"],  // second occurrence
  
  // 'count''' -> 'count' (for the ones that got partially fixed)
  ["['count''']", "['count']"],
  ["['count''' *", "['count'] *"],
  
  // 'mean''' -> 'mean'
  ["['mean'''']", "['mean']"],
  ["['mean''' +", "['mean'] +"],
  ["['mean'''", "['mean']"],
  
  // 'target''' -> 'target'
  ["['target'''']", "['target']"],
  ["['target''']", "['target']"],
  
  // 'zip_encoded''' -> 'zip_encoded'
  ["['zip_encoded''']", "['zip_encoded']"],
  
  // df['target''']], 'zip' -> df['target']], 'zip'
  ["df['target''']]", "df['target']]"],
  
  // print(f'Correlation...") - mismatched quotes
  ['print(f\'Correlation with target: {np.corrcoef(df[', "print(f'Correlation with target: {np.corrcoef(df["],
  
  // Fix the closing of the f-string
  ["'zip_encoded']], df['target'])[0,1]:.3f}\")", "'zip_encoded']], df['target'])[0,1]:.3f}')"],
  
  // Line 427: ''model'' -> 'model' (double single to single)
  [", (''model'',", ", ('model',"],
  
  // Line 427: print(f"..." should match quotes
  ['print(f"No scaling: {cross_val_score(pipe_no, X, y, cv=5).mean():.3f}\')', "print(f'No scaling: {cross_val_score(pipe_no, X, y, cv=5).mean():.3f}')"],
  ['print(f"With scaling: {cross_val_score(pipe_yes, X, y, cv=5).mean():.3f}\')', "print(f'With scaling: {cross_val_score(pipe_yes, X, y, cv=5).mean():.3f}')"],
  
  // Also fix remaining '' (double single quotes) in a few spots
  ["''model''", "'model'"],
  ["''scaler''", "'scaler'"],
  
  // Remove trailing ''] that shouldn't be there
  ["'']", "']"],
  
  // Line 206: fix )" at end of print statement 
  // Actually let me check the exact print line
];

for (const [from, to] of fixes) {
  let count = 0;
  while (content.includes(from)) {
    content = content.replace(from, to);
    count++;
  }
  if (count > 0) console.log(`Fixed ${count}: ${from.substring(0, 60)}`);
}

fs.writeFileSync(path, content, 'utf8');
console.log('\nDone with v2 fixes');
