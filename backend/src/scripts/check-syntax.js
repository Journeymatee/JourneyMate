'use strict'

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const backendRoot = path.resolve(__dirname, '..', '..')
const ignoreDirs = new Set(['node_modules', '.git'])
const jsFiles = []

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (ignoreDirs.has(entry.name)) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (entry.isFile() && fullPath.endsWith('.js')) {
      jsFiles.push(fullPath)
    }
  }
}

walk(backendRoot)

for (const file of jsFiles) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' })
}

console.log(`Syntax OK: checked ${jsFiles.length} JavaScript files.`)
