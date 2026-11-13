// An app's mark beside its name: the app's own logo when `logo` is given, otherwise a square tile in a hairline with
// the name's initial, never a round one. `size` in px (16 in rows, 20 in tiles).
export interface AppMarkProps {
  name: string
  logo?: string | null
  size?: number
}

export function AppMark({ name, logo, size = 16 }: AppMarkProps) {
  const box = { width: `${size}px`, height: `${size}px` }
  if (logo) return <img data-ds="app-mark" src={logo} alt="" width={size} height={size} className="shrink-0 object-contain" style={box} loading="lazy" decoding="async" />
  return <span data-ds="app-mark" className="inline-flex shrink-0 items-center justify-center border border-edge bg-surface-subtle text-tag leading-none font-medium text-fg-soft" style={box} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
}

export default AppMark
