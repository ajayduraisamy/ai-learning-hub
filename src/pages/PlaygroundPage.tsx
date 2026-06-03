import { useState, useCallback, useRef, type DragEvent } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  type Node, type Edge, type Connection,
  type NodeTypes, type ReactFlowInstance,
  MarkerType, ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Trash2, RotateCcw, FileText, Database, Cpu,
  Maximize, Code, Circle, Columns, TrendingUp, GitBranch,
  Crosshair, Network, CircleDot, Shrink, CheckCircle, Ruler,
  Layers, Sparkles, ChevronDown, ChevronUp, X, AlertCircle,
} from 'lucide-react'
import { PipelineNode } from '@/components/playground/PipelineNode'
import { COMPONENTS, getComponent, getDefaultParams, type SimResult } from '@/components/playground/types'
import { TEMPLATES } from '@/components/playground/templates'

const CATEGORIES = [
  { key: 'data-source', label: 'Data Source', color: '#3b82f6' },
  { key: 'preprocessing', label: 'Preprocessing', color: '#8b5cf6' },
  { key: 'model', label: 'Model', color: '#f59e0b' },
  { key: 'evaluation', label: 'Evaluation', color: '#22c55e' },
] as const

const ICON_MAP: Record<string, typeof FileText> = {
  'file-text': FileText, database: Database, cpu: Cpu,
  maximize: Maximize, code: Code, circle: Circle, columns: Columns,
  'trending-up': TrendingUp, 'git-branch': GitBranch, crosshair: Crosshair,
  network: Network, 'circle-dot': CircleDot, shrink: Shrink,
  'check-circle': CheckCircle, ruler: Ruler, layers: Layers,
}

const nodeTypes: NodeTypes = { pipelineNode: PipelineNode }

function generateResults(nodes: Node[]): SimResult | null {
  const hasModel = nodes.some(n => {
    const comp = getComponent((n.data as Record<string, unknown>).type as string)
    return comp?.category === 'model'
  })
  const hasEval = nodes.some(n => {
    const comp = getComponent((n.data as Record<string, unknown>).type as string)
    return comp?.category === 'evaluation'
  })
  if (!hasModel || !hasEval) return null

  return {
    metrics: {
      'Accuracy': 0.923 + Math.random() * 0.05,
      'Precision': 0.915 + Math.random() * 0.05,
      'Recall': 0.907 + Math.random() * 0.06,
      'F1 Score': 0.911 + Math.random() * 0.05,
      'AUC-ROC': 0.956 + Math.random() * 0.03,
      'Training Time (s)': 2.34 + Math.random() * 1.5,
      'Inference (ms)': 1.2 + Math.random() * 0.8,
    },
    charts: [
      {
        type: 'confusion',
        title: 'Confusion Matrix',
        data: {
          matrix: [[142, 8], [12, 138]],
          labels: ['Negative', 'Positive'],
        },
      },
      {
        type: 'bar',
        title: 'Feature Importance',
        data: {
          labels: ['feature_3', 'feature_7', 'feature_1', 'feature_5', 'feature_9'],
          values: [0.32, 0.24, 0.18, 0.15, 0.11],
        },
      },
    ],
    artifacts: [
      { name: 'model.pkl', value: '2.4 MB' },
      { name: 'scaler.pkl', value: '12 KB' },
      { name: 'metrics.json', value: '1.2 KB' },
      { name: 'confusion_matrix.png', value: '48 KB' },
    ],
  }
}

function PlaygroundCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [results, setResults] = useState<SimResult | null>(null)
  const [running, setRunning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }, eds))
  }, [setEdges])

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: DragEvent) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/reactflow')
    if (!type || !reactFlowInstance || !reactFlowWrapper.current) return

    const bounds = reactFlowWrapper.current.getBoundingClientRect()
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })

    const newId = `${type}-${Date.now()}`
    const newNode: Node = {
      id: newId,
      type: 'pipelineNode',
      position,
      data: { type, label: getComponent(type)?.label || type, params: getDefaultParams(type) },
    }
    setNodes(nds => nds.concat(newNode))
  }, [reactFlowInstance, setNodes])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updateParam = useCallback((key: string, value: string | number | boolean) => {
    if (!selectedNode) return
    setNodes(nds => nds.map(n => {
      if (n.id !== selectedNode.id) return n
      return {
        ...n,
        data: {
          ...n.data,
          params: { ...(n.data as Record<string, unknown>).params as Record<string, string | number | boolean>, [key]: value },
        },
      }
    }))
    setSelectedNode(prev => prev ? {
      ...prev,
      data: {
        ...prev.data,
        params: { ...(prev.data as Record<string, unknown>).params as Record<string, string | number | boolean>, [key]: value },
      },
    } : null)
  }, [selectedNode, setNodes])

  const loadTemplate = useCallback((templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    const newNodes: Node[] = template.nodes.map(n => ({
      id: n.id,
      type: 'pipelineNode',
      position: n.position,
      data: { type: n.type, label: getComponent(n.type)?.label || n.type, params: n.params },
    }))
    const newEdges: Edge[] = template.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }))
    setNodes(newNodes)
    setEdges(newEdges)
    setResults(null)
    setShowResults(false)
    setShowTemplates(false)
  }, [setNodes, setEdges])

  const clearCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
    setSelectedNode(null)
    setResults(null)
    setShowResults(false)
  }, [setNodes, setEdges])

  const runPipeline = useCallback(() => {
    setRunning(true)
    setShowResults(true)
    setTimeout(() => {
      const res = generateResults(nodes)
      setResults(res)
      setRunning(false)
    }, 1500 + Math.random() * 1000)
  }, [nodes, selectedNode])

  const removeSelected = useCallback(() => {
    if (!selectedNode) return
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id))
    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
    setSelectedNode(null)
  }, [selectedNode, setNodes, setEdges])

  const selectedComp = selectedNode ? getComponent((selectedNode.data as Record<string, unknown>).type as string) : null
  const selectedParams = selectedNode ? (selectedNode.data as Record<string, unknown>).params as Record<string, string | number | boolean> : null

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Load template"
        >
          <Sparkles size={14} />
          Templates
          {showTemplates ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <button
          onClick={runPipeline}
          disabled={running || nodes.length === 0}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-colors"
          aria-label="Run pipeline"
        >
          <Play size={14} className={running ? 'animate-pulse' : ''} />
          {running ? 'Running...' : 'Run Pipeline'}
        </button>

        <div className="flex-1" />

        {selectedNode && (
          <button
            onClick={removeSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            aria-label="Remove selected component"
          >
            <Trash2 size={14} />
            Remove
          </button>
        )}

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Clear canvas"
        >
          <RotateCcw size={14} />
          Clear
        </button>
      </div>

      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => loadTemplate(t.id)}
                  className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 text-left transition-all hover:shadow-md"
                >
                  <div className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-0.5">{t.name}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{t.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <div
          ref={reactFlowWrapper}
          className="flex-1 h-full"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance as never}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Background color="#94a3b8" gap={20} size={1} />
            <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700" />
            <MiniMap
              nodeColor="#6366f1"
              maskColor="rgba(0,0,0,0.1)"
              className="!border-gray-200 dark:!border-gray-700"
            />
          </ReactFlow>
        </div>

        <AnimatePresence>
          {selectedComp && selectedParams && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shrink-0"
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedComp.color }} />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{selectedComp.category}</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{selectedComp.label}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedComp.params.map(p => (
                    <div key={p.key}>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {p.label}
                      </label>
                      {p.type === 'boolean' ? (
                        <button
                          onClick={() => updateParam(p.key, !selectedParams[p.key])}
                          className={`w-full px-3 py-1.5 text-xs rounded-lg border transition-colors text-left ${
                            selectedParams[p.key]
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {selectedParams[p.key] ? 'True' : 'False'}
                        </button>
                      ) : p.type === 'select' ? (
                        <select
                          value={selectedParams[p.key] as string}
                          onChange={e => updateParam(p.key, e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        >
                          {p.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={p.type === 'number' ? 'number' : 'text'}
                          value={selectedParams[p.key] as string | number}
                          onChange={e => updateParam(p.key, p.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                          min={p.min}
                          max={p.max}
                          step={p.step}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 240, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shrink-0"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Results</span>
                {running && (
                  <span className="flex items-center gap-1 text-xs text-primary-600">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
                    Training in progress...
                  </span>
                )}
                {results && !running && (
                  <span className="text-xs text-green-600 dark:text-green-400">Pipeline complete</span>
                )}
              </div>
              <button
                onClick={() => setShowResults(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close results"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>

            <div className="h-[calc(240px-41px)] overflow-y-auto p-4">
              {running ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500">Training model...</span>
                  </div>
                </div>
              ) : results ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(results.metrics).slice(0, 8).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{key}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                        {typeof val === 'number' ? (val < 10 ? (val * 100).toFixed(1) + '%' : val.toFixed(2)) : val}
                      </div>
                    </div>
                  ))}
                  <div className="col-span-2 md:col-span-4">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Artifacts</div>
                    <div className="flex flex-wrap gap-2">
                      {results.artifacts.map(a => (
                        <span key={a.name} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          <FileText size={10} />
                          {a.name}
                          <span className="text-gray-400">({a.value})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                  <AlertCircle size={14} className="mr-1.5" />
                  Run the pipeline to see results
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PlaygroundPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="w-56 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-3 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Components</h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Drag onto canvas</p>
        </div>

        {CATEGORIES.map(cat => {
          const items = COMPONENTS.filter(c => c.category === cat.key)
          return (
            <div key={cat.key} className="p-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  {cat.label}
                </span>
              </div>
              <div className="space-y-1">
                {items.map(comp => {
                  const Icon = ICON_MAP[comp.icon] || FileText
                  return (
                    <div
                      key={comp.type}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData('application/reactflow', comp.type)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700/50 transition-colors text-xs text-gray-700 dark:text-gray-300"
                      role="button"
                      tabIndex={0}
                      aria-label={`Drag ${comp.label}`}
                    >
                      <Icon size={14} style={{ color: comp.color }} />
                      <span className="font-medium">{comp.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <ReactFlowProvider>
        <PlaygroundCanvas />
      </ReactFlowProvider>
    </div>
  )
}
