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
  { to: '/blog', label: 'Blog' },
]
const SAVED_LINK = { to: '/saved', label: 'Saved' }
const ABOUT_LINK = { to: '/about', label: 'About' }
const ADMIN_LINK = { to: '/admin', label: 'Admin', adminOnly: true }

// Drawer sections (mobile only) — icon, description and a tinted gradient
// per item give the menu real visual hierarchy. Order matches the desktop
// header so users see the same mental model on every screen size.
const DISCOVER_LINKS = [
  {
    to: '/how-it-works',
    label: 'How it Works',
    desc: 'Silver vs Gold in 30 seconds',
    Icon: Workflow,
    tint: 'from-sky-500/25 to-cyan-500/15 text-sky-300 ring-sky-400/30',
  },
  {
    to: '/popular-routes',
    label: 'Popular Routes',
    desc: 'Top picks across India',
    Icon: MapPin,
    tint: 'from-emerald-500/25 to-green-500/15 text-emerald-300 ring-emerald-400/30',
  },
  {
    to: '/blog',
    label: 'Blog',
    desc: 'Stories, tips & guides',
    Icon: BookOpen,
    tint: 'from-amber-500/25 to-orange-500/15 text-amber-300 ring-amber-400/30',
  },
]

const ABOUT_DRAWER_ITEM = {
  to: '/about',
  label: 'About',
  desc: 'The team behind JourneyMate',
  Icon: Info,
  tint: 'from-indigo-500/25 to-blue-500/15 text-indigo-300 ring-indigo-400/30',
}

const SAVED_DRAWER_ITEM = {
  to: '/saved',
  label: 'Saved trips',
  desc: 'Your private wishlist',
  Icon: Sparkles,
  tint: 'from-emerald-500/25 to-teal-500/15 text-emerald-300 ring-emerald-400/30',
}

const MORE_LINKS = [
  {
    to: '/pricing',
    label: 'Pricing',
    desc: 'Free forever for travellers',
    Icon: Crown,
    tint: 'from-yellow-500/25 to-amber-500/15 text-yellow-300 ring-yellow-400/30',
  },
  {
    to: '/contact',
    label: 'Contact',
    desc: 'Talk to a real human',
    Icon: Mail,
    tint: 'from-rose-500/25 to-pink-500/15 text-rose-300 ring-rose-400/30',
  },
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
    if (user) links.push(SAVED_LINK)
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
                    : isActive
                      ? 'text-white bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {link.adminOnly && <ShieldCheck size={13} />}
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

      {/* Sliding panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={`absolute top-0 right-0 w-[88vw] max-w-[400px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ height: '100dvh' }}
      >
        {/* Ambient brand glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8 shrink-0">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <img src="/logo.svg" alt="" className="w-9 h-9 rounded-xl shadow-lg shadow-green-500/20" />
            <div>
              <div className="font-display font-bold text-white leading-tight">JourneyMate</div>
              <div className="text-[10px] text-slate-500 leading-none mt-0.5">Smart Travel Comparison</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5 space-y-6">
          {/* Greeting card */}
          {user && (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-amber-500/10 p-4">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/30">
                    {initial}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold flex items-center gap-1">
                    <Sparkles size={11} />
                    Welcome back
                  </div>
                  <div className="text-base font-bold text-white truncate">Hi, {firstName}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>
            </div>
          )}

          <DrawerSection title="Discover">
            {DISCOVER_LINKS.map((item) => (
              <DrawerItem key={item.to || item.label} item={item} />
            ))}
            {user && <DrawerItem item={SAVED_DRAWER_ITEM} />}
            <DrawerItem item={ABOUT_DRAWER_ITEM} />
          </DrawerSection>

          <DrawerSection title="More">
            {MORE_LINKS.map((item) => (
              <DrawerItem key={item.to || item.label} item={item} />
            ))}

            {user?.isAdmin && (
              <DrawerItem
                item={{
                  to: '/admin',
                  label: 'Admin Console',
                  desc: 'Backstage controls',
                  Icon: ShieldCheck,
                  tint: 'from-violet-500/25 to-fuchsia-500/15 text-violet-300 ring-violet-400/30',
                }}
              />
            )}
          </DrawerSection>
        </div>

        {/* Footer — pinned, never overflows; safe-area aware on iOS */}
        <div
          className="relative shrink-0 px-4 pt-3 pb-4 border-t border-white/8 bg-slate-950/70 backdrop-blur-xl space-y-2.5"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          {/* Sign in / Sign out */}
          {user ? (
            <button
              type="button"
              onClick={() => { logout(); onClose() }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 border border-white/8 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 transition-all duration-200 group"
            >
              <LogOut size={15} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 hover:brightness-110 transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              Sign in
            </Link>
          )}

          <p className="text-center text-[10px] text-slate-600 tracking-wide">
            v1.0 · Made with ♥ in India
          </p>
        </div>
      </aside>
    </div>
  )

  return createPortal(overlay, document.body)
}

function DrawerSection({ title, children }) {
  return (
    <div>
      <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function DrawerItem({ item }) {
  const { to, label, desc, Icon, tint } = item
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-2.5 py-2.5 rounded-xl border transition-all ${
          isActive
            ? 'bg-white/5 border-white/12'
            : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
        }`
      }
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${tint?.split(' ').filter((c) => c.startsWith('from-') || c.startsWith('to-')).join(' ')} ring-1 ${tint?.split(' ').find((c) => c.startsWith('ring-')) || 'ring-white/10'} flex items-center justify-center`}
      >
        <Icon
          size={18}
          className={tint?.split(' ').find((c) => c.startsWith('text-')) || 'text-white'}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white leading-tight truncate">{label}</div>
        <div className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">{desc}</div>
      </div>
      <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
    </NavLink>
  )
}
