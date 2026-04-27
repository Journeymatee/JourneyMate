import React, { useEffect, useState } from 'react'
import HeaderBar from './components/HeaderBar'
import MessageList from './components/MessageList'
import Composer from './components/Composer'
import { useChatStream } from './hooks/useChatStream'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { useTextToSpeech } from './hooks/useTextToSpeech'

export default function ChatPanel({ onClose, expanded, onToggleExpand, canExpand }) {
  const [input, setInput] = useState('')

  const tts = useTextToSpeech()
  const chat = useChatStream({ onSpeak: tts.speak })

  const speech = useSpeechRecognition({
    lang: chat.inputLang,
    disabled: chat.sending,
    onTranscript: (transcript) => {
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
    },
  })

  useEffect(() => {
    return () => {
      tts.cancel()
      speech.stop()
    }
  }, [speech, tts])

  const handleSubmit = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    chat.send(text)
  }

  const handleQuickPick = (prompt) => {
    if (chat.sending) return
    setInput('')
    chat.send(prompt)
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-slate-950/95 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <HeaderBar
        model={chat.activeModel}
        voiceEnabled={tts.enabled}
        voiceSupported={tts.supported}
        onToggleVoice={tts.toggle}
        onReset={chat.reset}
        onClose={onClose}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        canExpand={canExpand}
        online={typeof navigator === 'undefined' ? true : navigator.onLine}
      />

      <MessageList
        messages={chat.messages}
        sending={chat.sending}
        onPickFollowUp={handleQuickPick}
        onPickPrompt={handleQuickPick}
      />

      <Composer
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onStop={chat.stop}
        sending={chat.sending}
        listening={speech.listening}
        speechSupported={speech.supported}
        onToggleListening={speech.toggle}
      />
    </div>
  )
}
