import { forwardRef, type TransitionEventHandler } from 'react'
import './AppIconPlain.css'

type AppIconPlainProps = {
  className?: string
  title?: string
  onTransitionEnd?: TransitionEventHandler<SVGSVGElement>
}

/** Rest-state HD mark, split so the three hamburger bars are the letter horizontals. */
export const APP_ICON_PATHS = {
  hLeft: 'M5.5 0L5.5 85',
  hRight: 'M65.5 0L65.5 85',
  cBowl:
    'M101.5 5.5C121.935 5.5 138.5 22.0655 138.5 42.5C138.5 62.9345 121.935 79.5 101.5 79.5',
  barTop: 'M5.5 5.5H138.5',
  barMid: 'M5.5 42.5H138.5',
  barBot: 'M5.5 79.5H138.5',
} as const

const AppIconPlain = forwardRef<SVGSVGElement, AppIconPlainProps>(
  function AppIconPlain({ className, title, onTransitionEnd }, ref) {
    return (
      <svg
        ref={ref}
        className={['appIconPlain', className].filter(Boolean).join(' ')}
        width="144"
        height="85"
        viewBox="0 0 144 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        onTransitionEnd={onTransitionEnd}
      >
        {title ? <title>{title}</title> : null}
        <path
          className="appIconPlain__hLeft"
          d={APP_ICON_PATHS.hLeft}
          stroke="currentColor"
          strokeWidth="11"
        />
        <path
          className="appIconPlain__hRight"
          d={APP_ICON_PATHS.hRight}
          stroke="currentColor"
          strokeWidth="11"
        />
        <path
          className="appIconPlain__cBowl"
          d={APP_ICON_PATHS.cBowl}
          stroke="currentColor"
          strokeWidth="11"
        />
        <path
          className="appIconPlain__barTop"
          d={APP_ICON_PATHS.barTop}
          stroke="currentColor"
          strokeWidth="11"
        />
        <path
          className="appIconPlain__barMid"
          d={APP_ICON_PATHS.barMid}
          stroke="currentColor"
          strokeWidth="11"
        />
        <path
          className="appIconPlain__barBot"
          d={APP_ICON_PATHS.barBot}
          stroke="currentColor"
          strokeWidth="11"
        />
      </svg>
    )
  },
)

export default AppIconPlain
