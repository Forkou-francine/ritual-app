const paths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  barbell: 'M3 12h18M6 8v8M18 8v8M9.5 6.5v11M14.5 6.5v11',
  bowl: 'M3.5 11h17a8.5 8.5 0 0 1-17 0ZM8 7.5c0-1.5 1.2-2 1.2-3.2M12 7.5c0-1.5 1.2-2 1.2-3.2',
  leaf: 'M20 4C10 4 4 9 4 16c0 2 .7 3.4.7 3.4M4.7 19.4C13 19.4 20 14 20 4M4 20l6-6',
  car: 'M4 16v2.5M20 16v2.5M3 15.5h18v-3l-2-5H5l-2 5ZM6.5 12h11M7 18.5h2M15 18.5h2',
  droplet: 'M12 3.5C9 7.5 6.5 10.4 6.5 13.6a5.5 5.5 0 0 0 11 0C17.5 10.4 15 7.5 12 3.5Z',
  walk: 'M13 4.5a1.3 1.3 0 1 0 0-.1ZM11 21l1.5-5.5L10 13l1-5 3 1.5 2 2.5M10 8 7 10M12.5 15.5 10 21',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  back: 'M15 5l-7 7 7 7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  flame: 'M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-1.5.8-2.7 1.7-3.6C9.3 9.9 10 11 10 11c0-2.5.7-5 2-8Z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16.2 16.2 21 21',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4.5l3 1.5M9.5 2.5h5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c0-3.6 3.4-5.5 7.5-5.5s7.5 1.9 7.5 5.5',
  book: 'M4 4.5h6a2.5 2.5 0 0 1 2 2.5 2.5 2.5 0 0 1 2-2.5h6v13h-6a2.5 2.5 0 0 0-2 2 2.5 2.5 0 0 0-2-2H4Z',
  trash: 'M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5 7.5 20h9l1-13.5M10.5 10v6M13.5 10v6',
}

export default function Icon({ name, size = 20, className = '' }: { name: keyof typeof paths | string; size?: number; className?: string }) {
  const d = paths[name] ?? paths.check
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
