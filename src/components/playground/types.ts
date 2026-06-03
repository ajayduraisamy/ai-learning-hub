export type ComponentCategory = 'data-source' | 'preprocessing' | 'model' | 'evaluation'

export interface ParamDef {
  key: string
  label: string
  type: 'number' | 'string' | 'select' | 'boolean'
  default: string | number | boolean
  options?: string[]
  min?: number
  max?: number
  step?: number
}

export interface ComponentDef {
  type: string
  category: ComponentCategory
  label: string
  color: string
  icon: string
  params: ParamDef[]
  inputs: number
  outputs: number
}

export interface TemplateDef {
  id: string
  name: string
  description: string
  nodes: PipelineNodeData[]
  edges: { source: string; target: string }[]
}

export interface PipelineNodeData {
  id: string
  type: string
  position: { x: number; y: number }
  params: Record<string, string | number | boolean>
}

export interface SimResult {
  metrics: Record<string, number>
  charts: { type: 'bar' | 'line' | 'pie' | 'confusion'; title: string; data: unknown }[]
  artifacts: { name: string; value: string }[]
}

export const COMPONENTS: ComponentDef[] = [
  {
    type: 'csv-upload',
    category: 'data-source',
    label: 'CSV Upload',
    color: '#3b82f6',
    icon: 'file-text',
    params: [
      { key: 'delimiter', label: 'Delimiter', type: 'select', default: ',', options: [',', '\\t', '|', ';'] },
      { key: 'hasHeader', label: 'Has Header', type: 'boolean', default: true },
      { key: 'sampleRows', label: 'Sample Rows', type: 'number', default: 1000, min: 10, max: 100000, step: 100 },
    ],
    inputs: 0, outputs: 1,
  },
  {
    type: 'database',
    category: 'data-source',
    label: 'Database',
    color: '#3b82f6',
    icon: 'database',
    params: [
      { key: 'table', label: 'Table Name', type: 'string', default: 'transactions' },
      { key: 'batchSize', label: 'Batch Size', type: 'number', default: 5000, min: 100, max: 100000, step: 100 },
      { key: 'sampling', label: 'Sampling %', type: 'number', default: 100, min: 1, max: 100, step: 1 },
    ],
    inputs: 0, outputs: 1,
  },
  {
    type: 'synthetic',
    category: 'data-source',
    label: 'Synthetic Data',
    color: '#3b82f6',
    icon: 'cpu',
    params: [
      { key: 'nSamples', label: 'Samples', type: 'number', default: 1000, min: 10, max: 100000, step: 100 },
      { key: 'nFeatures', label: 'Features', type: 'number', default: 10, min: 1, max: 100, step: 1 },
      { key: 'noise', label: 'Noise', type: 'number', default: 0.1, min: 0, max: 1, step: 0.05 },
      { key: 'randomState', label: 'Random State', type: 'number', default: 42, min: 0, max: 9999, step: 1 },
    ],
    inputs: 0, outputs: 1,
  },
  {
    type: 'scaling',
    category: 'preprocessing',
    label: 'Scaling',
    color: '#8b5cf6',
    icon: 'maximize',
    params: [
      { key: 'method', label: 'Method', type: 'select', default: 'standard', options: ['standard', 'minmax', 'robust', 'maxabs'] },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'encoding',
    category: 'preprocessing',
    label: 'Encoding',
    color: '#8b5cf6',
    icon: 'code',
    params: [
      { key: 'method', label: 'Method', type: 'select', default: 'onehot', options: ['onehot', 'label', 'ordinal', 'target'] },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'imputation',
    category: 'preprocessing',
    label: 'Imputation',
    color: '#8b5cf6',
    icon: 'circle',
    params: [
      { key: 'method', label: 'Method', type: 'select', default: 'mean', options: ['mean', 'median', 'mode', 'knn'] },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'split',
    category: 'preprocessing',
    label: 'Train/Test Split',
    color: '#8b5cf6',
    icon: 'columns',
    params: [
      { key: 'testSize', label: 'Test Size', type: 'number', default: 0.2, min: 0.05, max: 0.5, step: 0.05 },
      { key: 'stratify', label: 'Stratify', type: 'boolean', default: false },
      { key: 'shuffle', label: 'Shuffle', type: 'boolean', default: true },
    ],
    inputs: 1, outputs: 2,
  },
  {
    type: 'linear-regression',
    category: 'model',
    label: 'Linear Regression',
    color: '#f59e0b',
    icon: 'trending-up',
    params: [
      { key: 'fitIntercept', label: 'Fit Intercept', type: 'boolean', default: true },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'random-forest',
    category: 'model',
    label: 'Random Forest',
    color: '#f59e0b',
    icon: 'git-branch',
    params: [
      { key: 'nEstimators', label: 'N Estimators', type: 'number', default: 100, min: 10, max: 1000, step: 10 },
      { key: 'maxDepth', label: 'Max Depth', type: 'number', default: 10, min: 1, max: 50, step: 1 },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'svm',
    category: 'model',
    label: 'SVM',
    color: '#f59e0b',
    icon: 'crosshair',
    params: [
      { key: 'kernel', label: 'Kernel', type: 'select', default: 'rbf', options: ['linear', 'poly', 'rbf', 'sigmoid'] },
      { key: 'C', label: 'C', type: 'number', default: 1, min: 0.01, max: 100, step: 0.1 },
      { key: 'gamma', label: 'Gamma', type: 'select', default: 'scale', options: ['scale', 'auto'] },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'neural-network',
    category: 'model',
    label: 'Neural Network',
    color: '#f59e0b',
    icon: 'network',
    params: [
      { key: 'hiddenLayers', label: 'Hidden Layers', type: 'string', default: '64,32,16' },
      { key: 'activation', label: 'Activation', type: 'select', default: 'relu', options: ['relu', 'tanh', 'sigmoid', 'gelu'] },
      { key: 'lr', label: 'Learning Rate', type: 'number', default: 0.001, min: 0.0001, max: 0.1, step: 0.0001 },
      { key: 'epochs', label: 'Epochs', type: 'number', default: 50, min: 1, max: 500, step: 10 },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'kmeans',
    category: 'model',
    label: 'K-Means',
    color: '#f59e0b',
    icon: 'circle-dot',
    params: [
      { key: 'nClusters', label: 'N Clusters', type: 'number', default: 3, min: 2, max: 20, step: 1 },
      { key: 'maxIter', label: 'Max Iter', type: 'number', default: 300, min: 10, max: 1000, step: 10 },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'pca',
    category: 'model',
    label: 'PCA',
    color: '#f59e0b',
    icon: 'shrink',
    params: [
      { key: 'nComponents', label: 'N Components', type: 'number', default: 2, min: 1, max: 50, step: 1 },
      { key: 'whiten', label: 'Whiten', type: 'boolean', default: false },
    ],
    inputs: 1, outputs: 1,
  },
  {
    type: 'classification-metrics',
    category: 'evaluation',
    label: 'Classification Metrics',
    color: '#22c55e',
    icon: 'check-circle',
    params: [
      { key: 'showConfusion', label: 'Show Confusion Matrix', type: 'boolean', default: true },
      { key: 'average', label: 'Averaging', type: 'select', default: 'weighted', options: ['micro', 'macro', 'weighted'] },
    ],
    inputs: 2, outputs: 0,
  },
  {
    type: 'regression-metrics',
    category: 'evaluation',
    label: 'Regression Metrics',
    color: '#22c55e',
    icon: 'ruler',
    params: [
      { key: 'showResiduals', label: 'Show Residual Plot', type: 'boolean', default: true },
    ],
    inputs: 2, outputs: 0,
  },
  {
    type: 'clustering-metrics',
    category: 'evaluation',
    label: 'Clustering Metrics',
    color: '#22c55e',
    icon: 'layers',
    params: [
      { key: 'showSilhouette', label: 'Show Silhouette', type: 'boolean', default: true },
    ],
    inputs: 2, outputs: 0,
  },
]

export function getComponent(type: string): ComponentDef | undefined {
  return COMPONENTS.find(c => c.type === type)
}

export function getDefaultParams(type: string): Record<string, string | number | boolean> {
  const comp = getComponent(type)
  if (!comp) return {}
  const params: Record<string, string | number | boolean> = {}
  for (const p of comp.params) {
    params[p.key] = p.default
  }
  return params
}
