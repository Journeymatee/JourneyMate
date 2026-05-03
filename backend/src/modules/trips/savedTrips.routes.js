'use strict'

const express = require('express')
const { requireAuth } = require('../../middleware/auth')
const controller = require('./savedTrips.controller')

const router = express.Router()

// Public — must come BEFORE the auth-protected catch-all so the public token
// route is reachable without a Bearer header.
router.get('/share/:token', controller.getPublic)

router.use(requireAuth)

router.get('/',           controller.list)
router.post('/',          controller.create)
router.get('/:id',        controller.get)
router.patch('/:id',      controller.patch)
router.delete('/:id',     controller.remove)
router.post('/:id/rotate-share', controller.rotateShareLink)

module.exports = router
