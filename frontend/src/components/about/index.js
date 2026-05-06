/**
 * Barrel export for the About page section components.
 *
 * Consumers should import from `'../components/about'` rather than
 * reaching into individual files — that keeps the public surface
 * area of the about/ module narrow and lets us reorganise the
 * internals without rippling import paths through the page.
 */

export { default as Aurora } from './Aurora'
export { default as BackLink } from './BackLink'
export { default as PortraitCard } from './PortraitCard'
export { default as HeroIntro } from './HeroIntro'
export { default as StatStrip } from './StatStrip'
export { default as StatBlock } from './StatBlock'
export { default as Timeline } from './Timeline'
export { default as MotivationGrid } from './MotivationGrid'
export { default as PhilosophyGrid } from './PhilosophyGrid'
export { default as ConnectGrid } from './ConnectGrid'
export { default as FinalCta } from './FinalCta'
