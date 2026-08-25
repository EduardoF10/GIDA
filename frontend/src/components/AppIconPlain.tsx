type AppIconPlainProps = {
  className?: string
  title?: string
}

export default function AppIconPlain({ className, title }: AppIconPlainProps) {
  return (
    <svg
      className={className}
      width="144"
      height="85"
      viewBox="0 0 144 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M78.5 5.5H101.5C121.935 5.5 138.5 22.0655 138.5 42.5C138.5 62.9345 121.935 79.5 101.5 79.5H78.5"
        stroke="currentColor"
        strokeWidth="11"
      />
      <path d="M5.5 42.5L65.5 42.5" stroke="currentColor" strokeWidth="11" />
      <path d="M5.5 0V85" stroke="currentColor" strokeWidth="11" />
      <path d="M65.5 0V85" stroke="currentColor" strokeWidth="11" />
    </svg>
  )
}
