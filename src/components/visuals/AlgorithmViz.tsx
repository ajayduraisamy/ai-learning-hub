import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

interface VizControlBarProps {
  playing: boolean
  onToggle: () => void
  onReset: () => void
  onStep: () => void
  speed: number
  onSpeedChange: (s: number) => void
  step: number
  totalSteps: number
}

function VizControlBar({ playing, onToggle, onReset, onStep, speed, onSpeedChange, step, totalSteps }: VizControlBarProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
      <button onClick={onReset} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400" title="Reset">
        <SkipBack size={14} />
      </button>
      <button onClick={onToggle} className="p-1.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors" title={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <button onClick={onStep} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400" title="Step forward">
        <SkipForward size={14} />
      </button>
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-2 overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${totalSteps > 0 ? (step / totalSteps) * 100 : 0}%` }} />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10 text-right">{step}/{totalSteps}</span>
      <select
        value={speed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded px-1.5 py-0.5 border-0 outline-none cursor-pointer"
      >
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={2}>2x</option>
        <option value={4}>4x</option>
      </select>
    </div>
  )
}

/* Gradient Descent Visualization */
const gdLossSurface = (w: number, b: number) => {
  const x = [-2, -1, 0, 1, 2, 3]
  const y = [0.1, 0.3, 0.5, 0.8, 1.0, 1.2]
  let loss = 0
  for (let i = 0; i < x.length; i++) {
    const pred = w * x[i] + b
    loss += (pred - y[i]) ** 2
  }
  return loss / x.length
}

const gdSteps = 20

function computeGdPath(): { step: number; w: number; b: number; loss: number }[] {
  const path: { step: number; w: number; b: number; loss: number }[] = []
  let w = -1.5, b = 0.5
  for (let i = 0; i <= gdSteps; i++) {
    const loss = gdLossSurface(w, b)
    path.push({ step: i, w, b, loss: Math.round(loss * 100) / 100 })
    const dw = (-2 * (-2 - w) + -2 * (-1 - w) + -2 * (0 - w) + -2 * (1 - w) + -2 * (2 - w) + -2 * (3 - w)) / 6 * 0.1
    const db = (2 * (0.1 - (w * -2 + b)) + 2 * (0.3 - (w * -1 + b)) + 2 * (0.5 - (w * 0 + b)) + 2 * (0.8 - (w * 1 + b)) + 2 * (1.0 - (w * 2 + b)) + 2 * (1.2 - (w * 3 + b))) / 6 * 0.1
    w -= dw * 0.5
    b -= db * 0.5
  }
  return path
}

export function GradientDescentViz() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const path = useRef(computeGdPath()).current
  const total = path.length - 1

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= total) { setPlaying(false); return s }
        return s + 1
      })
    }, 800 / speed)
    return () => clearInterval(interval)
  }, [playing, speed, total])

  const p = path[step]
  const dataPoints = [-2, -1, 0, 1, 2, 3].map((x) => ({ x, y: 0.1 + x * 0.25 + Math.random() * 0.1 }))

  return (
    <VizWrapper title="Gradient Descent" subtitle={`Step ${step}: w=${p.w.toFixed(2)}, b=${p.b.toFixed(2)}, loss=${p.loss}`}>
      <svg viewBox="0 0 300 180" className="w-full h-44">
        {/* axes */}
        <line x1="20" y1="160" x2="280" y2="160" stroke="#9ca3af" strokeWidth={1} />
        <line x1="30" y1="10" x2="30" y2="170" stroke="#9ca3af" strokeWidth={1} />
        {/* data points */}
        {dataPoints.map((pt, i) => (
          <circle key={i} cx={60 + pt.x * 50} cy={160 - pt.y * 80} r={4} fill="#3b82f6" opacity={0.6} />
        ))}
        {/* regression line */}
        <line
          x1={40} y1={160 - (p.w * -2 + p.b) * 80}
          x2={250} y2={160 - (p.w * 3 + p.b) * 80}
          stroke="#22c55e" strokeWidth={2} strokeDasharray="4 2"
        />
        {/* current prediction point */}
        <motion.circle
          key={step} initial={{ r: 0 }} animate={{ r: 6 }}
          cx={60 + 0 * 50} cy={160 - (p.w * 0 + p.b) * 80}
          fill="#ef4444" stroke="#fff" strokeWidth={2}
        />
      </svg>
      <VizControlBar playing={playing} onToggle={() => setPlaying(!playing)} onReset={() => setStep(0)} onStep={() => setStep((s) => Math.min(s + 1, total))} speed={speed} onSpeedChange={setSpeed} step={step} totalSteps={total} />
    </VizWrapper>
  )
}

/* K-Means Clustering Visualization */
const kMeansData = [
  { x: 20, y: 30 }, { x: 25, y: 35 }, { x: 22, y: 28 }, { x: 30, y: 25 },
  { x: 80, y: 70 }, { x: 85, y: 75 }, { x: 75, y: 80 }, { x: 90, y: 65 },
  { x: 50, y: 10 }, { x: 55, y: 15 }, { x: 45, y: 5 }, { x: 60, y: 20 },
]

function runKMeansStep(centroids: { x: number; y: number }[]): { centroids: { x: number; y: number }[]; assignments: number[] } {
  const newAssignments = kMeansData.map((pt) => {
    let minDist = Infinity, best = 0
    centroids.forEach((c, i) => {
      const d = Math.sqrt((pt.x - c.x) ** 2 + (pt.y - c.y) ** 2)
      if (d < minDist) { minDist = d; best = i }
    })
    return best
  })
  const newCentroids = centroids.map((_, ci) => {
    const pts = kMeansData.filter((_, i) => newAssignments[i] === ci)
    if (pts.length === 0) return { ...centroids[ci] }
    return { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length }
  })
  return { centroids: newCentroids, assignments: newAssignments }
}

function computeKMeansPath() {
  let centroids = [{ x: 35, y: 40 }, { x: 65, y: 60 }, { x: 45, y: 15 }]
  let assignments = kMeansData.map(() => 0)
  const steps: { centroids: { x: number; y: number }[]; assignments: number[] }[] = []
  for (let i = 0; i < 8; i++) {
    steps.push({ centroids: centroids.map((c) => ({ ...c })), assignments: [...assignments] })
    const result = runKMeansStep(centroids)
    centroids = result.centroids
    assignments = result.assignments
  }
  return steps
}

const kmColors = ['#3b82f6', '#22c55e', '#a855f7']

export function KMeansViz() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const path = useRef(computeKMeansPath()).current
  const total = path.length - 1

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= total) { setPlaying(false); return s }
        return s + 1
      })
    }, 1000 / speed)
    return () => clearInterval(interval)
  }, [playing, speed, total])

  const state = path[step]

  return (
    <VizWrapper title="K-Means Clustering" subtitle={`Iteration ${step}: assigning points to nearest centroid`}>
      <svg viewBox="0 0 200 140" className="w-full h-36">
        {kMeansData.map((pt, i) => {
          const cluster = state?.assignments[i] || 0
          return (
            <motion.circle
              key={i} layout
              cx={pt.x * 2} cy={pt.y * 2}
              r={5} fill={kmColors[cluster]} opacity={0.7}
              stroke="#fff" strokeWidth={1.5}
            />
          )
        })}
        {state?.centroids.map((c, i) => (
          <motion.g key={i} layout>
            <circle cx={c.x * 2} cy={c.y * 2} r={10} fill="none" stroke={kmColors[i]} strokeWidth={3} opacity={0.8} />
            <circle cx={c.x * 2} cy={c.y * 2} r={3} fill={kmColors[i]} />
          </motion.g>
        ))}
      </svg>
      <VizControlBar playing={playing} onToggle={() => setPlaying(!playing)} onReset={() => setStep(0)} onStep={() => setStep((s) => Math.min(s + 1, total))} speed={speed} onSpeedChange={setSpeed} step={step} totalSteps={total} />
    </VizWrapper>
  )
}

/* Decision Tree Visualization */
const treeDepth = 3

export function DecisionTreeViz() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const total = treeDepth

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= total) { setPlaying(false); return s }
        return s + 1
      })
    }, 1200 / speed)
    return () => clearInterval(interval)
  }, [playing, speed])

  const splits = ['Feature X < 5.2', 'Feature Y > 3.1', 'Feature Z == 0']

  return (
    <VizWrapper title="Decision Tree Splitting" subtitle={`Depth ${step}: ${splits[step] || 'Leaf'}`}>
      <div className="flex flex-col items-center h-44 justify-center">
        {[0, 1, 2].map((depth) => (
          <div key={depth} className="flex items-center gap-4 mb-2 justify-center" style={{ width: `${100 + depth * 60}%`, maxWidth: '100%' }}>
            {Array.from({ length: 2 ** depth }).map((_, i) => {
              const show = depth <= step
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.8 }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap ${
                    depth < step
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : depth === step
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {depth < step ? '✓' : depth === step ? splits[depth] : '?'}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
      <VizControlBar playing={playing} onToggle={() => setPlaying(!playing)} onReset={() => setStep(0)} onStep={() => setStep((s) => Math.min(s + 1, total))} speed={speed} onSpeedChange={setSpeed} step={step} totalSteps={total} />
    </VizWrapper>
  )
}

/* Neural Network Forward Pass */
const nnLayers = [3, 4, 4, 2]

export function NNForwardPassViz() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const total = 5

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= total) { setPlaying(false); return s }
        return s + 1
      })
    }, 1000 / speed)
    return () => clearInterval(interval)
  }, [playing, speed])

  const layerLabels = ['Input', 'Hidden 1', 'Hidden 2', 'Output']

  return (
    <VizWrapper title="Neural Network Forward Pass" subtitle={`Layer ${Math.min(step, 3)}: ${layerLabels[Math.min(step, 3)]}`}>
      <svg viewBox="0 0 300 160" className="w-full h-40">
        {nnLayers.map((neurons, li) => {
          const layerX = 40 + li * 70
          const active = li <= step
          return (
            <g key={li}>
              <text x={layerX + 15} y={15} textAnchor="middle" fontSize={8} fill="#9ca3af">{layerLabels[li]}</text>
              {Array.from({ length: neurons }).map((_, ni) => {
                const ny = 30 + (140 / (neurons + 1)) * (ni + 1)
                return (
                  <g key={ni}>
                    <motion.circle
                      cx={layerX + 15} cy={ny} r={6}
                      initial={{ fill: '#e5e7eb' }}
                      animate={{
                        fill: active ? ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b'][li % 4] : '#e5e7eb',
                        opacity: active ? 1 : 0.3,
                      }}
                      transition={{ delay: ni * 0.05 }}
                      stroke="#fff" strokeWidth={1.5}
                    />
                    {/* connections to next layer */}
                    {li < nnLayers.length - 1 && Array.from({ length: nnLayers[li + 1] }).map((_, n2) => {
                      const ny2 = 30 + (140 / (nnLayers[li + 1] + 1)) * (n2 + 1)
                      return (
                        <line key={`conn-${ni}-${n2}`} x1={layerX + 21} y1={ny} x2={layerX + 70} y2={ny2}
                          stroke={active ? '#3b82f6' : '#e5e7eb'} strokeWidth={li < step ? 0.8 : 0.3} opacity={li < step ? 0.3 : 0.1} />
                      )
                    })}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
      <VizControlBar playing={playing} onToggle={() => setPlaying(!playing)} onReset={() => setStep(0)} onStep={() => setStep((s) => Math.min(s + 1, total))} speed={speed} onSpeedChange={setSpeed} step={step} totalSteps={total} />
    </VizWrapper>
  )
}

/* Wrapper */
function VizWrapper({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
        {children}
      </div>
    </div>
  )
}

/* All algorithm visualizations carousel */
const vizComponents = [
  { id: 'gd', label: 'Gradient Descent', component: GradientDescentViz },
  { id: 'kmeans', label: 'K-Means', component: KMeansViz },
  { id: 'dt', label: 'Decision Tree', component: DecisionTreeViz },
  { id: 'nn', label: 'Neural Network', component: NNForwardPassViz },
] as const

export function AlgorithmVizCarousel() {
  const [activeViz, setActiveViz] = useState<string>('gd')

  const ActiveComponent = vizComponents.find((v) => v.id === activeViz)?.component || GradientDescentViz

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {vizComponents.map((v) => (
          <button key={v.id} onClick={() => setActiveViz(v.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeViz === v.id
                ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeViz} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
