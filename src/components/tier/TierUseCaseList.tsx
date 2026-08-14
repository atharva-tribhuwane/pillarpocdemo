
export default function TierUseCaseList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item}
          className="group border-b py-3.5 transition-transform duration-[400ms] hover:translate-x-2"
          style={{
            borderColor: 'var(--hairline)',
            transitionTimingFunction: 'cubic-bezier(0.9,0,0.4,1)',
          }}
        >
          <span className="uc-row-inner block will-change-transform">
            <span
              className="uc-dash mr-3 transition-colors duration-300 group-hover:text-[var(--accent-bright)]"
              style={{ color: 'var(--accent-brand)' }}
              aria-hidden="true"
            >
              —
            </span>
            <span
              className="text-[1.05rem] font-light leading-[1.75] transition-opacity duration-300 group-hover:opacity-100"
              style={{ color: 'var(--text)', opacity: 0.85 }}
            >
              {item}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
