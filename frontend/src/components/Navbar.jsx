import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Workflow,
  MapPin,
  BookOpen,
  Info,
  ChevronRight,
  Crown,
  Mail,
  Sparkles,
  Radar,
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

// Order shown to logged-out users: How it Works → Popular Routes → Blog → About.
// Logged-in users see "Saved" inserted just before "About" so the user-only link
// sits next to the personal "About" link, keeping the public-first → personal
// reading flow on the right side of the bar.
const PUBLIC_NAV_LINKS = [
  { to: '/how-it-works', label: 'How it Works' },
  { to: '/popular-routes', label: 'Popular Routes' },
  { to: '/live-search', label: 'Live Search', accent: true },
  { to: '/blog', label: 'Blog' },
]
const SAVED_LINK    = { to: '/saved',       label: 'Saved' }
const BOOKINGS_LINK = { to: '/my-bookings', label: 'My bookings' }
const ABOUT_LINK    = { to: '/about',       label: 'About' }
const ADMIN_LINK = { to: '/admin', label: 'Admin', adminOnly: true }

// Drawer sections (mobile only) — icon, description and a tinted gradient
// per item give the menu real visual hierarchy. Order matches the desktop
// header so users see the same mental model on every screen size.
//
// IMPORTANT: each `wrap` / `icon` value below is a fully-formed Tailwind
// class string with `dark:` prefixes baked in. This is deliberate — Tailwind
// JIT scans source files for complete class strings, so building class names
// at runtime via interpolation (e.g. `dark:${variant}`) would silently fail
// because the generated CSS would never include those utilities.
const TINT = {
  sky: {
    wrap: 'bg-gradient-to-br from-sky-100 to-sky-50 ring-1 ring-sky-300/60 dark:from-sky-500/25 dark:to-cyan-500/15 dark:ring-sky-400/30',
    icon: 'text-sky-700 dark:text-sky-300',
  },
  emerald: {
    wrap: 'bg-gradient-to-br from-emerald-100 to-green-50 ring-1 ring-emerald-300/60 dark:from-emerald-500/25 dark:to-green-500/15 dark:ring-emerald-400/30',
    icon: 'text-emerald-700 dark:text-emerald-300',
  },
  amber: {
    wrap: 'bg-gradient-to-br from-amber-100 to-orange-50 ring-1 ring-amber-300/60 dark:from-amber-500/25 dark:to-orange-500/15 dark:ring-amber-400/30',
    icon: 'text-amber-700 dark:text-amber-300',
  },
  indigo: {
    wrap: 'bg-gradient-to-br from-indigo-100 to-blue-50 ring-1 ring-indigo-300/60 dark:from-indigo-500/25 dark:to-blue-500/15 dark:ring-indigo-400/30',
    icon: 'text-indigo-700 dark:text-indigo-300',
  },
  teal: {
    wrap: 'bg-gradient-to-br from-emerald-100 to-teal-50 ring-1 ring-teal-300/60 dark:from-emerald-500/25 dark:to-teal-500/15 dark:ring-emerald-400/30',
    icon: 'text-teal-700 dark:text-emerald-300',
  },
  yellow: {
    wrap: 'bg-gradient-to-br from-yellow-100 to-amber-50 ring-1 ring-amber-300/60 dark:from-yellow-500/25 dark:to-amber-500/15 dark:ring-yellow-400/30',
    icon: 'text-amber-700 dark:text-yellow-300',
  },
  rose: {
    wrap: 'bg-gradient-to-br from-rose-100 to-pink-50 ring-1 ring-rose-300/60 dark:from-rose-500/25 dark:to-pink-500/15 dark:ring-rose-400/30',
    icon: 'text-rose-700 dark:text-rose-300',
  },
  violet: {
    wrap: 'bg-gradient-to-br from-violet-100 to-fuchsia-50 ring-1 ring-violet-300/60 dark:from-violet-500/25 dark:to-fuchsia-500/15 dark:ring-violet-400/30',
    icon: 'text-violet-700 dark:text-violet-300',
  },
}

const DISCOVER_LINKS = [
  { to: '/how-it-works',   label: 'How it Works',   desc: 'Silver vs Gold in 30 seconds',     Icon: Workflow,  tint: TINT.sky },
  { to: '/popular-routes', label: 'Popular Routes', desc: 'Top picks across India',           Icon: MapPin,    tint: TINT.emerald },
  { to: '/live-search',    label: 'Live Search',    desc: 'Real-time trains, flights, hotels',Icon: Radar,     tint: TINT.violet },
  { to: '/blog',           label: 'Blog',           desc: 'Stories, tips & guides',           Icon: BookOpen,  tint: TINT.amber },
]

const ABOUT_DRAWER_ITEM = {
  to: '/about', label: 'About', desc: 'The team behind JourneyMate', Icon: Info, tint: TINT.indigo,
}

const SAVED_DRAWER_ITEM = {
  to: '/saved', label: 'Saved trips', desc: 'Your private wishlist', Icon: Sparkles, tint: TINT.teal,
}

const BOOKINGS_DRAWER_ITEM = {
  to: '/my-bookings', label: 'My bookings', desc: 'Confirmed trains, flights & hotels', Icon: Radar, tint: TINT.emerald,
}

const MORE_LINKS = [
  { to: '/pricing', label: 'Pricing', desc: 'Free forever for travellers', Icon: Crown, tint: TINT.yellow },
  { to: '/contact', label: 'Contact', desc: 'Talk to a real human',        Icon: Mail,  tint: TINT.rose },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Final link order:
  //   How it Works → Popular Routes → Blog → (Saved)? → About → (Admin)?
  // i.e. About is intentionally *after* the user-only "Saved" link so the bar
  // reads "public pages → personal pages → about/credits" left-to-right.
  const navLinks = useMemo(() => {
    const links = [...PUBLIC_NAV_LINKS]
    if (user) {
      links.push(BOOKINGS_LINK)
      links.push(SAVED_LINK)
    }
    links.push(ABOUT_LINK)
    if (user?.isAdmin) links.push(ADMIN_LINK)
    return links
  }, [user?.id, user?.isAdmin])

  const firstName = useMemo(() => {
    const raw = user?.name || user?.email || ''
    if (!raw) return 'Traveler'
    return String(raw).split(/[\s@]/)[0] || 'Traveler'
  }, [user?.name, user?.email])

  const initial = useMemo(
    () => (user?.name || user?.email || 'T').trim().charAt(0).toUpperCase() || 'T',
    [user?.name, user?.email]
  )

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when the viewport widens past the `lg` breakpoint
  // (1024px) — at that size the inline nav rail takes over.
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close drawer when route changes (e.g. user taps a link).
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Lock background scroll while the drawer is open and close on Escape.
  // We freeze the `body` in place using `position: fixed` so iOS Safari can't
  // bounce-scroll the page underneath, and restore scroll position on close.
  useEffect(() => {
    if (!menuOpen) return undefined
    const scrollY = window.scrollY || window.pageYOffset || 0
    const body = document.body
    const html = document.documentElement
    const prev = {
      bodyPosition:    body.style.position,
      bodyTop:         body.style.top,
      bodyLeft:        body.style.left,
      bodyRight:       body.style.right,
      bodyWidth:       body.style.width,
      bodyOverflow:    body.style.overflow,
      htmlOverflow:    html.style.overflow,
      htmlOverscroll:  html.style.overscrollBehavior,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'contain'

    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)

    return () => {
      body.style.position    = prev.bodyPosition
      body.style.top         = prev.bodyTop
      body.style.left        = prev.bodyLeft
      body.style.right       = prev.bodyRight
      body.style.width       = prev.bodyWidth
      body.style.overflow    = prev.bodyOverflow
      html.style.overflow    = prev.htmlOverflow
      html.style.overscrollBehavior = prev.htmlOverscroll
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-white/8 py-2.5 shadow-lg shadow-black/30'
          : 'py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl 3xl:max-w-[1680px] 4xl:max-w-[2000px] mx-auto px-3 sm:px-6 3xl:px-10 flex items-center justify-between gap-2 sm:gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group min-w-0"
          onClick={() => setMenuOpen(false)}
        >
          <div className="relative shrink-0">
            <img
              src="/logo.svg"
              alt="JourneyMate"
              className="w-8 h-8 sm:w-9 sm:h-9 3xl:w-10 3xl:h-10 rounded-xl shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform duration-200"
            />
            {/* Glow ring on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/0 to-amber-500/0 group-hover:from-green-500/20 group-hover:to-amber-500/20 transition-all duration-300" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-bold text-sm 2xs:text-base sm:text-lg 3xl:text-xl tracking-tight text-white block leading-tight truncate">
              JourneyMate
            </span>
            <span className="text-[10px] 3xl:text-[11px] text-slate-500 leading-none hidden sm:block">Smart Travel Comparison</span>
          </div>
        </Link>

        {/* Desktop nav links — show from `lg` so 5–6 links never overflow on tablets */}
        <div className="hidden lg:flex items-center gap-1 3xl:gap-2 min-w-0">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 xl:px-4 py-2 rounded-xl text-sm 3xl:text-base font-medium transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5 ${
                  link.adminOnly
                    ? isActive
                      ? 'text-white bg-gradient-to-r from-violet-500/20 to-cyan-500/15 border border-violet-500/30'
                      : 'text-violet-300 hover:text-white hover:bg-violet-500/10 border border-violet-500/20'
                    : link.accent
                      ? isActive
                        ? 'text-white bg-gradient-to-r from-emerald-500/25 to-cyan-500/20 border border-emerald-400/40'
                        : 'text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white hover:bg-emerald-500/10 border border-emerald-400/30 dark:border-emerald-400/20'
                      : isActive
                        ? 'text-white bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {link.adminOnly && <ShieldCheck size={13} />}
              {link.accent && (
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              )}
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
          {user && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                {(user.name || user.email || 'T')[0].toUpperCase()}
              </div>
              <span className="text-xs text-slate-300 max-w-[120px] truncate">
                {user.name?.split(' ')[0] || 'Traveler'}
              </span>
            </div>
          )}

          {/* Theme toggle — desktop only (lg+) */}
          <ThemeToggle className="hidden lg:flex" />

          <button
            type="button"
            onClick={() => { logout(); setMenuOpen(false) }}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-3 lg:px-4 py-2 rounded-xl bg-white/6 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 transition-all duration-200"
            title="Log out"
          >
            <LogOut size={15} />
            <span className="hidden lg:inline text-xs">Log out</span>
          </button>

          {/* Theme toggle + Hamburger — side-by-side on mobile/tablet (<lg) */}
          <div className="lg:hidden flex items-center gap-1.5">
            <ThemeToggle />
            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              <div className={`transition-transform duration-200 ${menuOpen ? 'rotate-90' : 'rotate-0'}`}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile + tablet drawer is rendered via a portal so no ancestor's
          stacking/transform context can clip it. Hidden from `lg` upward. */}
      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        logout={logout}
        firstName={firstName}
        initial={initial}
      />
    </nav>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
 * MobileDrawer — portal-rendered, locked to viewport using 100dvh, designed
 * to never overlap or be overlapped by anything else on the page.
 * ──────────────────────────────────────────────────────────────────────── */

function MobileDrawer({ open, onClose, user, logout, firstName, initial }) {
  // Render only in the browser; bail during SSR.
  if (typeof document === 'undefined') return null

  const overlay = (
    <div
      className="lg:hidden fixed inset-0"
      style={{
        // 100dvh follows the dynamic viewport on mobile (excludes browser UI),
        // so the drawer never gets cut off by the address bar or home indicator.
        height: '100dvh',
        zIndex: 2147483646,
        pointerEvents: open ? 'auto' : 'none',
      }}
      aria-hidden={!open}
    >
      {/* Dim, blurred backdrop covering the *entire* viewport */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Sliding panel
          Light-mode default (white sheet) + `dark:` variants restore the
          original obsidian look. We bypass the global slate→white remap
          in index.css by setting an explicit white background here. */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={`absolute top-0 right-0 w-[88vw] max-w-[400px] flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] border-l shadow-[-12px_0_40px_-8px_rgba(15,23,42,0.18)] bg-white border-slate-900/8 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:border-white/10 dark:shadow-[0_0_60px_rgba(0,0,0,0.6)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ height: '100dvh' }}
      >
        {/* Ambient brand glow — kept very faint so the panel reads as a
            calm surface, not a glowing toy. Disabled in light mode so the
            white sheet stays clean. */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full hidden dark:block bg-emerald-500/[0.08] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-72 h-72 rounded-full hidden dark:block bg-amber-500/[0.06] blur-3xl" aria-hidden />

        {/* Header — slim, neutral, with a hairline divider. */}
        <div className="relative flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3.5 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={onClose}>
            <img src="/logo.svg" alt="" className="w-9 h-9 rounded-xl shadow-md shadow-emerald-500/20" />
            <div className="min-w-0">
              <div className="font-display font-bold leading-tight tracking-tight truncate text-slate-900 dark:text-white">JourneyMate</div>
              <div className="text-[10px] leading-none mt-0.5 tracking-wide truncate text-slate-500">Smart travel comparison</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 touch-manipulation shrink-0 ml-2 bg-slate-900/[0.04] hover:bg-slate-900/[0.08] border border-slate-900/10 text-slate-600 hover:text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 shrink-0">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-900/10 to-transparent dark:via-white/10" />
        </div>

        {/* Scrollable body */}
        <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5 space-y-6">
          {/* Greeting card — premium "account" tile. */}
          {user && (
            <div className="relative overflow-hidden rounded-2xl p-4 border border-slate-900/8 bg-gradient-to-br from-emerald-50 via-white to-amber-50 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/[0.10] dark:via-slate-900/55 dark:to-amber-500/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-amber-300/30 dark:bg-amber-500/15 blur-2xl" aria-hidden />
              <div className="relative flex items-center gap-3.5">
                <div className="relative shrink-0">
                  {/* Conic-gradient ring frame for the avatar — a small but
                      hugely "expensive-looking" detail. */}
                  <span
                    aria-hidden
                    className="absolute -inset-[3px] rounded-full opacity-90"
                    style={{
                      background:
                        'conic-gradient(from 180deg at 50% 50%, #34d399 0deg, #fbbf24 140deg, #f472b6 240deg, #34d399 360deg)',
                    }}
                  />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/30 ring-2 ring-white dark:ring-slate-950">
                    {initial}
                  </div>
                  <span
                    aria-hidden
                    title="Online"
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.16em] font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-300/85">
                    <Sparkles size={10} />
                    Welcome back
                  </div>
                  <div className="text-[15px] font-semibold truncate mt-0.5 tracking-tight text-slate-900 dark:text-white">
                    Hi, {firstName}
                  </div>
                  <div className="text-[11px] truncate text-slate-500 dark:text-slate-400">{user.email}</div>
                </div>
              </div>
            </div>
          )}

          <DrawerSection title="Discover">
            {DISCOVER_LINKS.map((item) => (
              <DrawerItem key={item.to || item.label} item={item} onNavigate={onClose} />
            ))}
            {user && <DrawerItem item={BOOKINGS_DRAWER_ITEM} onNavigate={onClose} />}
            {user && <DrawerItem item={SAVED_DRAWER_ITEM} onNavigate={onClose} />}
            <DrawerItem item={ABOUT_DRAWER_ITEM} onNavigate={onClose} />
          </DrawerSection>

          <DrawerSection title="More">
            {MORE_LINKS.map((item) => (
              <DrawerItem key={item.to || item.label} item={item} onNavigate={onClose} />
            ))}

            {user?.isAdmin && (
              <DrawerItem
                onNavigate={onClose}
                item={{
                  to: '/admin',
                  label: 'Admin Console',
                  desc: 'Backstage controls',
                  Icon: ShieldCheck,
                  tint: TINT.violet,
                }}
              />
            )}
          </DrawerSection>
        </div>

        {/* Footer — pinned, never overflows; safe-area aware on iOS.
            Light mode: solid white-95 with hairline divider; dark mode:
            translucent slate strip with brand-emerald accent line above. */}
        <div
          className="relative shrink-0 px-4 pt-3.5 pb-4 space-y-3 border-t bg-white/95 backdrop-blur-xl border-slate-900/8 dark:bg-slate-950/75 dark:border-white/8"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent dark:via-emerald-500/30" aria-hidden />

          {/* Sign in / Sign out */}
          {user ? (
            <button
              type="button"
              onClick={() => { logout(); onClose() }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-2xl transition-all duration-200 group active:scale-[0.99] touch-manipulation bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 dark:bg-white/5 dark:hover:bg-rose-500/10 dark:border-white/10 dark:hover:border-rose-500/30 dark:text-slate-300 dark:hover:text-rose-300"
            >
              <LogOut size={15} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 text-white dark:text-slate-950 hover:brightness-110 transition-all duration-200 shadow-lg shadow-emerald-500/30 active:scale-[0.99] touch-manipulation"
            >
              Sign in
            </Link>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] tracking-wide text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-400">v1.0</span>
            <span aria-hidden className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>Made with</span>
            <span aria-hidden className="text-rose-500 dark:text-rose-400">♥</span>
            <span>in India</span>
          </div>
        </div>
      </aside>
    </div>
  )

  return createPortal(overlay, document.body)
}

function DrawerSection({ title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 px-2 mb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </span>
        <span
          aria-hidden
          className="flex-1 h-px bg-gradient-to-r from-slate-900/12 via-slate-900/6 to-transparent dark:from-white/10 dark:via-white/5"
        />
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

/**
 * DrawerItem — single nav row.
 *
 * Uses Tailwind's `dark:` variant to render two distinct looks:
 *   • Light mode → cream surface, saturated 700-weight icons in tinted-100
 *     tiles, slate ink labels, hairline borders.
 *   • Dark mode  → translucent slate surface, pastel 300-weight icons in
 *     low-alpha brand tiles, soft white labels.
 *
 * `tint.wrap` / `tint.icon` are pre-formed strings from the TINT map so
 * Tailwind's JIT picks them up at build time.
 */
function DrawerItem({ item, onNavigate }) {
  const { to, label, desc, Icon, tint } = item
  const fallbackIconCls = 'text-slate-700 dark:text-white'

  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative group flex items-center gap-3 px-2.5 py-2.5 rounded-xl border transition-all duration-200 active:scale-[0.99] touch-manipulation ${
          isActive
            ? 'bg-emerald-50 border-emerald-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-white/[0.06] dark:border-white/12 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'bg-transparent border-transparent hover:bg-slate-900/[0.03] hover:border-slate-900/10 dark:hover:bg-white/5 dark:hover:border-white/10'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator — a soft brand stripe down the left edge. */}
          {isActive && (
            <span
              aria-hidden
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-emerald-500 to-amber-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
            />
          )}

          <div
            className={`relative w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] group-hover:shadow-md group-hover:shadow-slate-900/10 dark:group-hover:shadow-lg dark:group-hover:shadow-black/20 transition-shadow duration-200 ${tint?.wrap || ''}`}
          >
            <Icon size={18} className={tint?.icon || fallbackIconCls} strokeWidth={2.4} />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className={`text-[13.5px] font-semibold leading-tight truncate tracking-tight ${
                isActive
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {label}
            </div>
            <div className="text-[11px] leading-tight truncate mt-0.5 text-slate-500 dark:text-slate-500">
              {desc}
            </div>
          </div>

          <ChevronRight
            size={15}
            className={`shrink-0 transition-all duration-200 ${
              isActive
                ? 'text-slate-700 translate-x-0.5 dark:text-slate-300'
                : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 dark:text-slate-600 dark:group-hover:text-slate-400'
            }`}
            strokeWidth={2.4}
          />
        </>
      )}
    </NavLink>
  )
}
