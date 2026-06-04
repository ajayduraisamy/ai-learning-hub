const fs = require('fs');
const path = 'D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts';
let c = fs.readFileSync(path, 'utf8');

// Fix the remaining line 206 issue with the print f-string
// Current: ...{np.corrcoef(df['zip_encoded'], df['target'])[0,1]:.3f}')
// Should be: ...{np.corrcoef(df[\\"zip_encoded\\"], df[\\"target\\"])[0,1]:.3f}')
// But actually in the JSON string, \" represents a regular " character
// So we need: df["zip_encoded"] and df["target"]

// The exact text in the file is:
// df['zip_encoded']], df['target']
// And the f-string ends with: }')

c = c.replace(
  "df['zip_encoded']], df['target']",
  'df[\\"zip_encoded\\"], df[\\"target\\"]'
);

// Also fix the extra ] after target that was already there
// (the ]] in df['target']] was already handled by the replacement above)

// Fix line 427: handle ''model'' -> 'model' and f-string quotes
c = c.replace("(''model'',", "('model',");
c = c.replace("(''scaler'',", "('scaler',");

// Fix f-strings that start with " but end with '
c = c.replace(
  'print(f"No scaling: {cross_val_score(pipe_no, X, y, cv=5).mean():.3f}\')',
  "print(f'No scaling: {cross_val_score(pipe_no, X, y, cv=5).mean():.3f}')"
);
c = c.replace(
  'print(f"With scaling: {cross_val_score(pipe_yes, X, y, cv=5).mean():.3f}\')',
  "print(f'With scaling: {cross_val_score(pipe_yes, X, y, cv=5).mean():.3f}')"
);

// Also fix remaining extra '] patterns
c = c.replace("]]", "]");

fs.writeFileSync(path, c, 'utf8');
console.log('Done with v4 fixes');
