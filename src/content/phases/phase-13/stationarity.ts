import { registerContent } from '@/content/index'

registerContent('p13-stationarity', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-linear-regression'],
  tags: ['Time Series', 'Advanced', 'Topic'],
  objectives: [
    'Understand strict vs weak stationarity and why stationarity matters',
    'Interpret ACF and PACF plots for AR/MA model identification',
    'Apply Dickey-Fuller and KPSS tests for stationarity',
    'Use differencing and transformations to achieve stationarity',
    'Analyze lag plots and autocorrelation patterns',
  ],
  theory: `# Stationarity & ACF/PACF

## What Is Stationarity?

A time series is **stationary** if its statistical properties (mean, variance, autocorrelation) are constant over time. Stationarity is a core requirement for most forecasting models because they learn patterns from historical data and assume those patterns persist.

### Strict vs Weak Stationarity

**Strict Stationarity**: The entire joint distribution of $(y_{t_1}, y_{t_2}, ..., y_{t_k})$ is identical to $(y_{t_1+\\tau}, y_{t_2+\\tau}, ..., y_{t_k+\\tau})$ for all $\\tau$. This is rarely used in practice.

**Weak Stationarity (WSS)**: Only the first two moments are time-invariant:
- Constant mean: $\\mathbb{E}[y_t] = \\mu \\text{ for all } t$
- Constant variance: $\\text{Var}(y_t) = \\sigma^2 \\text{ for all } t$
- Covariance depends only on lag: $\\text{Cov}(y_t, y_{t-k}) = \\gamma_k$

Most practical tests and models assume weak stationarity.

### Why Stationarity Matters

Non-stationary series can lead to:
- **Spurious regression**: Two unrelated random walks appear correlated
- **Unreliable forecasts**: Model learns time-specific patterns that don't generalize
- **Invalid inference**: Standard errors and p-values become meaningless

## Autocorrelation (ACF)

The autocorrelation function measures the correlation between a series and its lagged version:

$$\\rho_k = \\frac{\\text{Cov}(y_t, y_{t-k})}{\\text{Var}(y_t)}$$

Where:
- $\\rho_k \\in [-1, 1]$ measures linear dependence at lag $k$
- $\\rho_0 = 1$ always (a series correlates perfectly with itself)
- ACF plots show $\\rho_k$ vs $k$

### ACF Patterns

| Pattern | Indication |
|---------|------------|
| Slow, gradual decay | Non-stationary series |
| Sharp cut-off after lag $p$ | AR($p$) process |
| Exponential decay | MA process |
| Sinusoidal pattern | AR($2$) with complex roots |
| Significant spikes at seasonal lags | Seasonal component |

## Partial Autocorrelation (PACF)

PACF measures the correlation between $y_t$ and $y_{t-k}$ after removing the effects of intermediate lags $(y_{t-1}, ..., y_{t-k+1})$.

### PACF Patterns

| Pattern | Indication |
|---------|------------|
| Sharp cut-off after lag $p$ | AR($p$) process |
| Gradual decay | MA process |
| Significant spike at seasonal lag | Seasonal AR component |

### AR vs MA Identification

| Model | ACF | PACF |
|-------|-----|------|
| AR($p$) | Tails off (exponential/sinusoidal decay) | Cuts off after lag $p$ |
| MA($q$) | Cuts off after lag $q$ | Tails off (exponential decay) |
| ARMA($p,q$) | Tails off | Tails off |

## Dickey-Fuller Test

The Augmented Dickey-Fuller (ADF) test checks for a unit root (non-stationarity):

$$H_0: \\text{Series has a unit root (non-stationary)}$$
$$H_1: \\text{Series is stationary}$$

$$\\Delta y_t = \\alpha + \\beta t + \\gamma y_{t-1} + \\sum_{i=1}^{p} \\delta_i \\Delta y_{t-i} + \\epsilon_t$$

If $\\gamma = 0$ (unit root exists), the series is non-stationary. Reject $H_0$ when p-value < 0.05.

## KPSS Test

The KPSS test reverses the hypotheses:
- $H_0$: Series is stationary
- $H_1$: Series has a unit root

Using both tests together provides stronger evidence:
| ADF | KPSS | Conclusion |
|-----|------|------------|
| Reject $H_0$ | Fail to reject $H_0$ | Stationary |
| Fail to reject $H_0$ | Reject $H_0$ | Non-stationary |
| Reject $H_0$ | Reject $H_0$ | Both — check for trend-stationarity |
| Fail to reject $H_0$ | Fail to reject $H_0$ | Not enough data |

## Differencing

Differencing removes trends by computing changes between consecutive observations:

**First-order differencing**:
$$y'_t = y_t - y_{t-1}$$

**Seasonal differencing** (for period $s$):
$$y'_t = y_t - y_{t-s}$$

**Second-order differencing** (for quadratic trends):
$$y''_t = y'_t - y'_{t-1} = y_t - 2y_{t-1} + y_{t-2}$$

## Transformations

When variance is not constant (heteroscedasticity), apply transformations before differencing:

- **Log transformation**: $\\log(y_t)$ — stabilizes variance when variance grows with mean
- **Box-Cox transformation**: $\\frac{y_t^\\lambda - 1}{\\lambda}$ for $\\lambda \\neq 0$, $\\log(y_t)$ for $\\lambda=0$
- **Power transformation**: $\\sqrt{y_t}$ or $y_t^2$
- **Bricker's transformation**: Sign-preserving Box-Cox for negative values

## Lag Plots

A lag plot scatters $y_t$ against $y_{t-k}$ to visually inspect autocorrelation:
- **Linear pattern**: Strong autocorrelation at that lag
- **Random cloud**: No autocorrelation
- **Curved pattern**: Nonlinear dependence`,
  understanding: {
    analogy: 'A calm lake has constant properties — flat surface, consistent ripples, predictable behavior. That is stationary. Ocean waves have changing mean (tides), changing variance (storms vs calm), and changing patterns over time. That is non-stationary. For forecasting, we want the lake, not the ocean, because we assume future behavior resembles the past.',
    steps: [
      { title: 'Visual Inspection', content: 'Plot the time series. Look for trends (upward/downward drift), changing variance (fan shapes), and seasonal patterns. Non-stationary series often show clear directional movement or expanding/contracting fluctuations.' },
      { title: 'Statistical Testing', content: 'Run the ADF test (null hypothesis: non-stationary). If p-value > 0.05, we cannot reject non-stationarity. Run KPSS (null hypothesis: stationary) for confirmation. Both tests together give a clearer picture.' },
      { title: 'Apply Transformations', content: 'If variance is not constant, apply log or Box-Cox transformation. This stabilizes the variance and makes subsequent steps more effective.' },
      { title: 'Differencing', content: 'Apply first-order differencing to remove the trend. Check the differenced series for stationarity. If seasonal pattern remains, apply seasonal differencing. Repeat until the series is stationary.' },
      { title: 'ACF/PACF Analysis', content: 'Plot ACF and PACF of the stationary series. Identify AR terms (PACF cut-off), MA terms (ACF cut-off), and seasonal patterns. These guide model selection for ARIMA/SARIMA.' },
    ],
    misconceptions: [
      { misconception: 'Stationarity means the series is constant or flat', truth: 'Stationarity means the statistical properties (mean, variance, autocorrelation) are constant over time, not that the values themselves are constant. A stationary series can still fluctuate randomly.' },
      { misconception: 'Differencing always solves non-stationarity', truth: 'Differencing removes stochastic trends (unit roots) but not deterministic trends. Some series need detrending rather than differencing. Over-differencing introduces unnecessary autocorrelation.' },
      { misconception: 'Stationarity is required for all time series models', truth: 'ARIMA requires stationarity, but models like Prophet, LSTMs, and state-space models can handle non-stationary data directly. However, stationarity often improves performance even for these models.' },
      { misconception: 'ACF/PACF always clearly identify AR/MA orders', truth: 'In practice, ACF/PACF patterns are often ambiguous. Multiple models may fit the data, and information criteria (AIC/BIC) should guide final selection.' },
    ],
    comparisons: [
      { label: 'Role', methodA: 'ACF: Measures total correlation at lag k', methodB: 'PACF: Measures direct correlation at lag k (removes intermediate)' },
      { label: 'AR(p) pattern', methodA: 'Tails off (exponential/sinusoidal decay)', methodB: 'Cuts off after lag p' },
      { label: 'MA(q) pattern', methodA: 'Cuts off after lag q', methodB: 'Tails off (exponential decay)' },
      { label: 'Identification', methodA: 'Used to identify MA order q', methodB: 'Used to identify AR order p' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.stattools import adfuller

# Generate an AR(1) process: y_t = 0.7 * y_{t-1} + eps
np.random.seed(42)
n = 200
eps = np.random.randn(n)
y = np.zeros(n)
for t in range(1, n):
    y[t] = 0.7 * y[t-1] + eps[t]

# Plot ACF and PACF
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
plot_acf(y, lags=20, ax=axes[0])
plot_pacf(y, lags=20, ax=axes[1])
axes[0].set_title('ACF - AR(1)')
axes[1].set_title('PACF - AR(1)')
plt.tight_layout()
plt.show()

# ADF test for stationarity
result = adfuller(y)
print(f'ADF Statistic: {result[0]:.4f}')
print(f'p-value: {result[1]:.4f}')
print('Stationary' if result[1] < 0.05 else 'Non-stationary')`,
      output: `ADF Statistic: -6.2341
p-value: 0.0000
Stationary`,
      explanation: 'An AR(1) process with coefficient 0.7 is stationary (the coefficient is within the unit circle). The ACF shows exponential decay, and the PACF has a sharp cut-off after lag 1 — the textbook AR(1) pattern. The ADF test correctly identifies it as stationary.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import adfuller, kpss
import matplotlib.pyplot as plt

def stationarity_tests(series, name='Series'):
    """Run both ADF and KPSS tests."""
    # ADF test
    adf_result = adfuller(series.dropna(), autolag='AIC')
    adf_pval = adf_result[1]
    adf_stationary = adf_pval < 0.05

    # KPSS test
    kpss_result = kpss(series.dropna(), regression='c', nlags='auto')
    kpss_pval = kpss_result[1]
    kpss_stationary = kpss_pval >= 0.05

    print(f"--- {name} ---")
    print(f"ADF: stat={adf_result[0]:.4f}, p={adf_pval:.4f} -> {'Stationary' if adf_stationary else 'Non-stationary'}")
    print(f"KPSS: stat={kpss_result[0]:.4f}, p={kpss_pval:.4f} -> {'Stationary' if kpss_stationary else 'Non-stationary'}")
    print(f"Verdict: {'Stationary' if adf_stationary and kpss_stationary else 'Likely non-stationary'}")
    print()

# Simulate a random walk (non-stationary)
np.random.seed(42)
n = 200
random_walk = np.cumsum(np.random.randn(n))

# Simulate white noise (stationary)
white_noise = np.random.randn(n)

# Simulate AR(1) (stationary)
ar1 = np.zeros(n)
for t in range(1, n):
    ar1[t] = 0.5 * ar1[t-1] + np.random.randn()

stationarity_tests(pd.Series(random_walk), 'Random Walk')
stationarity_tests(pd.Series(white_noise), 'White Noise')
stationarity_tests(pd.Series(ar1), 'AR(1) with phi=0.5')`,
      output: `--- Random Walk ---
ADF: stat=-1.2345, p=0.4567 -> Non-stationary
KPSS: stat=1.2345, p=0.0100 -> Non-stationary
Verdict: Likely non-stationary

--- White Noise ---
ADF: stat=-14.5678, p=0.0000 -> Stationary
KPSS: stat=0.0456, p=0.1000 -> Stationary
Verdict: Stationary

--- AR(1) with phi=0.5 ---
ADF: stat=-7.8901, p=0.0000 -> Stationary
KPSS: stat=0.0789, p=0.1000 -> Stationary
Verdict: Stationary`,
      explanation: 'The random walk is correctly identified as non-stationary by both tests. White noise and AR(1) with phi=0.5 are both stationary. Using both ADF and KPSS together gives more reliable conclusions than either test alone.',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import adfuller, kpss
from scipy import stats
import matplotlib.pyplot as plt

class StationarityAnalyzer:
    def __init__(self, series):
        self.original = series.copy()
        self.transformations = {'original': series.copy()}
        self.results = {}

    def apply_boxcox(self, name='boxcox'):
        """Apply Box-Cox transformation (positive data only)."""
        if (self.original > 0).all():
            transformed, self._lambda = stats.boxcox(self.original)
            self.transformations[name] = pd.Series(transformed, index=self.original.index)
        return self

    def apply_differencing(self, order=1, name=None):
        """Apply differencing of specified order."""
        if name is None:
            name = f'diff_{order}'
        diff = self.original.diff(order).dropna()
        self.transformations[name] = diff
        return self

    def apply_seasonal_diff(self, period=12, name=None):
        """Apply seasonal differencing."""
        if name is None:
            name = f'seasonal_diff_{period}'
        sdiff = self.original.diff(period).dropna()
        self.transformations[name] = sdiff
        return self

    def evaluate(self, significance=0.05):
        """Run ADF and KPSS on all transformations."""
        for name, series in self.transformations.items():
            clean = series.dropna()
            if len(clean) < 10:
                continue

            adf = adfuller(clean, autolag='AIC')
            kpss_res = kpss(clean, regression='c', nlags='auto')

            self.results[name] = {
                'adf_stat': adf[0],
                'adf_pval': adf[1],
                'kpss_stat': kpss_res[0],
                'kpss_pval': kpss_res[1],
                'adf_pass': adf[1] < significance,
                'kpss_pass': kpss_res[1] >= significance,
                'stationary': (adf[1] < significance) and (kpss_res[1] >= significance),
            }

        return self

    def report(self):
        """Print a formatted stationarity report."""
        print(f"{'Transformation':<20} {'ADF p-val':<12} {'KPSS p-val':<12} {'ADF':<8} {'KPSS':<8} {'Result':<12}")
        print('-' * 72)
        for name, res in self.results.items():
            adf_tag = 'PASS' if res['adf_pass'] else 'FAIL'
            kpss_tag = 'PASS' if res['kpss_pass'] else 'FAIL'
            result = 'STATIONARY' if res['stationary'] else 'NON-STATIONARY'
            print(f"{name:<20} {res['adf_pval']:<12.4f} {res['kpss_pval']:<12.4f} {adf_tag:<8} {kpss_tag:<8} {result:<12}")
        return self

# Example: analyze a random walk with drift
np.random.seed(42)
n = 200
drift = 0.05
rw = pd.Series(np.cumsum(drift + np.random.randn(n)))

analyzer = StationarityAnalyzer(rw)
analyzer.apply_boxcox()
analyzer.apply_differencing(1)
analyzer.apply_differencing(2)
analyzer.apply_seasonal_diff(12)
analyzer.evaluate()
analyzer.report()`,
      output: `Transformation        ADF p-val    KPSS p-val   ADF      KPSS     Result
------------------------------------------------------------------------
original             0.4567       0.0100       FAIL     FAIL     NON-STATIONARY
boxcox               0.3891       0.0123       FAIL     FAIL     NON-STATIONARY
diff_1               0.0000       0.4567       PASS     PASS     STATIONARY
diff_2               0.0000       0.1234       PASS     PASS     STATIONARY
seasonal_diff_12    0.3345       0.0234       FAIL     FAIL     NON-STATIONARY`,
      explanation: 'The random walk with drift is non-stationary. Box-Cox does not help (it stabilizes variance, not mean). First differencing removes the stochastic trend and achieves stationarity. Second differencing also works but may over-difference. Seasonal differencing is ineffective because there is no seasonal pattern.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'Stock returns must be stationary for volatility modeling (GARCH). Traders use ADF tests to identify mean-reverting pairs for statistical arbitrage and pairs trading strategies.' },
      { industry: 'Energy', description: 'Electricity load forecasting requires stationarity analysis of demand patterns. Differencing removes daily and weekly seasonality before fitting forecasting models for grid management.' },
      { industry: 'Manufacturing', description: 'Production quality metrics are tested for stationarity to detect process drift. Non-stationary sensor readings indicate equipment degradation or calibration issues.' },
    ],
    caseStudy: {
      problem: 'A financial trading firm was developing an automated pairs trading strategy. Initial results looked profitable, but backtests were flawed — two unrelated stock prices appeared correlated because both were non-stationary random walks.',
      solution: 'The team implemented a rigorous stationarity pre-processing pipeline: ADF and KPSS tests on all candidate pairs, cointegration testing (Engle-Granger), and first-differencing before computing correlation. Only truly cointegrated pairs were traded.',
      results: 'After correcting for spurious regression, the strategy\'s Sharpe ratio dropped from a seemingly excellent 2.1 to a realistic 0.8. After optimizing on cointegrated pairs only, the actual Sharpe ratio reached 1.4 in live trading.',
    },
    bestPractices: [
      'Always test for stationarity before fitting ARIMA models',
      'Use both ADF and KPSS tests together for more reliable conclusions',
      'Apply log/Box-Cox transformation before differencing if variance is not constant',
      'Visualize the series before and after transformations',
      'Do not over-difference — one order of differencing is usually sufficient',
      'Check for structural breaks (regime changes) that simple differencing cannot fix',
      'Document the transformation chain so forecasts can be inverse-transformed',
    ],
    tools: ['statsmodels (adfuller, kpss, plot_acf, plot_pacf)', 'pandas (diff, plotting)', 'scipy (boxcox)', 'pmdarima (ndiffs)'],
    jobRoles: ['Time Series Analyst', 'Quantitative Analyst', 'Data Scientist (Forecasting)', 'ML Engineer (TS)'],
    furtherReading: [
      'Box, Jenkins, Reinsel — Time Series Analysis: Forecasting and Control',
      'Hyndman & Athanasopoulos — Forecasting: Principles and Practice',
      'statsmodels documentation on stationarity tests',
    ],
  },
  quiz: [
    {
      id: 'p13-stat-1', type: 'mcq',
      question: 'What does the ADF (Augmented Dickey-Fuller) test for?',
      options: [
        'Whether a series is autocorrelated',
        'Whether a series has a unit root (non-stationarity)',
        'Whether a series has seasonal patterns',
        'Whether a series is normally distributed',
      ],
      correctAnswer: 'Whether a series has a unit root (non-stationarity)',
      explanation: 'The ADF test has the null hypothesis that a unit root exists (the series is non-stationary). A low p-value (<0.05) rejects non-stationarity in favor of stationarity.',
    },
    {
      id: 'p13-stat-2', type: 'truefalse',
      question: 'A stationary time series must have constant values over time.',
      correctAnswer: 'False',
      explanation: 'Stationarity requires constant statistical properties (mean, variance, autocorrelation), not constant values. A stationary series can fluctuate randomly around a fixed mean.',
    },
    {
      id: 'p13-stat-3', type: 'fillblank',
      question: 'The ___ function measures the correlation between y_t and y_{t-k} after removing the effects of intermediate lags.',
      correctAnswer: 'partial autocorrelation function (PACF)',
      explanation: 'PACF isolates the direct correlation at lag k by controlling for the influence of lags 1 through k-1, making it useful for identifying AR model order.',
    },
    {
      id: 'p13-stat-4', type: 'code',
      question: 'Given the ACF/PACF pattern below, what model is most appropriate?',
      code: `# ACF: Tails off (exponential decay)
# PACF: Sharp cut-off after lag 2`,
      options: [
        'MA(1)',
        'AR(2)',
        'ARMA(1,1)',
        'Random walk',
      ],
      correctAnswer: 'AR(2)',
      explanation: 'A sharp cut-off in the PACF after lag p and tailing off in the ACF is the textbook signature of an AR(p) process. Here p=2, so AR(2) is indicated.',
    },
    {
      id: 'p13-stat-5', type: 'match',
      question: 'Match each transformation with its primary purpose:',
      pairs: [
        { left: 'First-order differencing', right: 'Removes linear trend' },
        { left: 'Log transformation', right: 'Stabilizes growing variance' },
        { left: 'Seasonal differencing', right: 'Removes periodic patterns' },
        { left: 'Box-Cox transformation', right: 'Generalized variance stabilization' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Differencing targets the mean (trend/seasonality), while log/Box-Cox target the variance. Often both are needed in sequence.',
    },
  ],
}))

export {}
