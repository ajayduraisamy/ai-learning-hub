import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Table, ChevronDown, ChevronRight,
  StepForward, Beaker, ArrowRight, GitBranch,
  ZoomIn, ZoomOut, Maximize2, Play
} from 'lucide-react'
import {
  ReactFlow, Background, Controls, MiniMap,
  type Node, type Edge, type NodeTypes,
  useNodesState, useEdgesState, MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { AlgorithmVizCarousel, customNodeTypes } from '@/components/visuals'

interface Step {
  title: string
  content: string
  diagram?: string
}

interface UnderstandingTabProps {
  analogy: string
  steps: Step[]
  misconceptions: { misconception: string; truth: string }[]
  comparisons?: { label: string; methodA: string; methodB: string }[]
}

const defaultNodes: Node[] = [
  { id: '1', type: 'input', position: { x: 250, y: 0 }, data: { label: 'Input' } },
  { id: '2', position: { x: 150, y: 100 }, data: { label: 'Process A' } },
  { id: '3', position: { x: 350, y: 100 }, data: { label: 'Process B' } },
  { id: '4', position: { x: 250, y: 200 }, data: { label: 'Output' } },
]

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-3', source: '1', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-4', source: '2', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: '3', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
]

const transformerNodes: Node[] = [
  { id: 'input', type: 'input', position: { x: 200, y: 0 }, data: { label: 'Input Sequence' }, style: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' } },
  { id: 'embed', position: { x: 200, y: 80 }, data: { label: 'Embedding + Positional Encoding' }, style: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' } },
  { id: 'attn', position: { x: 200, y: 160 }, data: { label: 'Multi-Head Self-Attention' }, style: { background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' } },
  { id: 'ffn', position: { x: 200, y: 240 }, data: { label: 'Feed-Forward Network' }, style: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' } },
  { id: 'norm', position: { x: 200, y: 320 }, data: { label: 'Add & Layer Norm' }, style: { background: '#d946ef', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' } },
  { id: 'output', type: 'output', position: { x: 200, y: 400 }, data: { label: 'Output' }, style: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' } },
]

const transformerEdges: Edge[] = [
  { id: 'e-input-embed', source: 'input', target: 'embed', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6366f1' } },
  { id: 'e-embed-attn', source: 'embed', target: 'attn', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8b5cf6' } },
  { id: 'e-attn-ffn', source: 'attn', target: 'ffn', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#a855f7' } },
  { id: 'e-ffn-norm', source: 'ffn', target: 'norm', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#d946ef' } },
  { id: 'e-norm-output', source: 'norm', target: 'output', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#22c55e' } },
]

const cnnNodes: Node[] = [
  { id: 'in', type: 'input', position: { x: 150, y: 0 }, data: { label: 'Input Image' }, style: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8 } },
  { id: 'conv1', position: { x: 150, y: 90 }, data: { label: 'Conv Layer 1' }, style: { background: '#06b6d4', color: '#fff', border: 'none', borderRadius: 8 } },
  { id: 'pool1', position: { x: 150, y: 170 }, data: { label: 'Pooling' }, style: { background: '#14b8a6', color: '#fff', border: 'none', borderRadius: 8 } },
  { id: 'conv2', position: { x: 150, y: 250 }, data: { label: 'Conv Layer 2' }, style: { background: '#06b6d4', color: '#fff', border: 'none', borderRadius: 8 } },
  { id: 'pool2', position: { x: 150, y: 330 }, data: { label: 'Pooling' }, style: { background: '#14b8a6', color: '#fff', border: 'none', borderRadius: 8 } },
  { id: 'flat', position: { x: 150, y: 410 }, data: { label: 'Flatten' }, style: { background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8 } },
  { id: 'fc', position: { x: 150, y: 490 }, data: { label: 'Fully Connected' }, style: { background: '#d946ef', color: '#fff', border: 'none', borderRadius: 8 } },
  { id: 'out', type: 'output', position: { x: 150, y: 570 }, data: { label: 'Classification' }, style: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8 } },
]

const cnnEdges: Edge[] = [
  { id: 'e-in-c1', source: 'in', target: 'conv1', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-c1-p1', source: 'conv1', target: 'pool1', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-p1-c2', source: 'pool1', target: 'conv2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-c2-p2', source: 'conv2', target: 'pool2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-p2-fl', source: 'pool2', target: 'flat', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-fl-fc', source: 'flat', target: 'fc', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-fc-out', source: 'fc', target: 'out', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
]

function FlowDiagram({ nodes: initialNodes, edges: initialEdges, label }: { nodes: Node[]; edges: Edge[]; label: string }) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [_edges] = useEdgesState(initialEdges)

  const nodeTypes: NodeTypes = {
    inputNode: customNodeTypes.inputNode,
    processNode: customNodeTypes.processNode,
    outputNode: customNodeTypes.outputNode,
  }

  return (
    <div className="h-[400px] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-primary-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <ZoomIn size={12} />
          <ZoomOut size={12} />
          <Maximize2 size={12} />
        </div>
      </div>
        <ReactFlow
        nodes={nodes}
        edges={_edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls showInteractive={false} className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700" />
        <MiniMap
          style={{ background: 'transparent' }}
          nodeColor={(n) => n.style?.background as string || '#94a3b8'}
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  )
}

export default function UnderstandingTab({
  analogy, steps, misconceptions, comparisons,
}: UnderstandingTabProps) {
  const [misconceptionsOpen, setMisconceptionsOpen] = useState(false)
  const [activeDiagram, setActiveDiagram] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Analogy Box */}
      <div className="bg-gradient-to-r from-accent-50 to-purple-50 dark:from-accent-900/20 dark:to-purple-900/20 rounded-xl border border-accent-200 dark:border-accent-800 p-5">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-accent-100 dark:bg-accent-900/30 shrink-0">
            <Beaker size={18} className="text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h3 className="font-semibold text-accent-800 dark:text-accent-300 text-sm mb-1">
              Think of it like this...
            </h3>
            <p className="text-sm text-accent-700 dark:text-accent-300/70 leading-relaxed italic">
              &ldquo;{analogy}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Diagrams */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={16} className="text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Architecture Diagrams</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'transformer', label: 'Transformer' },
            { id: 'cnn', label: 'CNN' },
            { id: 'flow', label: 'Generic Flow' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDiagram(activeDiagram === d.id ? null : d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeDiagram === d.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {activeDiagram === 'transformer' && (
            <motion.div key="transformer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FlowDiagram nodes={transformerNodes} edges={transformerEdges} label="Transformer Architecture Flow" />
            </motion.div>
          )}
          {activeDiagram === 'cnn' && (
            <motion.div key="cnn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FlowDiagram nodes={cnnNodes} edges={cnnEdges} label="CNN Architecture Flow" />
            </motion.div>
          )}
          {activeDiagram === 'flow' && (
            <motion.div key="flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FlowDiagram nodes={defaultNodes} edges={defaultEdges} label="Generic Process Flow" />
            </motion.div>
          )}
          {!activeDiagram && (
            <motion.p key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400 text-center py-8">
              Select a diagram above to visualize the architecture
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Algorithm Visualizations */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Play size={16} className="text-secondary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Algorithm Visualizations</h3>
        </div>
        <AlgorithmVizCarousel />
      </div>

      {/* Step-by-Step Walkthrough */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <StepForward size={16} className="text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Step-by-Step Walkthrough</h3>
        </div>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-8"
            >
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-primary-100 dark:bg-primary-900/30" />
              )}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.content}</p>
                {step.diagram && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    {step.diagram}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {comparisons && comparisons.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Table size={16} className="text-secondary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Comparison Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Aspect</th>
                  <th className="text-left py-2 pr-4 text-primary-600 dark:text-primary-400 font-semibold text-xs uppercase tracking-wider">Method A</th>
                  <th className="text-left py-2 text-secondary-600 dark:text-secondary-400 font-semibold text-xs uppercase tracking-wider">Method B</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comp, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{comp.label}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{comp.methodA}</td>
                    <td className="py-2.5 text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{comp.methodB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Common Misconceptions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setMisconceptionsOpen(!misconceptionsOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Common Misconceptions
            </h3>
            <span className="text-xs text-gray-400">({misconceptions.length})</span>
          </div>
          {misconceptionsOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </button>
        <AnimatePresence>
          {misconceptionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 pb-4 space-y-3">
                {misconceptions.map((m, i) => (
                  <div key={i} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
                    <div className="flex items-start gap-2 mb-1">
                      <ArrowRight size={12} className="mt-1 shrink-0 text-orange-500" />
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                        Misconception: {m.misconception}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400/80 ml-5">{m.truth}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
