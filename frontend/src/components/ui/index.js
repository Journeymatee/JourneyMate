/**
 * UI design-system barrel — every primitive the app uses is exported
 * from this single entry point so consumers import from
 * `'../components/ui'` rather than reaching into individual files.
 *
 * That narrow public surface means we can reorganise the internals,
 * rename a primitive, or split a primitive into multiple files
 * without rippling import paths through the rest of the codebase.
 */

export { default as Button } from './Button'
export { default as Card } from './Card'
export { default as Heading } from './Heading'
export { default as Eyebrow } from './Eyebrow'
export { default as Pill } from './Pill'
export { default as BackLink } from './BackLink'
export { default as Stack, Row } from './Stack'
