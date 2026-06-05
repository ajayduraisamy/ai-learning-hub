import { useState, useCallback, useRef, useEffect } from 'react'
import { Play, RotateCcw, Copy, Check, Lightbulb } from 'lucide-react'

interface CodePlaygroundProps {
  instructions: string
  initialCode: string
  language: string
  expectedOutput?: string
  hint?: string
}

export default function CodePlayground({ instructions, initialCode, language, expectedOutput, hint }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setCode(initialCode)
    setOutput('')
    setShowHint(false)
  }, [initialCode])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [code])

  const handleRun = useCallback(() => {
    setOutput('')
    if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
      try {
        const result = new Function(code)()
        setOutput(result !== undefined ? String(result) : 'Code ran successfully (no return value)')
      } catch (err) {
        setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`)
      }
    } else {
      setOutput(`[${language}] Code copied to clipboard. Run it in your local ${language === 'python' ? 'Python' : language} environment to see output.\n\nExpected output:\n${expectedOutput || '(output depends on your implementation)'}`)
    }
  }, [code, language, expectedOutput])

  const handleReset = useCallback(() => {
    setCode(initialCode)
    setOutput('')
    setShowHint(false)
  }, [initialCode])

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800">
        <Lightbulb size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{instructions}</p>
          {hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="mt-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showHint ? 'Hide hint' : 'Need a hint?'}
            </button>
          )}
          {showHint && hint && (
            <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 italic">{hint}</p>
          )}
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-700/50">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">{language}</span>
            <span className="text-[9px] text-slate-500 italic">editable</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRun}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors"
            >
              <Play size={10} />
              Run
            </button>
            <button
              onClick={handleReset}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <RotateCcw size={12} />
            </button>
            <button
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[0.8rem] leading-relaxed p-4 outline-none resize-y min-h-[100px]"
          spellCheck={false}
        />
      </div>

      {output && (
        <div className="rounded-xl overflow-hidden border border-slate-700/50">
          <div className="px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/50">
            <span className="text-[11px] text-slate-400 font-semibold">Output</span>
          </div>
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[0.8rem] leading-relaxed p-4 m-0 whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
