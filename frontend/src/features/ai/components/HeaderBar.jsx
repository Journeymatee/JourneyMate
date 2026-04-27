import React from 'react'
import {
  Bot,
  Maximize2,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'

function IconButton({ children, label, onClick, disabled, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
        active
          ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
          : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

export default function HeaderBar({
  model,
  voiceEnabled,
  voiceSupported,
  onToggleVoice,
  onReset,
  onClose,
  expanded,
  onToggleExpand,
  canExpand,
  online,
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15">
          <Bot size={15} className="text-emerald-200" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-slate-950 ${
              online ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">JourneyMate AI</p>
          <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">
            Travel co-pilot · {model || 'AI'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <IconButton label="Reset chat" onClick={onReset}>
          <RotateCcw size={14} />
        </IconButton>
        <IconButton
          label={voiceEnabled ? 'Mute voice replies' : 'Enable voice replies'}
          onClick={onToggleVoice}
          disabled={!voiceSupported}
          active={voiceEnabled && voiceSupported}
        >
          {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </IconButton>
        {canExpand && (
          <IconButton
            label={expanded ? 'Exit expanded view' : 'Expand chat'}
            onClick={onToggleExpand}
            active={expanded}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </IconButton>
        )}
        <IconButton label="Close chat" onClick={onClose}>
          <X size={15} />
        </IconButton>
      </div>
    </div>
  )
}
