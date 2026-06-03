import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

export function InputNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-semibold shadow-md border-2 border-blue-400">
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/80" />
        {data.label as string}
      </div>
    </div>
  )
}

export function ProcessNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2.5 rounded-lg bg-purple-500 text-white text-xs font-semibold shadow-md border-2 border-purple-400">
      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400" />
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-purple-300/50" />
        {data.label as string}
      </div>
    </div>
  )
}

export function OutputNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold shadow-md border-2 border-green-400">
      <Handle type="target" position={Position.Top} className="!bg-green-400" />
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/80" />
        {data.label as string}
      </div>
    </div>
  )
}

export function DecisionNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-3 bg-amber-500 text-white text-xs font-semibold shadow-md border-2 border-amber-400"
      style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-amber-400" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-amber-400" />
      <div className="flex items-center justify-center gap-1">
        <div className="w-2 h-2 rotate-45 bg-amber-300/50" />
        {data.label as string}
      </div>
    </div>
  )
}

export function DataNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2 rounded-tr-xl rounded-tl-md rounded-br-md rounded-bl-xl bg-cyan-500 text-white text-xs font-semibold shadow-md border-2 border-cyan-400"
      style={{ borderBottomLeftRadius: 0 }}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400" />
      <div className="flex items-center gap-2">
        <div className="w-3 h-4 rounded-sm bg-cyan-300/50" />
        {data.label as string}
      </div>
    </div>
  )
}

export const customNodeTypes = {
  inputNode: memo(InputNode),
  processNode: memo(ProcessNode),
  outputNode: memo(OutputNode),
  decisionNode: memo(DecisionNode),
  dataNode: memo(DataNode),
}
