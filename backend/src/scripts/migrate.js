'use strict'

const fs = require('fs')
const path = require('path')
const { pool } = require('../config/db')
const logger = require('../lib/logger')

async function migrate() {
  const dir = path.join(__dirname, '..', 'schema')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8')
    logger.info({ msg: 'applying migration', file: f })
    await pool.query(sql)
  }
}

module.exports = { migrate }

if (require.main === module) {
  migrate()
    .then(() => { logger.info('migrations complete'); process.exit(0) })
    .catch((e) => { logger.error({ msg: 'migrate failed', err: e.message }); process.exit(1) })
}
