import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { companyInfo } from '../data/companyData'

export default function CompanyDetailsPage() {
  return (
    <PageShell title="Company Details" subtitle={companyInfo.tagline}>
      <div className="space-y-8">
        <section className="rounded-2xl border border-app bg-card p-6">
          <h2 className="text-xl font-semibold text-main">About {companyInfo.name}</h2>
          <p className="mt-3 leading-relaxed text-muted">{companyInfo.about}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Founded</dt>
              <dd className="mt-1 font-medium text-main">{companyInfo.founded}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Head office</dt>
              <dd className="mt-1 font-medium text-main">{companyInfo.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${companyInfo.email}`} className="font-medium text-brand-emphasis hover:underline">
                  {companyInfo.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</dt>
              <dd className="mt-1">
                <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="font-medium text-brand-emphasis hover:underline">
                  {companyInfo.phone}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-main">Our values</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {companyInfo.values.map((item) => (
              <div key={item.title} className="rounded-2xl border border-app bg-card p-5">
                <h3 className="font-semibold text-main">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="action-row">
          <Link to="/home" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/owner" className="btn-secondary">
            Owner program
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
