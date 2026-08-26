import { useCallback, useEffect, useLayoutEffect, useRef, useState, type TransitionEvent } from 'react'
import { createPortal } from 'react-dom'
import AppIconPlain from '../../components/AppIconPlain'
import './IntroSplash.css'

const HOLD_MS = 1250
const FLY_MS = 1600
const FLY_MS_REDUCED = 380
const SLIDE_DELAY_MS = 750
const SLIDE_MS = 2200
const COLOR_FADE_MS = 600
/** Start the logo color fade while the last of the teal is still leaving. */
const COLOR_FADE_AFTER_SLIDE_MS = 1050

function scheduleClass(setOn: (v: boolean) => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setOn(true)
    })
  })
}

function flyLogoToMenu(logo: Element) {
  const target = document.querySelector('.tabMenuLogo')
  if (!target) return null

  const from = logo.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  const dx = to.left - from.left
  const dy = to.top - from.top
  const sx = from.width ? to.width / from.width : 1
  const sy = from.height ? to.height / from.height : 1

  return logo.animate(
    [
      { transform: 'translate(0px, 0px) scale(1, 1)' },
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
    ],
    {
      duration: FLY_MS,
      easing: 'cubic-bezier(0.58, 0, 0.32, 1)',
      fill: 'forwards',
    },
  )
}

export default function IntroSplash() {
  const [mounted, setMounted] = useState(true)
  const [exiting, setExiting] = useState(false)
  const [sliding, setSliding] = useState(false)
  const [colorFading, setColorFading] = useState(false)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reducedMotionRef = useRef(false)
  const colorFadingRef = useRef(false)
  const logoRef = useRef<SVGSVGElement | null>(null)
  const flyAnimRef = useRef<Animation | null>(null)

  const finishedRef = useRef(false)
  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    document.body.classList.remove('intro-splash-active')
    document.body.classList.remove('intro-splash-color-fade')
    setMounted(false)
  }, [])

  const startColorFade = useCallback(() => {
    if (colorFadingRef.current || finishedRef.current) return
    colorFadingRef.current = true
    scheduleClass((on) => {
      if (finishedRef.current) return
      if (on) document.body.classList.add('intro-splash-color-fade')
      setColorFading(on)
    })
  }, [])

  const onBackdropTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (e.propertyName !== 'transform') return
      startColorFade()
    },
    [startColorFade],
  )

  useEffect(() => {
    document.body.classList.add('intro-splash-active')
    return () => {
      document.body.classList.remove('intro-splash-active')
      document.body.classList.remove('intro-splash-color-fade')
    }
  }, [])

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedMotionRef.current = reduced
    const hold = reduced ? 0 : HOLD_MS

    holdTimerRef.current = setTimeout(() => {
      scheduleClass(setExiting)
    }, hold)

    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    if (!exiting) return

    if (reducedMotionRef.current) {
      const t = window.setTimeout(finish, FLY_MS_REDUCED + 80)
      return () => window.clearTimeout(t)
    }

    const logo = logoRef.current ?? document.querySelector('.introSplash__logo')
    if (logo) {
      flyAnimRef.current = flyLogoToMenu(logo)
    }
  }, [exiting, finish])

  useEffect(() => {
    if (!exiting || reducedMotionRef.current) return

    const t = window.setTimeout(() => {
      scheduleClass(setSliding)
    }, SLIDE_DELAY_MS)

    return () => window.clearTimeout(t)
  }, [exiting])

  useEffect(() => {
    if (!sliding) return
    const colorT = window.setTimeout(startColorFade, COLOR_FADE_AFTER_SLIDE_MS)
    const doneAt =
      Math.max(SLIDE_MS, COLOR_FADE_AFTER_SLIDE_MS + COLOR_FADE_MS) + 200
    const doneT = window.setTimeout(finish, doneAt)
    return () => {
      window.clearTimeout(colorT)
      window.clearTimeout(doneT)
    }
  }, [sliding, startColorFade, finish])

  if (!mounted) return null

  return createPortal(
    <div
      className={[
        'introSplash',
        exiting ? 'introSplash--exit' : '',
        sliding ? 'introSplash--slide' : '',
        colorFading ? 'introSplash--color-fade' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <div className="introSplash__backdrop" onTransitionEnd={onBackdropTransitionEnd} />
      <span className="introSplash__srOnly">Diaz Architects</span>
      <div className="introSplash__brand">
        <AppIconPlain ref={logoRef} className="introSplash__logo" />
      </div>
    </div>,
    document.body,
  )
}
