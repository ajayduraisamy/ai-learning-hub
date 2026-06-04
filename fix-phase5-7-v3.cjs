const fs = require('fs');
const path = 'D:/Ajay/ai-learning-hub/src/data/content/phase5-7.ts';
let c = fs.readFileSync(path, 'utf8');

// Fix line 206 remaining issues
c = c.split("df['target'''']").join("df['target']");
c = c.split("df['zip_encoded''']").join("df['zip_encoded']");
c = c.split("df['target''']]").join("df['target']]");

// Fix print statement closing
c = c.split(
  "print(f'Correlation with target: {np.corrcoef(df['zip_encoded'''], df['target'''])[0,1]:.3f}\")"
).join(
  "print(f'Correlation with target: {np.corrcoef(df['zip_encoded'], df['target'])[0,1]:.3f}')"
);

// Fix line 427: ''model'' -> 'model'
c = c.split("(''model'',").join("('model',");
c = c.split("(''scaler'',").join("('scaler',");

// Fix f-string quote mismatch on line 427
c = c.split(
  "print(f\"No scaling: {cross_val_score(pipe_no, X, y, cv=5).mean():.3f}')"
).join(
  "print(f'No scaling: {cross_val_score(pipe_no, X, y, cv=5).mean():.3f}')"
);
c = c.split(
  "print(f\"With scaling: {cross_val_score(pipe_yes, X, y, cv=5).mean():.3f}')"
).join(
  "print(f'With scaling: {cross_val_score(pipe_yes, X, y, cv=5).mean():.3f}')"
);

// Also fix any remaining '' in the line 206 code
// 'zip_encoded'' -> 'zip_encoded'
c = c.split("['zip_encoded''").join("['zip_encoded'");
c = c.split("['target''").join("['target'");
c = c.split("zip_encoded''").join("zip_encoded'");
c = c.split("target''").join("target'");

fs.writeFileSync(path, c, 'utf8');
console.log('Done with v3 fixes');
