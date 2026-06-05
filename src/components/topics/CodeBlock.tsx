import { useState, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Play } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  showCopy?: boolean
  onRun?: () => void
}

export default function CodeBlock({ code, language = 'python', showCopy = true, onRun }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [code])

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-700/50">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/50">
        <span className="text-[11px] text-slate-400 font-mono">{language}</span>
        <div className="flex items-center gap-1">
          {onRun && (
            <button
              onClick={onRun}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
            >
              <Play size={10} />
              Run
            </button>
          )}
          {showCopy && (
            <button
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem', lineHeight: 1.6 }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
