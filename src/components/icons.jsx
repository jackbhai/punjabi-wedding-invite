// ── Luxury SVG icon set. Hand-drawn stroke style, gold by default via
// currentColor — wrap in an element with color: var(--gold).
// Every icon: ({ size=24, className='', ...props }).

function base(size, className, props, children, vb = '0 0 24 24') {
  return (
    <svg
      width={size}
      height={size}
      viewBox={vb}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function DiyaIcon({ size = 24, className = '', flameClass = '', ...p }) {
  return base(size, className, p, <>
    {/* flame */}
    <path className={flameClass} d="M12 3.5 C13.8 5.8 13.8 8 12 9.6 C10.2 8 10.2 5.8 12 3.5 Z" fill="currentColor" stroke="none" opacity="0.9" />
    {/* bowl */}
    <path d="M3.5 13.5 H20.5 C20.5 17.5 16.6 20.5 12 20.5 C7.4 20.5 3.5 17.5 3.5 13.5 Z" />
    {/* rim + base */}
    <path d="M2.5 13.5 H21.5" />
    <path d="M9 20.5 H15" />
  </>)
}

export function RingsIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    <circle cx="9" cy="14.5" r="5" />
    <circle cx="15" cy="9.5" r="5" />
    <path d="M15 3.2 L16.4 4.6 L15 6 L13.6 4.6 Z" fill="currentColor" stroke="none" />
  </>)
}

export function HorseIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    {/* stylized decorated horse head, profile facing left */}
    <path d="M13.5 2.5 C11.5 2.5 10.3 3.8 10 5.5 L6.5 7.5 L4 8.5 L7 10 L6 13.5 L10 12.5 L10.5 21 L13 21 L12.5 14.5 L15.5 15.5 L17.5 12 L14.5 10.5 L15 7.5 C15.2 4.8 15 2.5 13.5 2.5 Z" />
    <circle cx="9.5" cy="9.5" r="0.4" fill="currentColor" />
    <path d="M13.5 2.5 L14.5 5.5 M11 4 L10 6.5" opacity="0.6" />
    {/* decorative dots on neck */}
    <circle cx="11.8" cy="16.5" r="0.4" fill="currentColor" />
    <circle cx="12.2" cy="18.5" r="0.4" fill="currentColor" />
  </>)
}

export function HaldiIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    {/* turmeric bowl */}
    <path d="M3.5 13 H20.5 C20.5 17.4 16.6 20.5 12 20.5 C7.4 20.5 3.5 17.4 3.5 13 Z" />
    <path d="M3 13 H21" />
    {/* leaves */}
    <path d="M12 13 C12 9 10 6.5 6.5 6 C7 9.5 9 12 12 13 Z" />
    <path d="M12 13 C12 9.5 14.5 7 18 6.8 C17.6 10 15 12.4 12 13 Z" />
    {/* turmeric dots */}
    <circle cx="9" cy="16" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="17" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="15.6" r="0.7" fill="currentColor" stroke="none" />
  </>)
}

export function MehndiIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    {/* paisley */}
    <path d="M12 2.5 C8.5 7.5 6 11.5 6 15 A6 6 0 0 0 18 15 C18 11.5 15.5 7.5 12 2.5 Z" />
    <circle cx="12" cy="15" r="2.2" />
    <circle cx="12" cy="15" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="9.5" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="10" cy="12" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="14" cy="12" r="0.5" fill="currentColor" stroke="none" />
  </>)
}

export function CalendarIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5 H20.5" />
    <path d="M8 3 V6.5 M16 3 V6.5" />
    <circle cx="12" cy="14.5" r="1" fill="currentColor" stroke="none" />
  </>)
}

export function ClockIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5 V12 L15.5 14" />
  </>)
}

export function PinIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    <path d="M12 21.5 C12 21.5 5.5 14.8 5.5 9.8 A6.5 6.5 0 0 1 18.5 9.8 C18.5 14.8 12 21.5 12 21.5 Z" />
    <circle cx="12" cy="9.8" r="2.3" />
  </>)
}

export function MusicIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    <path d="M9 18.5 V6 L20 3.5 V15.5" />
    <circle cx="6.5" cy="18.5" r="2.5" />
    <circle cx="17.5" cy="15.5" r="2.5" />
  </>)
}

export function PetalIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    <path d="M12 3 C7 8 5.5 13 5.5 16 C5.5 19 8 21 12 21 C16 21 18.5 19 18.5 16 C18.5 13 17 8 12 3 Z" />
    <path d="M12 8 V20" opacity="0.55" />
  </>)
}

export function SparkleIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    <path d="M12 3 C12.8 8 13.5 10.5 20 12 C13.5 13.5 12.8 16 12 21 C11.2 16 10.5 13.5 4 12 C10.5 10.5 11.2 8 12 3 Z" />
  </>)
}

export function GaneshIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    {/* crown */}
    <path d="M8 6.5 L9 3.5 L10.8 5 L12 3.2 L13.2 5 L15 3.5 L16 6.5" />
    {/* head */}
    <path d="M8.2 8 A4 4 0 0 1 15.8 8" />
    {/* ears */}
    <path d="M8.2 8 C6 7.6 5.2 6 5.8 4.6" />
    <path d="M15.8 8 C18 7.6 18.8 6 18.2 4.6" />
    {/* trunk */}
    <path d="M12 8.5 C12.2 11.5 11.5 14.5 8.5 15.5" />
    <path d="M8.5 15.5 C9.5 16.5 11 16.3 11.6 15.2" />
    {/* eyes */}
    <circle cx="10.3" cy="8.2" r="0.45" fill="currentColor" stroke="none" />
    <circle cx="13.7" cy="8.2" r="0.45" fill="currentColor" stroke="none" />
    {/* base blessing */}
    <path d="M7 20.5 H17" />
  </>)
}

export function HeartIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <>
    <path d="M12 20 C7 15.5 3.5 12.4 3.5 8.8 C3.5 6 5.7 4 8.2 4 C9.9 4 11.3 5 12 6.4 C12.7 5 14.1 4 15.8 4 C18.3 4 20.5 6 20.5 8.8 C20.5 12.4 17 15.5 12 20 Z" />
  </>)
}

export function ArrowIcon({ size = 24, className = '', dir = 'right', ...p }) {
  const d = dir === 'left' ? 'M14.5 5.5 L8 12 L14.5 18.5' : 'M9.5 5.5 L16 12 L9.5 18.5'
  return base(size, className, p, <path d={d} />)
}

export function CheckIcon({ size = 24, className = '', ...p }) {
  return base(size, className, p, <path d="M4.5 12.5 L10 18 L19.5 6.5" />)
}

// Map event icon keys → components (used by timeline + admin select).
export const EVENT_ICONS = {
  haldi: HaldiIcon,
  mehndi: MehndiIcon,
  sangeet: MusicIcon,
  karaj: GaneshIcon,
  ghudchadi: HorseIcon,
  reception: RingsIcon,
  default: SparkleIcon,
}
