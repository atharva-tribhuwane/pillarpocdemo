import Reveal from '../Reveal'

interface TierClarityPanelProps {
  /** "Who belongs here" body copy */
  who: string
  /** "What you get" body copy */
  get: string
}

export default function TierClarityPanel({ who, get }: TierClarityPanelProps) {
  const blocks = [
    { label: 'Who belongs here', body: who },
    { label: 'What you get', body: get },
  ]

  return (
    <section className="relative py-28 md:py-36" aria-label="Who belongs and what you get">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Reveal mode="block" className="panel p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            {blocks.map((block) => (
              <div key={block.label}>
                <h2
                  className="text-[1.05rem] font-light uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text)' }}
                >
                  {block.label}
                </h2>
                <span
                  className="my-5 block h-px w-full"
                  style={{ background: 'var(--hairline)' }}
                />
                <p className="body-copy">{block.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
