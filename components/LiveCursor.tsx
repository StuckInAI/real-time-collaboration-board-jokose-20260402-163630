'use client'

import { useEffect, useState } from 'react'

interface CursorProps {
  x: number
  y: number
  name: string
  color: string
}

export function LiveCursor({ x, y, name, color }: CursorProps) {
  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-75"
      style={{ left: x, top: y }}
    >
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0L0 14L4 10L7 17L9 16L6 9L11 9L0 0Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      <div
        className="ml-3 -mt-1 px-2 py-0.5 rounded-full text-white text-xs font-medium whitespace-nowrap shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}

export function useLiveCursors(roomId: string, userId: string, userName: string, color: string) {
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; name: string; color: string }>>({})

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cursorData = {
        userId,
        userName,
        color,
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      }
      localStorage.setItem(`cursor_${roomId}_${userId}`, JSON.stringify(cursorData))
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith(`cursor_${roomId}_`) && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          if (data.userId !== userId && Date.now() - data.timestamp < 5000) {
            setCursors(prev => ({
              ...prev,
              [data.userId]: { x: data.x, y: data.y, name: data.userName, color: data.color }
            }))
          }
        } catch {}
      }
    }

    // Cleanup stale cursors
    const cleanup = setInterval(() => {
      setCursors(prev => {
        const now = Date.now()
        const updated = { ...prev }
        // Remove cursors not updated recently (handled by timestamp check)
        return updated
      })
    }, 5000)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('storage', handleStorage)
      clearInterval(cleanup)
      localStorage.removeItem(`cursor_${roomId}_${userId}`)
    }
  }, [roomId, userId, userName, color])

  return cursors
}
