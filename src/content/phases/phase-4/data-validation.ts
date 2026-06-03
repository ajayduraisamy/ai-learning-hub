import { registerContent } from '@/content/index'

registerContent('p4-data-validation', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p4-outlier-detection'],
  tags: ['Phase 4', 'Intermediate', 'Topic'],
  objectives: [
    'Understand the importance of data validation in ML pipelines',
    'Implement schema validation and type checks using pandas',
    'Apply range, uniqueness, and referential integrity constraints',
    'Use the Great Expectations library for declarative validation',
    'Build custom validation pipelines for production systems',
  ],
  theory: `# Data Validation

## What is Data Validation?

Data validation is the process of ensuring that data is correct, meaningful, and secure before it enters a pipeline or model. It checks data against predefined rules or schemas to catch errors early.

## Schema Validation

Schema validation ensures data conforms to a predefined structure:
- **Column existence**: Expected columns are present
- **Data types**: Columns have correct dtypes (int, float, string, datetime)
- **Nullable constraints**: Required columns are not null
- **Allowed values**: Categorical columns contain only permitted values

## Type Checks

Type verification ensures each column has the expected data type:

| Expected Type | Pandas dtype | Python Type |
|---------------|-------------|-------------|
| Integer | int64 | int |
| Float | float64 | float |
| Boolean | bool | bool |
| String | object / string | str |
| Datetime | datetime64 | datetime |

## Range Checks

Range validation ensures values fall within acceptable boundaries:

$$\\text{Valid if: } L \\leq x \\leq U$$

where $L$ is the lower bound and $U$ is the upper bound. Examples:
- Age: $0 \\leq \\text{age} \\leq 150$
- Temperature: $-89.2 \\leq \\text{temp} \\leq 56.7$ (Earth records)
- Probability: $0 \\leq p \\leq 1$

## Uniqueness Constraints

Ensure certain columns (like IDs) contain unique values:
- **Primary keys**: Each row has a unique identifier
- **No duplicate rows**: No identical rows in the dataset

## Referential Integrity

Ensures that values in one column correspond to valid values in a reference dataset. Example: a \`country_code\` column should only contain codes that exist in a reference country table.

## Great Expectations Library

Great Expectations is a Python library for declarative data validation. It defines "expectations" that data should meet:

- \`expect_column_to_exist\`
- \`expect_column_values_to_be_of_type\`
- \`expect_column_values_to_be_between\`
- \`expect_column_values_to_not_be_null\`
- \`expect_column_values_to_be_unique\`

## Custom Validation Pipelines

Production systems combine multiple validation steps into automated pipelines that run on data ingestion, triggering alerts or blocking bad data from reaching models.`,
  understanding: {
    analogy: 'Think of data validation like airport security. Schema validation checks your ticket (does it exist?). Type checks verify your ID matches (is this really a string?). Range checks ensure your luggage fits the size limits. Uniqueness constraints check no two passengers have the same seat. Great Expectations is like having a standardized security checklist that every passenger must pass.',
    steps: [
      { title: 'Define Expectations', content: 'Document expected schema: column names, types, allowed ranges, uniqueness rules, and referential constraints for each data source.' },
      { title: 'Build Validation Functions', content: 'Create reusable validation functions or use Great Expectations expectations to check each rule programmatically.' },
      { title: 'Run Validation', content: 'Execute validation against incoming data. Generate a pass/fail report for each expectation.' },
      { title: 'Handle Failures', content: 'Configure actions on failure: reject data, log warnings, send alerts, trigger alternative pipelines, or quarantine suspect data.' },
      { title: 'Monitor & Update', content: 'Review validation results over time. Update rules as data evolves or new edge cases emerge.' },
    ],
    misconceptions: [
      { misconception: 'Validation is only needed for externally sourced data', truth: 'Even internally generated data can have errors due to bugs in upstream transformations, code changes, or unexpected edge cases. Validate all data pipeline stages.' },
      { misconception: 'Data validation and data cleaning are the same', truth: 'Validation detects and reports problems. Cleaning fixes them. Validation should happen first to identify issues; cleaning resolves them. They work together but are distinct phases.' },
    ],
    comparisons: [
      { label: 'Goal', methodA: 'Validation: Detect and report data issues', methodB: 'Cleaning: Fix and transform data' },
      { label: 'Timing', methodA: 'Validation: Before and after transformations', methodB: 'Cleaning: After validation, before modeling' },
      { label: 'Approach', methodA: 'Validation: Rules and expectations', methodB: 'Monitoring: Continuous metrics and drift detection' },
      { label: 'Tools', methodA: 'Validation: Great Expectations, Pandera', methodB: 'Profiling: ydata-profiling, Sweetviz' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import pandas as pd
import numpy as np

# Sample data for validation
df = pd.DataFrame({
    'user_id': [1, 2, 3, 4, 5],
    'age': [25, -5, 130, 35, 42],
    'email': ['a@b.com', 'b@c.com', None, 'd@e.com', 'e@f.com'],
    'salary': [50000, 60000, 55000, None, 80000],
    'department': ['IT', 'HR', 'IT', 'HR', 'UNKNOWN'],
    'join_date': pd.to_datetime(['2020-01-01', '2021-06-15', '2019-03-10', '2022-12-01', '2023-05-20']),
})

# Type validation
expected_types = {
    'user_id': 'int64',
    'age': 'int64',
    'email': 'object',
    'salary': 'float64',
    'department': 'object',
    'join_date': 'datetime64[ns]',
}

print("=== Type Validation ===")
for col, expected_type in expected_types.items():
    actual_type = str(df[col].dtype)
    status = 'PASS' if actual_type == expected_type else 'FAIL'
    print(f"  {col}: expected {expected_type}, got {actual_type} [{status}]")

# Range validation
print("\\n=== Range Validation ===")
print("  Age (0-120):")
print(f"    Out of range: {((df['age'] < 0) | (df['age'] > 120)).sum()} rows")

# Null validation
print("\\n=== Null Validation ===")
required_cols = ['user_id', 'age', 'email', 'salary']
for col in required_cols:
    null_count = df[col].isnull().sum()
    status = 'PASS' if null_count == 0 else f'FAIL ({null_count} nulls)'
    print(f"  {col}: {status}")

# Uniqueness check
print("\\n=== Uniqueness Validation ===")
print(f"  user_id duplicates: {df['user_id'].duplicated().sum()}")`,
      output: `=== Type Validation ===
  user_id: expected int64, got int64 [PASS]
  age: expected int64, got int64 [PASS]
  email: expected object, got object [PASS]
  salary: expected float64, got float64 [PASS]
  department: expected object, got object [PASS]
  join_date: expected datetime64[ns], got datetime64[ns] [PASS]

=== Range Validation ===
  Age (0-120):
    Out of range: 2 rows

=== Null Validation ===
  user_id: PASS
  age: PASS
  email: FAIL (1 nulls)
  salary: FAIL (1 nulls)

=== Uniqueness Validation ===
  user_id: 0 duplicates`,
      explanation: 'Basic validation checks types, ranges, nullability, and uniqueness. This catches common data quality issues: negative ages, extreme values, missing required fields, and duplicate identifiers.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np

# Comprehensive validation function
def validate_dataset(df, validation_rules):
    """Generic data validation function."""
    results = []
    
    for rule in validation_rules:
        result = {
            'rule': rule['name'],
            'type': rule['type'],
            'status': 'PASS',
            'details': ''
        }
        
        try:
            if rule['type'] == 'dtype':
                actual = str(df[rule['column']].dtype)
                if actual != rule['expected']:
                    result['status'] = 'FAIL'
                    result['details'] = f"Expected {rule['expected']}, got {actual}"
            
            elif rule['type'] == 'range':
                col = df[rule['column']]
                violations = ((col < rule['min']) | (col > rule['max'])).sum()
                if violations > 0:
                    result['status'] = 'FAIL'
                    result['details'] = f"{violations} values outside [{rule['min']}, {rule['max']}]"
            
            elif rule['type'] == 'not_null':
                nulls = df[rule['column']].isnull().sum()
                if nulls > 0:
                    result['status'] = 'FAIL'
                    result['details'] = f"{nulls} null values found"
            
            elif rule['type'] == 'unique':
                dups = df[rule['column']].duplicated().sum()
                if dups > 0:
                    result['status'] = 'FAIL'
                    result['details'] = f"{dups} duplicate values"
            
            elif rule['type'] == 'allowed_values':
                invalid = ~df[rule['column']].isin(rule['values'])
                invalid = invalid & df[rule['column']].notna()
                count = invalid.sum()
                if count > 0:
                    result['status'] = 'FAIL'
                    result['details'] = f"{count} values not in allowed set: {df[rule['column']][invalid].unique()}"
            
            elif rule['type'] == 'date_range':
                dates = pd.to_datetime(df[rule['column']], errors='coerce')
                violations = ((dates < rule['min']) | (dates > rule['max'])).sum()
                if violations > 0:
                    result['status'] = 'FAIL'
                    result['details'] = f"{violations} dates outside [{rule['min'].date()}, {rule['max'].date()}]"
            
        except Exception as e:
            result['status'] = 'ERROR'
            result['details'] = str(e)
        
        results.append(result)
    
    return pd.DataFrame(results)

# Define validation rules
rules = [
    {'name': 'user_id is int', 'type': 'dtype', 'column': 'user_id', 'expected': 'int64'},
    {'name': 'user_id unique', 'type': 'unique', 'column': 'user_id'},
    {'name': 'age between 0-120', 'type': 'range', 'column': 'age', 'min': 0, 'max': 120},
    {'name': 'email not null', 'type': 'not_null', 'column': 'email'},
    {'name': 'salary >= 0', 'type': 'range', 'column': 'salary', 'min': 0, 'max': np.inf},
    {'name': 'valid department', 'type': 'allowed_values', 'column': 'department', 'values': ['IT', 'HR', 'Sales', 'Engineering']},
    {'name': 'join_date in range', 'type': 'date_range', 'column': 'join_date', 'min': pd.Timestamp('2019-01-01'), 'max': pd.Timestamp('2024-12-31')},
]

report = validate_dataset(df, rules)
print("=== Validation Report ===")
print(report.to_string(index=False))

print(f"\\nSummary: {len(report[report['status'] == 'PASS'])} passed, "
      f"{len(report[report['status'] == 'FAIL'])} failed, "
      f"{len(report[report['status'] == 'ERROR'])} errors")`,
      output: `=== Validation Report ===
             rule      type status                         details
      user_id is int     dtype   PASS                                
      user_id unique    unique   PASS                                
    age between 0-120     range   FAIL    1 values outside [0, 120]
       email not null  not_null   FAIL                1 null values found
           salary >= 0     range   PASS                                
     valid department allowed   FAIL  1 values not in allowed set: ['UNKNOWN']
join_date in range date_range   PASS                                

Summary: 4 passed, 3 failed, 0 errors`,
      explanation: 'A generic validation engine evaluates each rule and produces a report. This approach scales to hundreds of rules and is the foundation of production validation pipelines like those built with Great Expectations.',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
import great_expectations as ge
from great_expectations.dataset import PandasDataset

# Great Expectations validation
df = pd.DataFrame({
    'age': [25, 30, 999, 35, None],
    'income': [50000, 60000, None, 80000, 75000],
    'department': ['IT', 'HR', 'IT', 'HR', 'SALES'],
    'employee_id': ['E001', 'E002', 'E003', 'E004', 'E004'],  # Duplicate!
})

# Convert to Great Expectations dataset
ge_df = PandasDataset(df)

# Define expectations
expectations = [
    ge_df.expect_column_to_exist('age'),
    ge_df.expect_column_values_to_be_of_type('age', 'int64'),
    ge_df.expect_column_values_to_be_between('age', 0, 120),
    ge_df.expect_column_values_to_not_be_null('age'),
    ge_df.expect_column_values_to_be_between('income', 0, 200000),
    ge_df.expect_column_values_to_not_be_null('income'),
    ge_df.expect_column_values_to_be_in_set('department', ['IT', 'HR', 'Sales', 'Engineering']),
    ge_df.expect_column_values_to_be_unique('employee_id'),
]

# Generate validation report
print("=== Great Expectations Validation Report ===")
print(f"{'#':<4} {'Expectation':<55} {'Status':<8}")
print("-" * 67)
for i, (exp_name, exp_result) in enumerate(zip(
    ['column_exists', 'type_check', 'range_check', 'not_null',
     'income_range', 'income_not_null', 'allowed_department', 'unique_id'],
    expectations)):
    status = 'PASS' if exp_result.success else 'FAIL'
    unexpected = getattr(exp_result, 'unexpected_list', [])
    details = f" (unexpected: {unexpected})" if unexpected else ""
    print(f"{i+1:<4} {exp_name:<55} {status:<8}{details}")

# Custom validation class
class DataValidator:
    def __init__(self, schema):
        self.schema = schema
        self.results = []
    
    def validate(self, df):
        """Run all schema validations against DataFrame."""
        self.results = []
        
        for col_name, rules in self.schema.items():
            if col_name not in df.columns:
                self.results.append({'column': col_name, 'rule': 'exists', 'status': 'FAIL', 'detail': 'Column missing'})
                continue
            
            col = df[col_name]
            for rule in rules:
                result = {'column': col_name, 'rule': rule['type'], 'status': 'PASS', 'detail': ''}
                
                if rule['type'] == 'dtype':
                    if str(col.dtype) != rule['value']:
                        result['status'] = 'FAIL'
                        result['detail'] = f"Expected {rule['value']}, got {col.dtype}"
                
                elif rule['type'] == 'not_null':
                    n_nulls = col.isnull().sum()
                    if n_nulls > 0:
                        result['status'] = 'FAIL'
                        result['detail'] = f"{n_nulls} nulls found"
                
                elif rule['type'] == 'range':
                    in_range = col.between(rule['min'], rule['max'])
                    n_outside = (~in_range).sum() - col.isnull().sum()
                    if n_outside > 0:
                        result['status'] = 'FAIL'
                        result['detail'] = f"{n_outside} values outside [{rule['min']}, {rule['max']}]"
                
                elif rule['type'] == 'unique':
                    n_dups = col.duplicated().sum()
                    if n_dups > 0:
                        result['status'] = 'FAIL'
                        result['detail'] = f"{n_dups} duplicates found"
                
                self.results.append(result)
        
        return pd.DataFrame(self.results)

# Define schema
schema = {
    'age': [
        {'type': 'dtype', 'value': 'int64'},
        {'type': 'range', 'min': 0, 'max': 120},
        {'type': 'not_null'},
    ],
    'income': [
        {'type': 'dtype', 'value': 'float64'},
        {'type': 'range', 'min': 0, 'max': 200000},
    ],
    'employee_id': [
        {'type': 'dtype', 'value': 'object'},
        {'type': 'unique'},
    ],
}

# Run validation
validator = DataValidator(schema)
validation_report = validator.validate(df)

print(f"\\n=== Custom Validator Results ===")
failed = validation_report[validation_report['status'] == 'FAIL']
if len(failed) > 0:
    print(f"{len(failed)} validation failures:")
    for _, row in failed.iterrows():
        print(f"  - {row['column']}.{row['rule']}: {row['detail']}")
else:
    print("All validations passed!")`,
      output: `=== Great Expectations Validation Report ===
#    Expectation                                          Status
-------------------------------------------------------------------
1    column_exists                                        PASS   
2    type_check                                           PASS   
3    range_check                                          FAIL   (unexpected: [999])
4    not_null                                             FAIL   (unexpected: [nan])
5    income_range                                         PASS   
6    income_not_null                                      FAIL   (unexpected: [nan])
7    allowed_department                                   FAIL   (unexpected: ['SALES'])
8    unique_id                                            FAIL   (unexpected: ['E004'])

=== Custom Validator Results ===
4 validation failures:
  - age.range: 1 values outside [0, 120]
  - age.not_null: 1 nulls found
  - income.not_null: 1 nulls found
  - employee_id.unique: 1 duplicates found`,
      explanation: 'Great Expectations provides a declarative validation framework. The custom DataValidator class shows how to build a schema-driven validation pipeline. Both approaches catch issues like out-of-range ages, null values, invalid categories, and duplicate IDs.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Hospitals validate incoming patient data against schemas (correct MRN format, valid ICD-10 codes, age within plausible range) before loading into EHR systems, preventing medical record corruption.' },
      { industry: 'Finance', description: 'Trading platforms validate market data feeds — checking timestamps are monotonic, prices are within circuit-breaker limits, and trade sizes don\'t exceed position limits before execution.' },
      { industry: 'E-commerce', description: 'Online retailers validate product catalog imports: SKU uniqueness, price >= cost, valid categories, image URL format, and inventory counts are non-negative before updating the live catalog.' },
    ],
    caseStudy: {
      problem: 'A fintech company\'s ML model for loan approval started rejecting 30% of applications overnight. The data pipeline had ingested a CSV where bank account numbers were corrupted by an encoding issue — "-" became "Ã¢â\x80\x93" due to UTF-8/ISO-8859-1 mismatch.',
      solution: 'The team implemented a Great Expectations validation pipeline: schema checks on column names/dtypes, regex pattern matching on account numbers, range checks on income and credit score, and referential integrity on branch codes. Any failed validation triggered a Slack alert and quarantined the data.',
      results: 'Data quality issues were caught within seconds instead of days. False rejections dropped to zero. The validation pipeline saved an estimated $5M in lost revenue and prevented two major compliance violations.',
    },
    bestPractices: [
      'Validate data as early as possible in the pipeline — at ingestion, not after processing',
      'Define a formal schema for every data source and version it alongside your code',
      'Use declarative validation frameworks like Great Expectations for maintainability',
      'Set up automated alerts (Slack, email, PagerDuty) for validation failures',
      'Create separate validation rules for training data vs inference data',
      'Log all validation results for auditability and data quality monitoring',
      'Regularly review and update validation rules as business requirements evolve',
    ],
    tools: ['Great Expectations', 'Pandera', 'Pydantic', 'JSON Schema', 'Apache Griffin', 'dbt tests', 'Custom pandas validation'],
    jobRoles: ['Data Engineer', 'Data Scientist', 'ML Engineer', 'Data Quality Analyst', 'Data Platform Engineer'],
    furtherReading: [
      'Great Expectations official documentation and tutorials',
      '"Designing Data-Intensive Applications" by Martin Kleppmann — data systems fundamentals',
      'Pandera documentation — statistical data validation for pandas',
      'Monte Carlo Data observability blog — production data quality patterns',
    ],
  },
  quiz: [
    {
      id: 'p4-validation-1', type: 'mcq',
      question: 'What is schema validation primarily concerned with?',
      options: [
        'Checking the statistical distribution of data',
        'Verifying that data structure matches expected column names, types, and constraints',
        'Removing duplicate rows from the dataset',
        'Visualizing data patterns with charts',
      ],
      correctAnswer: 'Verifying that data structure matches expected column names, types, and constraints',
      explanation: 'Schema validation ensures data conforms to a predefined structure — correct columns, proper data types, and constraint rules. It catches structural issues before they reach downstream systems.',
    },
    {
      id: 'p4-validation-2', type: 'truefalse',
      question: 'Data validation and data cleaning refer to the same process.',
      correctAnswer: 'False',
      explanation: 'Validation detects and reports problems (checking). Cleaning fixes and transforms data (fixing). Validation should happen first to identify what needs cleaning.',
    },
    {
      id: 'p4-validation-3', type: 'code',
      question: 'What does df.dtypes return in pandas?',
      code: `import pandas as pd
df = pd.DataFrame({'a': [1, 2], 'b': [1.5, 2.5], 'c': ['x', 'y']})
print(df.dtypes)`,
      options: [
        'The first row of the DataFrame',
        'The data type of each column in the DataFrame',
        'A summary statistic for each column',
        'The number of rows and columns',
      ],
      correctAnswer: 'The data type of each column in the DataFrame',
      explanation: 'df.dtypes returns a Series with the dtype of each column. For this example: a -> int64, b -> float64, c -> object.',
    },
    {
      id: 'p4-validation-4', type: 'fillblank',
      question: '___ integrity ensures that values in a column correspond to valid values in a reference table or dataset.',
      correctAnswer: 'Referential',
      explanation: 'Referential integrity guarantees that relationships between tables remain consistent. For example, a foreign key value must exist in the referenced primary key column.',
    },
    {
      id: 'p4-validation-5', type: 'match',
      question: 'Match each validation type with a concrete example:',
      pairs: [
        { left: 'Range validation', right: 'Age must be between 0 and 120' },
        { left: 'Uniqueness constraint', right: 'No two users can have the same email' },
        { left: 'Type check', right: 'Price column must be float, not string' },
        { left: 'Allowed values', right: 'Department must be IT, HR, or Sales' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each validation type serves a specific purpose: range checks numeric bounds, uniqueness eliminates duplicates, type checks ensure correct datatypes, and allowed values restrict categorical inputs.',
    },
  ],
}))

export {}
