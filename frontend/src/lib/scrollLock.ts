/** Width of a classic scrollbar, even when overflow is currently hidden. */
export function measureScrollbarGap(): number {
  if (typeof window === 'undefined') return 0
  const visible = window.innerWidth - document.documentElement.clientWidth
  if (visible > 0) return visible

  const probe = document.createElement('div')
  probe.style.cssText =
    'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;visibility:hidden'
  document.documentElement.appendChild(probe)
  const width = probe.offsetWidth - probe.clientWidth
  probe.remove()
  return Math.max(0, width)
}

/** Hide document scroll without letting the layout expand into the scrollbar slot. */
export function lockDocumentScroll(): () => void {
  const gap = measureScrollbarGap()
  const prevOverflow = document.body.style.overflow
  const prevPadding = document.body.style.paddingRight
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${gap}px`
  document.documentElement.style.setProperty('--app-scroll-lock-pad', `${gap}px`)
  return () => {
    document.body.style.overflow = prevOverflow
    document.body.style.paddingRight = prevPadding
    document.documentElement.style.removeProperty('--app-scroll-lock-pad')
  }
}
