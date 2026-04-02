'use client'

import clsx from 'clsx'

interface PresenceBadgeProps {
  name: string
  color: string
  isOnline?: boolean
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export function PresenceBadge({
  name,
  color,
  isOnline = true,
  size = 'md',
  showName = false
}: PresenceBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={clsx(
            sizeClasses[size],
            'rounded-full flex items-center justify-center text-white font-bold'
          )}
          style={{ backgroundColor: color }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <span
          className={clsx(
            dotSizes[size],
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            isOnline ? 'bg-green-500' : 'bg-slate-300'
          )}
        />
      </div>
      {showName && (
        <span className="text-sm font-medium text-slate-700">{name}</span>
      )}
    </div>
  )
}
