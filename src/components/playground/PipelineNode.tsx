import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { getComponent } from './types'

function PipelineNodeComponent({ data, selected }: NodeProps) {
  const comp = getComponent(data.type as string)
  if (!comp) return null

  const nodeColor = selected ? comp.color : `${comp.color}cc`
  const handles = []

  for (let i = 0; i < comp.inputs; i++) {
    handles.push(
      <Handle
        key={`input-${i}`}
        type="target"
        position={Position.Left}
        id={i === 0 ? undefined : `input-${i}`}
        style={{ top: `${25 + (i * 30)}%` }}
        className="!w-3 !h-3 !border-2 !border-white"
      />
    )
  }

  for (let i = 0; i < comp.outputs; i++) {
    handles.push(
      <Handle
        key={`output-${i}`}
        type="source"
        position={Position.Right}
        id={i === 0 ? undefined : `output-${i}`}
        style={{ top: `${25 + (i * 30)}%` }}
        className="!w-3 !h-3 !border-2 !border-white"
      />
    )
  }

  return (
    <div
      className="px-3 py-2 rounded-xl shadow-lg border-2 transition-all min-w-[140px]"
      style={{
        backgroundColor: nodeColor,
        borderColor: selected ? '#fff' : 'transparent',
        color: '#fff',
      }}
    >
      {handles}
      <div className="text-[10px] uppercase tracking-wider opacity-80 font-medium">
        {comp.category}
      </div>
      <div className="text-sm font-bold leading-tight mt-0.5">
        {data.label as string || comp.label}
      </div>
    </div>
  )
}

export const PipelineNode = memo(PipelineNodeComponent)
