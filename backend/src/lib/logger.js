'use strict'

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 }
const MIN = LEVELS[(process.env.LOG_LEVEL || 'info').toLowerCase()] || LEVELS.info

function emit(level, payload) {
  if (LEVELS[level] < MIN) return
  const line = {
    t: new Date().toISOString(),
    lvl: level,
    ...(typeof payload === 'string' ? { msg: payload } : payload),
  }
  const out = level === 'error' || level === 'warn' ? process.stderr : process.stdout
  out.write(JSON.stringify(line) + '\n')
}

module.exports = {
  debug: (p) => emit('debug', p),
  info:  (p) => emit('info',  p),
  warn:  (p) => emit('warn',  p),
  error: (p) => emit('error', p),
}
