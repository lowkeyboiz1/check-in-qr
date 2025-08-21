'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAtom } from 'jotai'
import { floatingAnimationsAtom } from '@/store/atoms'

export function FloatingAnimation() {
  const [floatingAnimations] = useAtom(floatingAnimationsAtom)

  return (
    <AnimatePresence>
      {floatingAnimations.map((animation) => (
        <motion.div
          key={animation.id}
          initial={{
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1
          }}
          animate={{
            opacity: 0,
            y: -40,
            scale: 1.2
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1,
            ease: 'easeOut',
            opacity: { delay: 0.6, duration: 0.4 }
          }}
          style={{
            position: 'fixed',
            left: animation.x,
            top: animation.y,
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#10b981',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          + 🐳💕
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
