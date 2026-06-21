import PageShell from '../components/PageShell'

export default function LegalPage({ title, sections }) {
  return (
    <PageShell title={title} backFallback="/home">
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.heading} className="rounded-2xl border border-app bg-card p-6">
            <h2 className="text-lg font-semibold text-main">{section.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </PageShell>
  )
}
