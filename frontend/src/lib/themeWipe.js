/**
 * Theme wipe — realistic cartoon monkey mascot.
 *
 * Two fully themed designs:
 *   • → light mode : "Sunlit jungle" — warm golden fur, sun-ray halo,
 *                    tropical green leaves on the branch.
 *   • → dark mode  : "Moonlit night" — cool blue-tinted fur, soft
 *                    bioluminescent glow dots on the branch, deep shadows.
 *
 * Visual techniques used (all pure SVG / CSS, zero image deps):
 *   • feTurbulence + feDisplacementMap  → organic fur texture
 *   • feDropShadow filter               → 3-D depth under the monkey
 *   • feGaussianBlur (glow filter)      → bioluminescent bloom (dark)
 *   • radialGradient rim-lighting       → golden hour / moonlight
 *   • Multi-layer gradients on body     → volumetric fur shading
 *   • Detailed iris + pupil + specular  → lifelike eyes
 *   • Teeth peek + cheek blush          → expressiveness
 *   • SVG animations: breathe, blink, arm sway, tail curl, star twinkle
 *
 * Poster backgrounds:
 *   • Light → layered golden-hour radial gradients + sun-ray beams
 *   • Dark  → deep-space with aurora layering + micro star field
 *
 * Engineering notes:
 *   • Module-level `active` ref cancels any in-flight wipe on rapid
 *     toggle — no stacked overlays.
 *   • All keyframes live inside a <style> tag *inside* the overlay so
 *     they're garbage-collected automatically when the overlay is removed.
 *   • prefers-reduced-motion: no monkey, no slide — gentle crossfade only.
 *   • Each wipe gets a unique `uid` so gradient/filter IDs never clash
 *     even if two wipes briefly coexist during cleanup.
 */

let instanceCounter = 0
let active = null

/* ─────────────────────────────────────────────────────────────────────── *
 * 1. Monkey SVG (theme-aware)                                              *
 * ─────────────────────────────────────────────────────────────────────── */

function buildMonkeySvg(theme, uid) {
  const sun = theme === 'light'

  // ── Color palette ────────────────────────────────────────────────────
  const fur0   = sun ? '#a0652a' : '#5a3a1e'  // highlight
  const fur1   = sun ? '#8B5520' : '#4a2e14'  // mid-tone
  const fur2   = sun ? '#6B4218' : '#3a2210'  // shadow
  const belly  = sun ? '#d4a06a' : '#9a7040'
  const face   = sun ? '#c49060' : '#8a6040'
  const tuft   = sun ? '#4a2e10' : '#22140a'
  const muzzle = sun ? '#c08050' : '#7a5030'
  const iris   = sun ? '#3a2000' : '#08081e'
  const sclera = sun ? 'rgba(255,245,220,0.96)' : 'rgba(210,225,255,0.94)'
  const rim    = sun ? 'rgba(255,210,80,0.55)'  : 'rgba(130,175,255,0.45)'
  const rimMid = sun ? 'rgba(255,160,30,0.0)'   : 'rgba(70,120,255,0.0)'
  const cheek  = sun ? 'rgba(230,90,70,0.42)'   : 'rgba(190,80,80,0.28)'
  const branch = sun ? '#7a4a1a' : '#3a220e'
  const bark   = sun ? '#5a3a10' : '#2a1808'
  const mossA  = sun ? '#5aaa3a' : '#2a6a4a'
  const mossB  = sun ? '#4a9a2a' : '#1a5a3a'
  const shadow = sun ? 'rgba(50,20,0,0.55)'     : 'rgba(0,5,30,0.70)'

  // ── Theme-exclusive decorations ──────────────────────────────────────
  const leavesOrGlow = sun
    ? /* tropical leaves */ `
      <ellipse cx="-38" cy="-58" rx="13" ry="6" fill="#5db83a" opacity=".85"
        transform="rotate(-25,-38,-58)"/>
      <ellipse cx="10" cy="-63" rx="12" ry="5.5" fill="#6ec44a" opacity=".75"
        transform="rotate(12,10,-63)"/>
      <ellipse cx="62" cy="-58" rx="13" ry="6" fill="#5db83a" opacity=".80"
        transform="rotate(-10,62,-58)"/>
      <ellipse cx="105" cy="-62" rx="11" ry="5" fill="#6ec44a" opacity=".70"
        transform="rotate(18,105,-62)"/>`
    : /* glow nodes on branch */ `
      <circle cx="-25" cy="-52" r="3.5" fill="#7fffd4" opacity=".85"
        filter="url(#glow-${uid})" class="glow-dot"/>
      <circle cx="30" cy="-56" r="2.8" fill="#aaffcc" opacity=".70"
        filter="url(#glow-${uid})" class="glow-dot"/>
      <circle cx="88" cy="-53" r="3" fill="#7fffd4" opacity=".75"
        filter="url(#glow-${uid})" class="glow-dot"/>`

  const rimDecor = sun
    ? /* sun rays */ `
      <line x1="0" y1="-35" x2="0" y2="-50" stroke="rgba(255,210,50,.65)" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="-26" x2="32" y2="-38" stroke="rgba(255,210,50,.55)" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="-24" y1="-26" x2="-32" y2="-38" stroke="rgba(255,210,50,.55)" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="34" y1="2" x2="46" y2="2"  stroke="rgba(255,210,50,.45)" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="-34" y1="2" x2="-46" y2="2" stroke="rgba(255,210,50,.45)" stroke-width="1.6" stroke-linecap="round"/>`
    : /* moonlit sparkles */ `
      <circle cx="22" cy="-32" r="1.5" fill="rgba(200,225,255,.7)" class="star"/>
      <circle cx="-28" cy="-28" r="1.2" fill="rgba(200,225,255,.6)" class="star"/>
      <circle cx="38" cy="10" r="1.0" fill="rgba(200,225,255,.5)" class="star"/>`

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="-75 -80 260 330" width="190" height="255" aria-hidden="true">
<defs>
  <!-- Organic fur displacement -->
  <filter id="fur-${uid}" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency=".72 .44"
      numOctaves="4" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="5"
      xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feComposite in="d" in2="SourceGraphic" operator="in"/>
  </filter>
  <!-- Soft drop-shadow for the whole monkey -->
  <filter id="dshadow-${uid}" x="-25%" y="-15%" width="150%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="10"
      flood-color="${shadow}" flood-opacity="1"/>
  </filter>
  <!-- Bioluminescent bloom (dark mode) -->
  <filter id="glow-${uid}" x="-200%" y="-200%" width="500%" height="500%">
    <feGaussianBlur stdDeviation="5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <!-- Body shading gradient — radial from top-left highlight -->
  <radialGradient id="body-${uid}" cx="32%" cy="22%" r="68%">
    <stop offset="0"   stop-color="${fur0}"/>
    <stop offset=".55" stop-color="${fur1}"/>
    <stop offset="1"   stop-color="${fur2}"/>
  </radialGradient>
  <!-- Rim-lighting overlay (golden-hour / moonlight) -->
  <radialGradient id="rim-${uid}" cx="30%" cy="20%" r="65%">
    <stop offset="0"   stop-color="${rim}"/>
    <stop offset=".6"  stop-color="${rimMid}"/>
    <stop offset="1"   stop-color="rgba(0,0,0,0)"/>
  </radialGradient>
  <!-- Belly sheen -->
  <radialGradient id="belly-${uid}" cx="50%" cy="30%" r="55%">
    <stop offset="0"   stop-color="${sun ? '#ecc085' : '#b08050'}"/>
    <stop offset="1"   stop-color="${belly}"/>
  </radialGradient>
  <!-- Eye specular -->
  <radialGradient id="eye-${uid}" cx="28%" cy="22%" r="52%">
    <stop offset="0"   stop-color="${sclera}"/>
    <stop offset=".45" stop-color="rgba(255,255,255,.25)"/>
    <stop offset="1"   stop-color="rgba(0,0,0,0)"/>
  </radialGradient>
  <!-- Branch gradient -->
  <linearGradient id="br-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0"  stop-color="${sun ? '#9a6030' : '#4a2c14'}"/>
    <stop offset="1"  stop-color="${branch}"/>
  </linearGradient>
</defs>

<!-- ── Drop-shadow wrapper ── -->
<g filter="url(#dshadow-${uid})">

<!-- Branch -->
<path d="M-80 -48 Q0 -60 60 -48 Q115 -38 185 -54"
  stroke="url(#br-${uid})" stroke-width="22" fill="none" stroke-linecap="round"/>
<!-- Bark highlight -->
<path d="M-60 -52 Q0 -60 55 -52"
  stroke="${sun ? 'rgba(200,140,60,.45)' : 'rgba(100,60,30,.45)'}"
  stroke-width="7" fill="none" stroke-linecap="round"/>
<!-- Moss strips -->
<path d="M-40 -50 Q10 -58 55 -51"
  stroke="${mossA}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".70"/>
<path d="M70 -50 Q120 -44 165 -54"
  stroke="${mossB}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>
${leavesOrGlow}

<!-- Vine connecting monkey to branch (hangs from ~x=55 of branch) -->
<path d="M55 -42 Q50 -15 46 10"
  stroke="${sun ? '#8a7a3a' : '#4a4028'}" stroke-width="5"
  fill="none" stroke-linecap="round" opacity=".80"/>
<path d="M55 -42 Q60 -15 64 10"
  stroke="${sun ? '#7a6a2a' : '#3a3018'}" stroke-width="3"
  fill="none" stroke-linecap="round" opacity=".60"/>

<!-- ── Tail (behind body) ── -->
<g class="tail">
  <path d="M22 138 Q62 148 70 116 Q76 86 58 72"
    stroke="url(#body-${uid})" stroke-width="13" fill="none"
    stroke-linecap="round" filter="url(#fur-${uid})"/>
  <!-- Tail tip -->
  <ellipse cx="58" cy="70" rx="9" ry="7" fill="${belly}"
    transform="rotate(-18,58,70)"/>
</g>

<!-- ── Body ── -->
<g class="body">
  <ellipse cx="0" cy="110" rx="37" ry="44" fill="url(#body-${uid})"
    filter="url(#fur-${uid})"/>
  <!-- Belly -->
  <ellipse cx="0" cy="120" rx="22" ry="28" fill="url(#belly-${uid})"/>
  <!-- Navel dimple -->
  <circle cx="0" cy="135" r="3" fill="${belly}" opacity=".45"/>
  <!-- Rim overlay on body -->
  <ellipse cx="-10" cy="95" rx="38" ry="44" fill="url(#rim-${uid})" opacity=".60"/>
</g>

<!-- ── Head ── -->
<g class="head">
  <!-- Skull -->
  <circle cx="0" cy="28" r="40" fill="url(#body-${uid})"
    filter="url(#fur-${uid})"/>

  <!-- Hair tuft -->
  <path d="M-14 -8 Q0 -24 14 -8"
    stroke="${tuft}" stroke-width="9" fill="${tuft}" stroke-linecap="round"/>
  <path d="M-7 -14 Q0 -28 7 -14"
    stroke="${tuft}" stroke-width="5.5" fill="${tuft}" stroke-linecap="round"/>

  ${rimDecor}

  <!-- Ears -->
  <g>
    <circle cx="-36" cy="24" r="14" fill="url(#body-${uid})" filter="url(#fur-${uid})"/>
    <circle cx="-36" cy="24" r="8" fill="${belly}"/>
    <circle cx="-36" cy="22" r="4.5" fill="${face}" opacity=".7"/>
  </g>
  <g>
    <circle cx="36" cy="24" r="14" fill="url(#body-${uid})" filter="url(#fur-${uid})"/>
    <circle cx="36" cy="24" r="8" fill="${belly}"/>
    <circle cx="36" cy="22" r="4.5" fill="${face}" opacity=".7"/>
  </g>

  <!-- Face mask -->
  <ellipse cx="0" cy="34" rx="28" ry="28" fill="${face}"/>

  <!-- Cheeks -->
  <ellipse cx="-18" cy="40" rx="9" ry="6" fill="${cheek}"/>
  <ellipse cx="18" cy="40" rx="9" ry="6" fill="${cheek}"/>

  <!-- Brow ridges -->
  <path d="M-20 16 Q-10 9 -2 15" stroke="${tuft}" stroke-width="3.5"
    fill="none" stroke-linecap="round" opacity=".85"/>
  <path d="M2 15 Q10 9 20 16" stroke="${tuft}" stroke-width="3.5"
    fill="none" stroke-linecap="round" opacity=".85"/>

  <!-- Eyes -->
  <g class="eyes">
    <!-- LEFT -->
    <ellipse cx="-13" cy="28" rx="7" ry="8.5" fill="#0a0a0a"/>
    <ellipse cx="-13" cy="28" rx="4.5" ry="5" fill="${iris}"/>
    <ellipse cx="-13" cy="28" rx="2.8" ry="3.2" fill="#000"/>
    <!-- specular catchlight -->
    <ellipse cx="-10.5" cy="24.5" rx="2.6" ry="3.2" fill="url(#eye-${uid})" opacity=".92"/>
    <!-- small secondary shine -->
    <circle cx="-16" cy="31" r="1.2" fill="rgba(255,255,255,.50)"/>
    <!-- RIGHT -->
    <ellipse cx="13" cy="28" rx="7" ry="8.5" fill="#0a0a0a"/>
    <ellipse cx="13" cy="28" rx="4.5" ry="5" fill="${iris}"/>
    <ellipse cx="13" cy="28" rx="2.8" ry="3.2" fill="#000"/>
    <ellipse cx="15.5" cy="24.5" rx="2.6" ry="3.2" fill="url(#eye-${uid})" opacity=".92"/>
    <circle cx="10" cy="31" r="1.2" fill="rgba(255,255,255,.50)"/>
  </g>

  <!-- Muzzle / snout -->
  <ellipse cx="0" cy="46" rx="17" ry="13" fill="${muzzle}"/>

  <!-- Nostrils -->
  <ellipse cx="-5.5" cy="44" rx="3.8" ry="3.2" fill="${tuft}" opacity=".80"/>
  <ellipse cx="5.5" cy="44" rx="3.8" ry="3.2" fill="${tuft}" opacity=".80"/>
  <!-- Nose bridge highlight -->
  <ellipse cx="0" cy="42" rx="3" ry="2" fill="${sun ? 'rgba(220,160,80,.45)' : 'rgba(150,170,200,.30)'}"/>

  <!-- Smile line -->
  <path d="M-11 56 Q0 66 11 56"
    stroke="${tuft}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <!-- Teeth peek -->
  <path d="M-8 57 Q0 62 8 57"
    stroke="white" stroke-width="1.8"
    fill="rgba(255,255,255,.75)" stroke-linecap="round"/>

  <!-- Rim-light on head -->
  <circle cx="0" cy="28" r="40" fill="url(#rim-${uid})" opacity=".72"/>
</g>

<!-- ── Left arm ── -->
<g class="arm-l">
  <path d="M-28 78 Q-56 66 -62 40"
    stroke="url(#body-${uid})" stroke-width="15" fill="none"
    stroke-linecap="round" filter="url(#fur-${uid})"/>
  <!-- Hand -->
  <ellipse cx="-62" cy="38" rx="11" ry="9" fill="${belly}"
    transform="rotate(-18,-62,38)"/>
  <!-- Finger hints -->
  <path d="M-70 34 Q-67 28 -62 30" stroke="${belly}" stroke-width="5.5"
    fill="none" stroke-linecap="round" opacity=".72"/>
  <path d="M-66 30 Q-61 23 -55 27" stroke="${belly}" stroke-width="5"
    fill="none" stroke-linecap="round" opacity=".65"/>
</g>

<!-- ── Right arm ── -->
<g class="arm-r">
  <path d="M28 78 Q56 66 62 40"
    stroke="url(#body-${uid})" stroke-width="15" fill="none"
    stroke-linecap="round" filter="url(#fur-${uid})"/>
  <ellipse cx="62" cy="38" rx="11" ry="9" fill="${belly}"
    transform="rotate(18,62,38)"/>
  <path d="M70 34 Q67 28 62 30" stroke="${belly}" stroke-width="5.5"
    fill="none" stroke-linecap="round" opacity=".72"/>
  <path d="M66 30 Q61 23 55 27" stroke="${belly}" stroke-width="5"
    fill="none" stroke-linecap="round" opacity=".65"/>
</g>

</g><!-- end drop-shadow group -->
</svg>`
}

/* ─────────────────────────────────────────────────────────────────────── *
 * 2. Poster backgrounds                                                    *
 * ─────────────────────────────────────────────────────────────────────── */

function posterBackground(theme) {
  if (theme === 'light') {
    // Golden-hour sky: warm peach gradient + three light-cone rays
    return [
      /* sun rays from top-right */
      'linear-gradient(148deg, rgba(255,230,130,.28) 0%, transparent 38%)',
      'linear-gradient(162deg, rgba(255,200,80,.22) 0%, transparent 30%)',
      'linear-gradient(135deg, rgba(255,240,180,.18) 0%, transparent 40%)',
      /* ambient sky layers */
      'radial-gradient(ellipse 90% 55% at 70% 0%, rgba(255,180,60,.32), transparent 60%)',
      'radial-gradient(ellipse 70% 45% at 20% 5%, rgba(255,220,100,.20), transparent 55%)',
      'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(56,189,248,.22), transparent 60%)',
      'radial-gradient(ellipse 55% 40% at 80% 95%, rgba(16,185,129,.16), transparent 65%)',
      /* base canvas */
      'linear-gradient(180deg, #fdf6ed 0%, #f5eeda 45%, #f8fafc 100%)',
    ].join(', ')
  }

  // Moonlit / deep-space: indigo-to-navy + aurora streaks + subtle star field
  return [
    /* aurora streaks */
    'linear-gradient(135deg, rgba(34,211,238,.16) 0%, transparent 35%)',
    'linear-gradient(165deg, rgba(168,85,247,.14) 0%, transparent 30%)',
    'linear-gradient(120deg, rgba(244,114,182,.10) 0%, transparent 28%)',
    /* space ambient */
    'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(34,211,238,.20), transparent 58%)',
    'radial-gradient(ellipse 60% 40% at 15% 90%, rgba(168,85,247,.16), transparent 65%)',
    'radial-gradient(ellipse 55% 38% at 85% 95%, rgba(244,114,182,.13), transparent 65%)',
    'radial-gradient(ellipse 50% 30% at 50% 5%, rgba(100,150,255,.14), transparent 55%)',
    /* base canvas */
    'linear-gradient(180deg, #050510 0%, #0a0a1f 40%, #0a0a0f 100%)',
  ].join(', ')
}

/* ─────────────────────────────────────────────────────────────────────── *
 * 3. Scoped CSS (lives inside the overlay element; auto-cleaned up)        *
 * ─────────────────────────────────────────────────────────────────────── */

function buildCSS(uid) {
  return `
[data-jm-wipe="${uid}"] {
  position: fixed;
  inset: 0;
  z-index: 2147483640;
  pointer-events: none;
  overflow: hidden;
}
[data-jm-wipe="${uid}"] .poster {
  position: absolute;
  inset: 0;
  transform: translateY(100%);
  transition: transform 680ms cubic-bezier(0.60, 0, 0.32, 1);
  will-change: transform;
  /* Hard edge under the rising poster — surface feel */
  box-shadow: 0 -22px 50px -8px rgba(0,0,0,0.40), 0 -2px 0 rgba(0,0,0,0.15);
}
[data-jm-wipe="${uid}"].rising .poster {
  transform: translateY(0);
}
/* Fade-out for the whole wipe when the theme has been committed */
[data-jm-wipe="${uid}"] {
  opacity: 1;
  transition: opacity 320ms ease-out;
}
[data-jm-wipe="${uid}"].fading {
  opacity: 0;
}

/* ── Mascot wrapper ── */
[data-jm-wipe="${uid}"] .mascot {
  position: absolute;
  /* Sit at the very TOP edge of the poster so as the poster rises
     the monkey "rides" just above the leading edge. Negative top
     pushes the monkey above the poster's top border. */
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 190px;
  height: 255px;
  filter: drop-shadow(0 10px 24px rgba(0,0,0,0.35));
}
[data-jm-wipe="${uid}"] .mascot svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

/* ── Body breathe ── */
[data-jm-wipe="${uid}"] .body {
  transform-origin: 0px 90px;
  animation: jm-breathe-${uid} 2.1s ease-in-out infinite alternate;
}
@keyframes jm-breathe-${uid} {
  from { transform: scaleY(1); }
  to   { transform: scaleY(1.035); }
}

/* ── Head bob (slightly out of phase with body) ── */
[data-jm-wipe="${uid}"] .head {
  transform-origin: 0px 28px;
  animation: jm-bob-${uid} 2.1s ease-in-out infinite alternate;
  animation-delay: -0.4s;
}
@keyframes jm-bob-${uid} {
  from { transform: translateY(0); }
  to   { transform: translateY(-5px); }
}

/* ── Tail curl ── */
[data-jm-wipe="${uid}"] .tail {
  transform-origin: 22px 138px;
  animation: jm-tail-${uid} 1.8s ease-in-out infinite alternate;
}
@keyframes jm-tail-${uid} {
  from { transform: rotate(-4deg); }
  to   { transform: rotate(8deg); }
}

/* ── Left arm sway ── */
[data-jm-wipe="${uid}"] .arm-l {
  transform-origin: -28px 78px;
  animation: jm-arml-${uid} 1.4s ease-in-out infinite alternate;
}
@keyframes jm-arml-${uid} {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-10deg); }
}

/* ── Right arm sway ── */
[data-jm-wipe="${uid}"] .arm-r {
  transform-origin: 28px 78px;
  animation: jm-armr-${uid} 1.4s ease-in-out infinite alternate;
  animation-delay: -0.2s;
}
@keyframes jm-armr-${uid} {
  from { transform: rotate(0deg); }
  to   { transform: rotate(10deg); }
}

/* ── Eye blink ── */
[data-jm-wipe="${uid}"] .eyes {
  transform-origin: 0px 28px;
  animation: jm-blink-${uid} 3.8s ease-in-out infinite;
}
@keyframes jm-blink-${uid} {
  0%,89%,100% { transform: scaleY(1); }
  92%,93%     { transform: scaleY(0.07); }
}

/* ── Star / glow-dot twinkle (dark mode) ── */
[data-jm-wipe="${uid}"] .star {
  animation: jm-star-${uid} 2.4s ease-in-out infinite alternate;
}
[data-jm-wipe="${uid}"] .star:nth-child(2) { animation-delay: -.8s; }
[data-jm-wipe="${uid}"] .star:nth-child(3) { animation-delay: -1.6s; }
@keyframes jm-star-${uid} {
  from { opacity: .3; r: 1.0; }
  to   { opacity: .9; r: 1.6; }
}
[data-jm-wipe="${uid}"] .glow-dot {
  animation: jm-glow-${uid} 2.0s ease-in-out infinite alternate;
}
[data-jm-wipe="${uid}"] .glow-dot:nth-child(2) { animation-delay: -.7s; }
[data-jm-wipe="${uid}"] .glow-dot:nth-child(3) { animation-delay: -1.4s; }
@keyframes jm-glow-${uid} {
  from { opacity: .55; }
  to   { opacity: 1.0; }
}

/* Respect reduced-motion — all animations off */
@media (prefers-reduced-motion: reduce) {
  [data-jm-wipe="${uid}"] .body,
  [data-jm-wipe="${uid}"] .head,
  [data-jm-wipe="${uid}"] .tail,
  [data-jm-wipe="${uid}"] .arm-l,
  [data-jm-wipe="${uid}"] .arm-r,
  [data-jm-wipe="${uid}"] .eyes,
  [data-jm-wipe="${uid}"] .star,
  [data-jm-wipe="${uid}"] .glow-dot {
    animation: none !important;
  }
}
`
}

/* ─────────────────────────────────────────────────────────────────────── *
 * 4. Cancel helpers                                                        *
 * ─────────────────────────────────────────────────────────────────────── */

function cancelActiveWipe() {
  if (!active) return
  for (const id of active.timers) clearTimeout(id)
  active.overlay?.parentNode?.removeChild(active.overlay)
  active = null
}

/* ─────────────────────────────────────────────────────────────────────── *
 * 5. Public API                                                            *
 * ─────────────────────────────────────────────────────────────────────── */

/**
 * Run the monkey-mascot theme wipe.
 *
 * @param {'light'|'dark'} nextTheme  — theme we're switching TO
 * @param {() => void}     commit     — mutates <html>; called once the
 *                                      poster fully covers the viewport
 */
export function runMonkeyThemeWipe(nextTheme, commit) {
  if (typeof document === 'undefined') { commit(); return }

  cancelActiveWipe()

  const uid = ++instanceCounter
  const timers = []
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id) }

  // ── Build DOM ────────────────────────────────────────────────────────
  const overlay = document.createElement('div')
  overlay.setAttribute('data-jm-wipe', String(uid))
  overlay.setAttribute('aria-hidden', 'true')

  const style = document.createElement('style')
  style.textContent = buildCSS(uid)
  overlay.appendChild(style)

  const poster = document.createElement('div')
  poster.className = 'poster'
  poster.style.background = posterBackground(nextTheme)

  const mascot = document.createElement('div')
  mascot.className = 'mascot'
  mascot.innerHTML = buildMonkeySvg(nextTheme, uid)

  poster.appendChild(mascot)
  overlay.appendChild(poster)
  document.body.appendChild(overlay)

  active = { overlay, timers }

  // ── Timeline ─────────────────────────────────────────────────────────
  // t=0    : overlay in DOM, poster & monkey below viewport
  // t≈16  : double-rAF → add .rising → poster slides up (680 ms)
  // t=680 : poster covers screen → commit theme silently
  // t=880 : 200 ms hold (monkey wiggles at top) → start fade
  // t=1200: fade complete → remove overlay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('rising')
    })
  })

  later(() => {
    try { commit() } catch { /* safety */ }
  }, 680)

  later(() => {
    overlay.classList.add('fading')
  }, 880)

  later(() => {
    overlay.parentNode?.removeChild(overlay)
    if (active?.overlay === overlay) active = null
  }, 1220)
}

export function isReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
