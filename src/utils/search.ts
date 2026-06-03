import { phases } from '@/data/sidebarData'
import { getTopicContent } from '@/data/topicContent'

export interface SearchResult {
  id: string
  title: string
  phaseTitle: string
  phaseId: string
  difficulty: string
  estimatedTime: string
  tags: string[]
  matchType: 'title' | 'tag' | 'phase' | 'content'
  snippet: string
}

function extractSnippet(text: string, query: string, maxLen = 120): string {
  const lower = text.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? '...' : '')
  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, idx + query.length + 60)
  let snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')
  if (snippet.length > maxLen) snippet = snippet.slice(0, maxLen) + '...'
  return snippet
}

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t.includes(q)) return true
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function matchScore(text: string, query: string): number {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  const words = q.split(/\s+/)
  const wordScore = words.filter(w => t.includes(w)).length / words.length * 40
  const dist = levenshtein(t.slice(0, Math.min(t.length, q.length + 3)), q)
  const fuzzyScore = dist <= 2 ? 30 : dist <= 3 ? 15 : 0
  return Math.max(wordScore, fuzzyScore)
}

let indexCache: SearchResult[] | null = null

function buildIndex(): SearchResult[] {
  if (indexCache) return indexCache
  const results: SearchResult[] = []
  for (const phase of phases) {
    for (const topic of phase.topics) {
      let content: ReturnType<typeof getTopicContent> | null = null
      try { content = getTopicContent(topic.id) } catch { /* ignore */ }
      results.push({
        id: topic.id,
        title: topic.title,
        phaseTitle: phase.title,
        phaseId: phase.id,
        difficulty: content?.difficulty ?? 'Beginner',
        estimatedTime: content?.estimatedTime ?? '45 minutes',
        tags: content?.tags ?? [],
        matchType: 'title',
        snippet: '',
      })
    }
  }
  indexCache = results
  return results
}

export function clearSearchCache() {
  indexCache = null
}

export function search(query: string, limit = 50): SearchResult[] {
  if (!query.trim()) return []
  const q = query.trim()
  const index = buildIndex()
  const scored: { item: SearchResult; score: number }[] = []
  const seen = new Set<string>()
  for (const item of index) {
    let bestScore = 0
    let matchType: SearchResult['matchType'] = 'title'
    let snippet = ''
    const titleScore = matchScore(item.title, q)
    if (titleScore > 0) {
      bestScore = Math.max(bestScore, titleScore + 10)
      matchType = 'title'
      snippet = extractSnippet(item.title, q)
    }
    for (const tag of item.tags) {
      const tagScore = matchScore(tag, q)
      if (tagScore > bestScore) {
        bestScore = tagScore
        matchType = 'tag'
        snippet = extractSnippet(tag, q)
      }
    }
    const phaseScore = matchScore(item.phaseTitle, q)
    if (phaseScore > bestScore) {
      bestScore = phaseScore
      matchType = 'phase'
      snippet = extractSnippet(item.phaseTitle, q)
    }
    const titleWords = item.title.toLowerCase().split(/\s+/)
    const qWords = q.toLowerCase().split(/\s+/)
    const allWordsMatch = qWords.every(qw => titleWords.some(tw => tw.includes(qw) || qw.includes(tw)))
    if (allWordsMatch && bestScore < 40) {
      bestScore = 40
      matchType = 'title'
    }
    if (bestScore >= 15) {
      seen.add(item.id)
      if (!snippet) snippet = extractSnippet(item.title, q)
      scored.push({ item: { ...item, matchType, snippet }, score: bestScore })
    }
  }
  if (q.length >= 3) {
    for (const item of index) {
      if (seen.has(item.id)) continue
      if (fuzzyMatch(item.title, q) || fuzzyMatch(item.phaseTitle, q)) {
        let matchType: SearchResult['matchType'] = 'title'
        const titleOk = fuzzyMatch(item.title, q)
        matchType = titleOk ? 'title' : 'phase'
        const snippet = extractSnippet(titleOk ? item.title : item.phaseTitle, q)
        scored.push({ item: { ...item, matchType, snippet }, score: 15 })
      }
    }
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(s => s.item)
}

export function highlightText(text: string, query: string): { text: string; segments: { text: string; highlighted: boolean }[] } {
  if (!query.trim()) return { text, segments: [{ text, highlighted: false }] }
  const q = query.toLowerCase()
  const lower = text.toLowerCase()
  const segments: { text: string; highlighted: boolean }[] = []
  let lastIdx = 0
  let idx = lower.indexOf(q)
  while (idx !== -1) {
    if (idx > lastIdx) segments.push({ text: text.slice(lastIdx, idx), highlighted: false })
    segments.push({ text: text.slice(idx, idx + q.length), highlighted: true })
    lastIdx = idx + q.length
    idx = lower.indexOf(q, lastIdx)
  }
  if (lastIdx < text.length) segments.push({ text: text.slice(lastIdx), highlighted: false })
  if (segments.length === 0) segments.push({ text, highlighted: false })
  return { text, segments }
}

export function getSearchSuggestions(query: string): string[] {
  const q = query.toLowerCase()
  const suggestions: string[] = []
  for (const phase of phases) {
    for (const topic of phase.topics) {
      const words = topic.title.toLowerCase().split(/\s+/)
      for (const word of words) {
        if (word.length >= 3 && word.startsWith(q) && !suggestions.includes(word)) {
          suggestions.push(word)
        }
      }
    }
  }
  const allPhases = phases.map(p => p.title.toLowerCase().replace(/phase \d+: /i, ''))
  for (const p of allPhases) {
    const words = p.split(/\s+/)
    for (const word of words) {
      if (word.length >= 3 && word.startsWith(q) && !suggestions.includes(word)) {
        suggestions.push(word)
      }
    }
  }
  return suggestions.slice(0, 5)
}
