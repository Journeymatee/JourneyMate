'use strict'

const express = require('express')
const { requireAuth, optionalAuth } = require('../../middleware/auth')
const controller = require('./savedTrips.controller')

const router = express.Router()

/* ── Public endpoints (anyone with the share token) ─────────────────── */
router.get('/share/:token', controller.getPublic)

// Comments + votes — read is public, write requires auth. We attach
// optionalAuth so the response can mark "this comment is mine" for the
// signed-in viewer without requiring sign-in for unauthenticated guests.
router.get(   '/share/:token/comments',         optionalAuth, controller.listComments)
router.post(  '/share/:token/comments',         optionalAuth, controller.createComment)
router.delete('/share/:token/comments/:id',     optionalAuth, controller.deleteComment)
router.get(   '/share/:token/votes',            optionalAuth, controller.getVotes)
router.post(  '/share/:token/vote',             optionalAuth, controller.vote)
router.delete('/share/:token/vote',             optionalAuth, controller.clearVote)

/* ── Owner endpoints — strict auth ──────────────────────────────────── */
router.use(requireAuth)

router.get('/',                  controller.list)
router.post('/',                 controller.create)
router.get('/:id',               controller.get)
router.patch('/:id',             controller.patch)
router.delete('/:id',            controller.remove)
router.post('/:id/rotate-share', controller.rotateShareLink)

module.exports = router
