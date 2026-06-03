import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444']

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
}

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), 3000)
    return () => clearTimeout(timer)
  }, [active])

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: `${p.x}vw`, y: `${p.y}vh`, rotate: 0, opacity: 1 }}
            animate={{ y: '110vh', rotate: p.rotation * 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 + Math.random() * 1.5, ease: 'easeIn' }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
