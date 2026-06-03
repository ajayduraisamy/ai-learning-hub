import type { TemplateDef } from './types'

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'linear-regression',
    name: 'Linear Regression Pipeline',
    description: 'Synthetic data → Scaling → Split → Linear Regression → Regression Metrics',
    nodes: [
      { id: 'src', type: 'synthetic', position: { x: 50, y: 200 }, params: { nSamples: 1000, nFeatures: 5, noise: 0.1, randomState: 42 } },
      { id: 'scale', type: 'scaling', position: { x: 300, y: 200 }, params: { method: 'standard' } },
      { id: 'split', type: 'split', position: { x: 550, y: 200 }, params: { testSize: 0.2, stratify: false, shuffle: true } },
      { id: 'model', type: 'linear-regression', position: { x: 800, y: 200 }, params: { fitIntercept: true } },
      { id: 'eval', type: 'regression-metrics', position: { x: 1050, y: 200 }, params: { showResiduals: true } },
    ],
    edges: [
      { source: 'src', target: 'scale' },
      { source: 'scale', target: 'split' },
      { source: 'split', target: 'model' },
      { source: 'model', target: 'eval' },
    ],
  },
  {
    id: 'classification',
    name: 'Classification Pipeline',
    description: 'Synthetic data → Scaling → Split → Random Forest → Classification Metrics',
    nodes: [
      { id: 'src', type: 'synthetic', position: { x: 50, y: 200 }, params: { nSamples: 2000, nFeatures: 10, noise: 0.15, randomState: 42 } },
      { id: 'scale', type: 'scaling', position: { x: 300, y: 200 }, params: { method: 'standard' } },
      { id: 'split', type: 'split', position: { x: 550, y: 200 }, params: { testSize: 0.25, stratify: true, shuffle: true } },
      { id: 'model', type: 'random-forest', position: { x: 800, y: 200 }, params: { nEstimators: 100, maxDepth: 10 } },
      { id: 'eval', type: 'classification-metrics', position: { x: 1050, y: 200 }, params: { showConfusion: true, average: 'weighted' } },
    ],
    edges: [
      { source: 'src', target: 'scale' },
      { source: 'scale', target: 'split' },
      { source: 'split', target: 'model' },
      { source: 'model', target: 'eval' },
    ],
  },
  {
    id: 'clustering',
    name: 'Clustering Pipeline',
    description: 'Synthetic data → Scaling → K-Means → Clustering Metrics',
    nodes: [
      { id: 'src', type: 'synthetic', position: { x: 50, y: 200 }, params: { nSamples: 500, nFeatures: 5, noise: 0.05, randomState: 42 } },
      { id: 'scale', type: 'scaling', position: { x: 300, y: 200 }, params: { method: 'standard' } },
      { id: 'model', type: 'kmeans', position: { x: 550, y: 200 }, params: { nClusters: 3, maxIter: 300 } },
      { id: 'eval', type: 'clustering-metrics', position: { x: 800, y: 200 }, params: { showSilhouette: true } },
    ],
    edges: [
      { source: 'src', target: 'scale' },
      { source: 'scale', target: 'model' },
      { source: 'model', target: 'eval' },
    ],
  },
  {
    id: 'nlp',
    name: 'NLP Pipeline',
    description: 'Synthetic text data → Encoding → Neural Network → Classification Metrics',
    nodes: [
      { id: 'src', type: 'synthetic', position: { x: 50, y: 200 }, params: { nSamples: 3000, nFeatures: 20, noise: 0.2, randomState: 42 } },
      { id: 'enc', type: 'encoding', position: { x: 300, y: 200 }, params: { method: 'onehot' } },
      { id: 'split', type: 'split', position: { x: 550, y: 200 }, params: { testSize: 0.2, stratify: true, shuffle: true } },
      { id: 'model', type: 'neural-network', position: { x: 800, y: 200 }, params: { hiddenLayers: '128,64,32', activation: 'relu', lr: 0.001, epochs: 30 } },
      { id: 'eval', type: 'classification-metrics', position: { x: 1050, y: 200 }, params: { showConfusion: true, average: 'macro' } },
    ],
    edges: [
      { source: 'src', target: 'enc' },
      { source: 'enc', target: 'split' },
      { source: 'split', target: 'model' },
      { source: 'model', target: 'eval' },
    ],
  },
  {
    id: 'rag',
    name: 'RAG Pipeline',
    description: 'Database source → Encoding → Neural Network (retrieval) → Classification Metrics',
    nodes: [
      { id: 'src', type: 'database', position: { x: 50, y: 200 }, params: { table: 'documents', batchSize: 1000, sampling: 100 } },
      { id: 'enc', type: 'encoding', position: { x: 300, y: 200 }, params: { method: 'target' } },
      { id: 'split', type: 'split', position: { x: 550, y: 200 }, params: { testSize: 0.2, stratify: false, shuffle: true } },
      { id: 'model', type: 'neural-network', position: { x: 800, y: 200 }, params: { hiddenLayers: '256,128,64', activation: 'gelu', lr: 0.0005, epochs: 40 } },
      { id: 'eval', type: 'classification-metrics', position: { x: 1050, y: 200 }, params: { showConfusion: true, average: 'weighted' } },
    ],
    edges: [
      { source: 'src', target: 'enc' },
      { source: 'enc', target: 'split' },
      { source: 'split', target: 'model' },
      { source: 'model', target: 'eval' },
    ],
  },
]
