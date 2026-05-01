import React, { useState, useEffect, useMemo } from 'react'
import { Menu, X, LogOut, ShieldCheck } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BASE_NAV_LINKS = [
  { to: '/how-it-works', label: 'How it Works' },
  { to: '/popular-routes', label: 'Popular Routes' },
  { to: '/blog', label: 'Blog' },
  { to: '/share-experience', label: 'Share a trip' },
  { to: '/about', label: 'About' },
]
const ADMIN_LINK = { to: '/admin', label: 'Admin', adminOnly: true }

export default function Navbar() {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = useMemo(
    () => (user?.isAdmin ? [...BASE_NAV_LINKS, ADMIN_LINK] : BASE_NAV_LINKS),
    [user?.isAdmin]
  )

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-white/8 py-2.5 shadow-lg shadow-black/30'
          : 'py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group"
          onClick={() => setMenuOpen(false)}
        >
          <div className="relative">
            <img
              src="/logo.svg"
              alt="JourneyMate"
              className="w-9 h-9 rounded-xl shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform duration-200"
            />
            {/* Glow ring on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/0 to-amber-500/0 group-hover:from-green-500/20 group-hover:to-amber-500/20 transition-all duration-300" />
          </div>
          <div>
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white block leading-tight">
              JourneyMate
            </span>
            <span className="text-[10px] text-slate-500 leading-none hidden sm:block">Smart Travel Comparison</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5 ${
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
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                {(user.name || user.email || 'T')[0].toUpperCase()}
              </div>
              <span className="text-xs text-slate-300 max-w-[120px] truncate">
                {user.name?.split(' ')[0] || 'Traveler'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => { logout(); setMenuOpen(false) }}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl bg-white/6 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 transition-all duration-200"
            title="Log out"
          >
            <LogOut size={15} />
            <span className="hidden md:inline text-xs">Log out</span>
          </button>

          {/* Hamburger */}
          <button
            type="button"
            className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
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

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-3 sm:mx-4 mt-2 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm py-3 px-4 rounded-xl transition-all font-medium inline-flex items-center gap-2 ${
                  link.adminOnly
                    ? isActive
                      ? 'text-white bg-gradient-to-r from-violet-500/20 to-cyan-500/15 border border-violet-500/30'
                      : 'text-violet-300 hover:text-white hover:bg-violet-500/10 border border-violet-500/20'
                    : isActive
                      ? 'text-white bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/6 border border-transparent'
                }`
              }
            >
              {link.adminOnly && <ShieldCheck size={14} />}
              {link.label}
            </NavLink>
          ))}

          <div className="border-t border-white/8 pt-2 mt-1 space-y-1">
            {user && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/4">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(user.name || user.email || 'T')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">{user.name || 'Traveler'}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => { logout(); setMenuOpen(false) }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
