import { Link, useParams } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import BackButton from '../components/BackButton'
import PageShell from '../components/PageShell'
import { ownerProgramInfo } from '../data/companyData'
import { useListings } from '../contexts/AdminContext'

export default function OwnerDetailsPage() {
  const { pgId } = useParams()
  const { getPGById } = useListings()
  const pg = pgId ? getPGById(pgId) : null

  if (pg?.owner) {
    const { owner } = pg
    return (
      <PageShell title="Owner Details" subtitle={pg.name} backFallback={`/pg/${pg.id}`} backTo={`/pg/${pg.id}`}>
        <div className="max-w-lg rounded-2xl border border-app bg-card p-6">
          <p className="text-sm text-muted">{owner.role}</p>
          <h2 className="mt-1 text-2xl font-bold text-main">{owner.name}</h2>
          <p className="mt-4 text-sm text-muted">Listed property: {pg.name} · {pg.area}</p>
          <div className="action-row mt-6">
            <a href={`tel:${owner.phone.replace(/\s/g, '')}`} className="btn-primary">
              Call owner
            </a>
            {owner.email && (
              <a href={`mailto:${owner.email}`} className="btn-secondary">
                Email owner
              </a>
            )}
          </div>
          <p className="mt-4 text-sm text-muted">
            Phone:{' '}
            <a href={`tel:${owner.phone.replace(/\s/g, '')}`} className="text-brand-emphasis">
              {owner.phone}
            </a>
          </p>
          <BackButton to={`/pg/${pg.id}`} label="Back to listing" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Owner Details" subtitle={ownerProgramInfo.title}>
      <div className="space-y-8">
        <section className="rounded-2xl border border-app bg-card p-6">
          <p className="leading-relaxed text-muted">{ownerProgramInfo.description}</p>
          <ul className="mt-6 space-y-3">
            {ownerProgramInfo.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-main">
                <FiCheck aria-hidden className="mt-0.5 shrink-0 text-brand-emphasis" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-app bg-card-muted p-6">
          <h2 className="font-semibold text-main">Get in touch</h2>
          <p className="mt-2 text-sm text-muted">Reach our owner partnerships team to list your PG.</p>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              Email:{' '}
              <a href={`mailto:${ownerProgramInfo.contactEmail}`} className="font-medium text-brand-emphasis">
                {ownerProgramInfo.contactEmail}
              </a>
            </p>
            <p>
              Phone:{' '}
              <a href={`tel:${ownerProgramInfo.contactPhone.replace(/\s/g, '')}`} className="font-medium text-brand-emphasis">
                {ownerProgramInfo.contactPhone}
              </a>
            </p>
          </div>
        </section>

        <div className="action-row">
          <Link to="/company" className="btn-secondary">
            Company details
          </Link>
          <Link to="/home" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
