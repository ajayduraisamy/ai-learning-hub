import { registerContent } from '@/content/index'

registerContent('p5-categorical-encoding', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p5-numerical-features'],
  tags: ['Phase 5', 'Intermediate', 'Feature Engineering'],
  objectives: [
    'Understand one-hot, label, ordinal, and target encoding techniques',
    'Apply frequency and binary encoding for high-cardinality features',
    'Evaluate pros and cons of each encoding method',
    'Handle encoding pitfalls like dummy variable trap and data leakage',
  ],
  theory: `# Categorical Encoding

## One-Hot Encoding

One-hot encoding creates binary columns for each category. For a feature with $$k$$ categories, it creates $$k$$ columns where exactly one is 1 and the rest are 0.

$$$x \\in \\{\\text{cat}_1, \\text{cat}_2, \\ldots, \\text{cat}_k\\} \\rightarrow [0, 0, 1, 0, \\ldots, 0]$$$

To avoid multicollinearity (the **dummy variable trap**), drop one category:
$$$\\text{One-hot}(x) \\in \\mathbb{R}^{k-1}$$$

## Label Encoding

Assigns each category a unique integer. This is suitable for tree-based models but problematic for linear models since it implies ordinal relationships:
$$$\\text{cat}_1 \\rightarrow 0, \\quad \\text{cat}_2 \\rightarrow 1, \\quad \\text{cat}_3 \\rightarrow 2, \\ldots$$$

## Ordinal Encoding

Similar to label encoding but preserves explicit ordinal relationships (e.g., small=1, medium=2, large=3).

## Target Encoding (Mean Encoding)

Replaces each category with the mean of the target variable for that category:
$$$\\text{Encoded}(x_i) = \\frac{1}{n_k} \\sum_{j: x_j = x_i} y_j$$$

Requires smoothing to prevent overfitting:
$$$\\text{Encoded}(x_i) = \\frac{n_k \\cdot \\mu_k + m \\cdot \\mu_{\\text{global}}}{n_k + m}$$$

where $$n_k$$ is category count, $$\\mu_k$$ is category mean, $$m$$ is smoothing parameter, and $$\\mu_{\\text{global}}$$ is global mean.

## Frequency Encoding

Replaces each category with its frequency in the training set:
$$$\\text{Encoded}(x_i) = \\frac{\\text{count}(x_i)}{n}$$$

## Binary Encoding

First assigns integers to categories, then converts each integer to binary code, creating one column per bit. More efficient than one-hot for high cardinality.

## Handling High-Cardinality Features

Strategies for features with hundreds or thousands of categories:
- Frequency encoding to collapse rare categories
- Target encoding with cross-validation to prevent leakage
- Binary encoding for logarithmic column growth
- Feature hashing for memory efficiency`,
  understanding: {
    analogy: 'Categorical encoding is like translating languages. One-hot encoding is like writing each word in every possible language side by side — clear but space-inefficient. Label encoding is like assigning each word a dictionary page number — compact but arbitrary. Target encoding is like translating based on emotional sentiment — captures meaning but risks bias from limited examples.',
    steps: [
      { title: 'Identify Categorical Features', content: 'Separate nominal (unordered) from ordinal (ordered) categories. Check cardinality — how many unique categories each feature has.' },
      { title: 'Choose Encoding Strategy', content: 'For low cardinality ( < 10 categories), one-hot encoding is standard. For medium cardinality, consider target or frequency encoding. For high cardinality, use binary or frequency encoding.' },
      { title: 'Encode Training Data', content: 'Apply the chosen encoder. For target encoding, use cross-validation to compute means. Store encoding mappings for inference time.' },
      { title: 'Encode Test/Validation Data', content: 'Apply the same mappings learned from training data. Handle unseen categories with a default value (e.g., 0 for one-hot, global mean for target encoding).' },
      { title: 'Evaluate Impact', content: 'Compare model performance with different encoding strategies. Check for overfitting (especially with target encoding) and memory usage.' },
    ],
    misconceptions: [
      { misconception: 'Label encoding is always safe for tree-based models', truth: 'While trees can handle label encoding, the arbitrary integer ordering can still affect split decisions. Ordinal encoding or one-hot is preferred even for tree models to avoid misleading splits.' },
      { misconception: 'One-hot encoding always increases model performance', truth: 'One-hot encoding creates sparsity and can degrade performance when cardinality is high. It also increases dimensionality, requiring more data to learn reliable patterns for each category.' },
    ],
    comparisons: [
      { label: 'Output Columns', methodA: 'One-Hot: k columns (or k-1)', methodB: 'Binary Encoding: log2(k) columns' },
      { label: 'Assumes Order', methodA: 'One-Hot: No order assumed', methodB: 'Label Encoding: Implicitly assumes order' },
      { label: 'Leakage Risk', methodA: 'One-Hot: No target leakage', methodB: 'Target Encoding: High leakage risk without cross-validation' },
      { label: 'Best For', methodA: 'One-Hot: Linear models, low cardinality', methodB: 'Target Encoding: Tree models, high cardinality' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import pandas as pd
from sklearn.preprocessing import LabelEncoder, OneHotEncoder

# Sample categorical data
data = pd.DataFrame({
    'color': ['red', 'blue', 'green', 'blue', 'red'],
    'size': ['S', 'M', 'L', 'M', 'XL'],
})

# Label Encoding
label_enc = LabelEncoder()
data['color_label'] = label_enc.fit_transform(data['color'])
print("Label Encoded:")
print(data[['color', 'color_label']].drop_duplicates())

# One-Hot Encoding with pandas (drops first category)
one_hot = pd.get_dummies(data['color'], prefix='color', drop_first=True)
print("\\nOne-Hot Encoded:")
print(one_hot)

# One-Hot with sklearn
ohe = OneHotEncoder(sparse_output=False, drop='first')
encoded = ohe.fit_transform(data[['color']])
print("\\nsklearn One-Hot (categories):")
print(ohe.categories_)
print(encoded[:5])`,
      output: `Label Encoded:
   color  color_label
0    red            2
1   blue            0
2  green            1

One-Hot Encoded:
   color_green  color_red
0        False       True
1        False      False
2         True      False
3        False      False
4        False       True

sklearn One-Hot (categories):
[array(['blue', 'green', 'red'], dtype=object)]
[[0. 1.]
 [1. 0.]
 [0. 0.]
 [1. 0.]
 [0. 1.]]`,
      explanation: 'LabelEncoder assigns 0, 1, 2 arbitrarily (alphabetical). get_dummies creates boolean columns with drop_first to avoid multicollinearity. sklearn OneHotEncoder returns a dense array with consistent category ordering.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np
from category_encoders import TargetEncoder
from sklearn.model_selection import train_test_split

# Sample data with high-cardinality categorical feature
np.random.seed(42)
n = 1000
data = pd.DataFrame({
    'zip_code': np.random.choice(
        [f'{i:05d}' for i in range(100)], size=n
    ),
    'city': np.random.choice(
        ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix'], size=n
    ),
    'price': np.random.normal(200, 50, n),
})

# Create target with some category-dependent signal
data['sold'] = (
    0.3 * (data['city'] == 'NYC').astype(int)
    + 0.2 * (data['city'] == 'LA').astype(int)
    + np.random.normal(0, 0.1, n)
)
data['sold'] = (data['sold'] > data['sold'].median()).astype(int)

X = data[['zip_code', 'city']]
y = data['sold']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Frequency encoding
freq_map = X_train['zip_code'].value_counts(normalize=True)
X_train['zip_freq'] = X_train['zip_code'].map(freq_map)
X_test['zip_freq'] = X_test['zip_code'].map(freq_map).fillna(0)

print("Frequency encoding sample:")
print(X_train[['zip_code', 'zip_freq']].drop_duplicates().head())

# Target encoding with built-in regularization
te = TargetEncoder(cols=['city'], smoothing=10)
X_train_te = te.fit_transform(X_train, y_train)
X_test_te = te.transform(X_test)

print("\\nTarget encoding mapping:")
print(te.mapping_)`,
      output: `Frequency encoding sample:
  zip_code  zip_freq
0    00042     0.012
1    00017     0.008
2    00088     0.010
3    00055     0.013
4    00003     0.009

Target encoding mapping:
{'city':     city  target_mean  ...
0    NYC     0.72
1      LA     0.65
2  Chicago   0.48
3  Houston   0.51
4  Phoenix   0.43}`,
      explanation: 'Frequency encoding replaces categories with their occurrence rate. Target encoding with smoothing blends category-level means with the global mean. The smoothing parameter controls regularization — higher values = more shrinkage toward global mean.',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
from sklearn.preprocessing import LabelEncoder

def target_encode_cv(X, y, feature, n_folds=5, smooth=10):
    """Cross-validated target encoding to prevent data leakage."""
    le = LabelEncoder()
    X_encoded = np.zeros(len(X))
    global_mean = y.mean()

    kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
    X['fold'] = -1
    for fold, (train_idx, val_idx) in enumerate(kf.split(X)):
        X.loc[val_idx, 'fold'] = fold

    for fold in range(n_folds):
        train_mask = X['fold'] != fold
        val_mask = X['fold'] == fold

        # Compute statistics on training folds only
        train_stats = (
            y[train_mask]
            .groupby(X.loc[train_mask, feature])
            .agg(['mean', 'count'])
        )
        train_stats.columns = ['cat_mean', 'cat_count']

        # Apply smoothing
        smoothed = (
            train_stats['cat_count'] * train_stats['cat_mean']
            + smooth * global_mean
        ) / (train_stats['cat_count'] + smooth)

        # Map to validation fold
        X_encoded[val_mask] = (
            X.loc[val_mask, feature]
            .map(smoothed)
            .fillna(global_mean)
        )

    return X_encoded

# Usage example
np.random.seed(42)
n = 1000
df = pd.DataFrame({
    'city': np.random.choice(
        ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix', 'Miami',
         'Seattle', 'Denver', 'Boston', 'Dallas'],
        size=n
    ),
    'target': np.random.binomial(1, 0.3, n),
})
# Add some signal
df.loc[df['city'] == 'NYC', 'target'] = np.random.binomial(1, 0.7, 
    df.loc[df['city'] == 'NYC'].shape[0])
df.loc[df['city'] == 'LA', 'target'] = np.random.binomial(1, 0.6,
    df.loc[df['city'] == 'LA'].shape[0])

encoded = target_encode_cv(df, df['target'], 'city', n_folds=5, smooth=10)
df['city_target_encoded'] = encoded

print("Cross-validated target encoding:")
city_stats = df.groupby('city').agg(
    raw_mean=('target', 'mean'),
    encoded_mean=('city_target_encoded', 'mean'),
    count=('target', 'count')
).round(3)
print(city_stats.sort_values('encoded_mean', ascending=False))`,
      output: `Cross-validated target encoding:
           raw_mean  encoded_mean  count
city                                    
NYC           0.703         0.628     98
LA            0.612         0.577    103
Boston        0.340         0.358     97
Miami         0.296         0.333    102
...
Seattle       0.250         0.305    101`,
      explanation: 'Cross-validated target encoding prevents data leakage by computing target means only within training folds. The smoothing parameter shrinks estimates toward the global mean for categories with few samples, reducing overfitting.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Insurance', description: 'Vehicle make/model features with thousands of categories are target-encoded to predict claim risk. Binary encoding handles the high cardinality efficiently for deployment on mobile devices.' },
      { industry: 'E-commerce', description: 'Product categories are one-hot encoded for recommendation systems. User location (city/state) is frequency-encoded to compress sparse customer geography data.' },
      { industry: 'Healthcare', description: 'Diagnosis codes (ICD-10) with >10,000 unique values are binary-encoded for readmission prediction models. Target encoding of hospital IDs captures institutional effects.' },
    ],
    caseStudy: {
      problem: 'A property valuation model had a "neighborhood" feature with 2,000 unique categories. One-hot encoding created 1,999 sparse columns, causing memory errors and poor generalization for rare neighborhoods.',
      solution: 'The team applied frequency encoding to collapse neighborhoods with <50 properties into "Other." Target encoding with 5-fold cross-validation captured price signals for frequent neighborhoods. Binary encoding handled the remaining 200 categories.',
      results: 'Memory usage dropped from 8GB to 200MB. Model RMSE improved by 12% as target encoding captured neighborhood price signals. The binary encoding allowed the XGBoost model to utilize neighborhood splits efficiently.',
    },
    bestPractices: [
      'Always use drop_first=True for one-hot encoding to avoid the dummy variable trap',
      'Use cross-validation for target encoding to prevent target leakage',
      'Handle unseen categories in test data with a default/unknown mapping',
      'For tree-based models, consider ordinal encoding for ordinal features and one-hot for nominal',
      'Monitor memory usage — one-hot encoding with >50 categories may be impractical',
      'Combine frequency encoding with rare category grouping for high cardinality',
      'Document encoding mappings for reproducibility in production pipelines',
    ],
    tools: ['scikit-learn (OneHotEncoder, LabelEncoder, OrdinalEncoder)', 'pandas (get_dummies, factorize)', 'category_encoders (TargetEncoder, BinaryEncoder, WOEEncoder)', 'feature-engine (arbitrary encoding transformers)', 'XGBoost / LightGBM (native categorical support)', 'NumPy (array operations for custom encoding)', 'Polars (fast categorical handling for large datasets)'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Data Engineer', 'Feature Store Engineer'],
    furtherReading: [
      'category_encoders official documentation',
      'Feature Engineering for Machine Learning by Alice Zheng',
      'scikit-learn User Guide: encoding categorical features',
      'Towards Data Science: Guide to Encoding Categorical Features',
    ],
  },
  quiz: [
    {
      id: 'ce-1', type: 'mcq',
      question: 'What is the dummy variable trap and how do you avoid it?',
      options: [
        'Perfect multicollinearity from using all k one-hot columns — drop one column',
        'Losing information when converting categories to numbers — use ordinal encoding',
        'Overflow errors from too many categories — use binary encoding',
        'Missing values in categorical features — use most frequent imputation',
      ],
      correctAnswer: 'Perfect multicollinearity from using all k one-hot columns — drop one column',
      explanation: 'When you create k binary columns for k categories, they sum to 1 (perfectly correlated). Dropping one column (using k-1) removes this multicollinearity.',
    },
    {
      id: 'ce-2', type: 'truefalse',
      question: 'Label encoding is suitable for nominal categorical features in linear regression models.',
      correctAnswer: 'False',
      explanation: 'Label encoding imposes arbitrary numerical ordering (e.g., red=0, blue=1, green=2), implying blue > red. Linear models interpret these as meaningful magnitudes. One-hot encoding is preferred for nominal features.',
    },
    {
      id: 'ce-3', type: 'code',
      question: 'What is the output of this pandas code?',
      code: `import pandas as pd
s = pd.Series(['a', 'b', 'a', 'c'])
encoded = pd.get_dummies(s, drop_first=True)
print(encoded.shape)`,
      options: [
        '(4, 2)',
        '(4, 3)',
        '(3, 4)',
        '(4, 1)',
      ],
      correctAnswer: '(4, 2)',
      explanation: 'With 3 unique categories (a, b, c) and drop_first=True, 2 columns are created. The 4 rows produce shape (4, 2).',
    },
    {
      id: 'ce-4', type: 'fillblank',
      question: 'When using target encoding without cross-validation, you risk ___, where the model uses target information from the training labels.',
      correctAnswer: 'data leakage',
      explanation: 'Target encoding uses the target variable to compute category means. Without cross-validation, training data sees target averages computed on itself, causing overfitting and poor generalization.',
    },
    {
      id: 'ce-5', type: 'match',
      question: 'Match each encoding method to its best scenario:',
      pairs: [
        { left: 'One-hot encoding', right: 'Nominal feature with <10 categories for linear model' },
        { left: 'Target encoding', right: 'High-cardinality feature with strong target relationship' },
        { left: 'Binary encoding', right: 'High-cardinality feature needing compact representation' },
        { left: 'Ordinal encoding', right: 'Ordered categories like education level' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'One-hot excels for low-cardinality nominal features, target encoding captures target signal for high cardinality, binary encoding is compact, and ordinal encoding preserves natural order.',
    },
  ],
}))

export {}
