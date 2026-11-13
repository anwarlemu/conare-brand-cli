'use client'
import { useId, type CSSProperties, type KeyboardEvent } from 'react'
import { ArrowUpRight, Check, ChevronDown, Copy } from 'lucide-react'
import { MenuClose } from '@/react/components/ui/Menu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { useCopy } from '@/react/hooks/useCopy'
import { useMenu } from '@/react/hooks/useMenu'

// Connect your agent's split button (the console's agent/Split.vue, take 2, the pick): one black block, Copy prompt
// and a narrower arrow inside it with no divider. One prompt carries every client's setup, so the arrow holds only
// what the prompt can't do: the one-click installs (`installs`). The halves act as one button: under the pointer, or
// once copied, the red squares run across the copy and on into the arrow. The menu opens under it at its width, dark.
// `large` is the 36px size with the grain.
export interface AgentSplitProps { prompt: string, installs?: { label: string, href: string }[], large?: boolean, onCopied?: () => void, onInstall?: (label: string) => void }

// The arrow's squares start where the copy's end (their delays run 70 to 112ms), so the red crosses into it.
let seed = 29
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
const ARROW = Array.from({ length: 49 }, (_, k) => ({ '--i': Math.round(70 + ((k % 7) / 7) * 30 + rand() * 12), '--o': Math.round(60 + ((k % 7) / 7) * 30 + rand() * 12) }) as CSSProperties)

export function AgentSplit({ prompt, installs, large, onCopied, onInstall }: AgentSplitProps) {
  const { copied, copy } = useCopy()
  async function put() {
    if (await copy(prompt)) onCopied?.()
  }
  const { open, root, trigger, toggle, close, onTriggerKey, onMenuKey } = useMenu()
  const id = `agent-menu-${useId()}`
  // useMenu's show() does nothing more once the menu is open (its state does not change, so nothing renders); Vue's
  // focuses the row anyway. An arrow on the open menu's button goes to its first or last row here.
  function onArrowKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      const rows = [...(root.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])') ?? [])]
      ;(event.key === 'ArrowDown' ? rows[0] : rows.at(-1))?.focus()
      return
    }
    onTriggerKey(event)
  }
  return (
    <MenuClose.Provider value={() => close(true)}>
      <style href="ds-agent-split" precedence="ds">{css}</style>
      <div data-ds="agent-split" ref={root} className="ds-split" data-done={copied || undefined} data-large={large || undefined}>
        <PixelButton done={copied} large={large} className="ds-split-copy" onClick={put}>
          <span className="ds-split-swap" data-on={copied || undefined}>
            <span className="ds-split-swap-a"><Copy size={12} strokeWidth={1.5} aria-hidden="true" />Copy prompt</span>
            <span className="ds-split-swap-b" aria-hidden="true"><Check size={12} strokeWidth={2} />Copied</span>
          </span>
        </PixelButton>
        {installs?.length
          ? (
              <button
                ref={trigger}
                type="button"
                className="ds-split-arrow"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={id}
                aria-label="other ways to connect"
                onClick={toggle}
                onKeyDown={onArrowKey}
              >
                <span aria-hidden="true" className="ds-split-fill">{ARROW.map((c, k) => <i key={k} style={c} />)}</span>
                <ChevronDown size={12} strokeWidth={1.5} className="ds-split-chev" />
              </button>
            )
          : null}
        {open && (
          <div id={id} className="ds-split-menu" role="menu" aria-label="connect your agent" onKeyDown={onMenuKey}>
            {installs?.map(i => <MenuItem key={i.label} href={i.href} onSelect={() => onInstall?.(i.label)}><span className="flex-1">{i.label}</span><ArrowUpRight size={12} strokeWidth={1.5} aria-hidden="true" /></MenuItem>)}
          </div>
        )}
        <span className="sr-only" aria-live="polite">{copied ? 'prompt copied' : ''}</span>
      </div>
    </MenuClose.Provider>
  )
}

export default AgentSplit

const css = `
.ds-split { position: relative; display: flex; align-items: center; }
.ds-split-swap { display: grid; }
.ds-split-swap > span { display: inline-flex; grid-area: 1 / 1; align-items: center; justify-content: center; gap: var(--ds-space-sm); transition: opacity var(--ds-duration-glide) ease, filter var(--ds-duration-glide) ease, transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-split-swap-b { opacity: 0; filter: blur(2px); transform: translateY(5px) scale(0.96); }
.ds-split-swap[data-on] .ds-split-swap-a { opacity: 0; filter: blur(2px); transform: translateY(-5px) scale(0.96); }
.ds-split-swap[data-on] .ds-split-swap-b { opacity: 1; filter: none; transform: none; }
.ds-split-arrow { position: relative; isolation: isolate; display: inline-flex; width: 28px; height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; justify-content: center; overflow: hidden; background: var(--ds-color-action-primary); color: var(--ds-color-action-primary-fg); cursor: pointer; }
.ds-split[data-large] .ds-split-arrow { width: 32px; height: var(--ds-size-control-lg); }
.ds-split[data-large] .ds-split-arrow::before { position: absolute; inset: 0; z-index: -1; background-image: url("/conare-ds/textures/grain.webp"); background-size: 170px auto; opacity: 0.3; content: ""; pointer-events: none; }
.ds-split-arrow:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
.ds-split-fill { position: absolute; inset: 0; z-index: -1; display: grid; grid-template-columns: repeat(7, 6px); grid-auto-rows: 6px; pointer-events: none; }
.ds-split-fill i { background: var(--ds-color-edge-accent); font-style: normal; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard) calc(var(--o) * 1ms); }
.ds-split-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out); }
.ds-split-arrow[aria-expanded="true"] .ds-split-chev { rotate: 180deg; transition-duration: var(--ds-duration-slide); }
/* The two halves light as one: the copy's squares (PixelButton's) and the arrow's. */
@media (hover: hover) and (pointer: fine) {
  .ds-split:hover :is(.ds-px-fill, .ds-split-fill) i { opacity: 1; transition: opacity var(--ds-duration-cell) var(--ds-easing-decelerate) calc(var(--i) * 1ms); }
}
.ds-split:active :is(.ds-px-fill, .ds-split-fill) i { opacity: 1; transition: opacity var(--ds-duration-press) ease 0ms; }
.ds-split:has(> :focus-visible) :is(.ds-px-fill, .ds-split-fill) i { opacity: 1; }
.ds-split[data-done] :is(.ds-px-fill, .ds-split-fill) i { opacity: 1; transition: opacity var(--ds-duration-cell) var(--ds-easing-decelerate) calc(var(--i) * 1ms); }
.ds-split-menu { position: absolute; top: calc(100% + 6px); right: 0; left: 0; z-index: 40; display: flex; flex-direction: column; border: var(--ds-border-hairline) solid var(--ds-color-action-primary); background: var(--ds-color-action-primary); animation: ds-split-menu-in var(--ds-duration-glide) var(--ds-easing-standard) both; }
.ds-split-menu:has(:focus-visible) { animation: none; }
@keyframes ds-split-menu-in { from { opacity: 0; transform: translateY(-4px); } }
.ds-split-menu .ds-menu-item { color: var(--ds-color-off-white); }
.ds-split-menu .ds-menu-item::before { display: none; }
.ds-split-menu .ds-menu-item:focus-visible { background: color-mix(in srgb, var(--ds-color-off-white) 16%, var(--ds-color-action-primary)); }
@media (hover: hover) and (pointer: fine) { .ds-split-menu .ds-menu-item:hover { background: color-mix(in srgb, var(--ds-color-off-white) 16%, var(--ds-color-action-primary)); } }
@media (pointer: coarse), (max-width: 767px) { .ds-split-arrow, .ds-split[data-large] .ds-split-arrow { width: var(--ds-size-control-touch); height: var(--ds-size-control-touch); } }
@media (prefers-reduced-motion: reduce) {
  .ds-split :is(.ds-px-fill, .ds-split-fill) i { transition: none !important; }
  .ds-split-swap > span { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
  .ds-split-menu { animation: none; }
  .ds-split-chev { transition: none; }
}
`
