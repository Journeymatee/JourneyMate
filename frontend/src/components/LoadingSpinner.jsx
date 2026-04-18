import React from 'react'

export default function LoadingSpinner({ from, to }) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* Animated logo */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Glow rings */}
          <div className="absolute w-28 h-28 rounded-full border border-green-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-20 h-20 rounded-full border border-amber-500/15 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          {/* Logo */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/15 to-amber-500/15 border border-white/10 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="JourneyMate"
              className="w-12 h-12 rounded-2xl animate-pulse"
            />
          </div>
          {/* Orbiting dot green */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/60" />
          </div>
          {/* Orbiting dot amber */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.66s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60" />
          </div>
          {/* Orbiting dot white */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '1.33s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white/50" />
          </div>
        </div>

        <h2 className="font-display font-bold text-2xl text-white mb-2">
          Finding Best Plans
        </h2>
        <p className="text-slate-400 mb-2">
          {from} <span className="text-slate-600">→</span> {to}
        </p>
        <p className="text-slate-500 text-sm">Comparing Silver & Gold options...</p>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto h-1 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-amber-500 rounded-full animate-shimmer" style={{width:'60%', backgroundSize:'200% auto'}} />
        </div>
      </div>
    </div>
  )
}
