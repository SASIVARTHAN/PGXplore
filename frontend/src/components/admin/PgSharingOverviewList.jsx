import { Link } from 'react-router-dom'
import { displayCurrency, displayText, NO_DATA_LABEL } from '../../utils/displayValue'
import { formatCurrentBillIncluded, formatNoticePeriod } from '../../utils/formatPolicy'
import { getSharingLabel, sharingToEntries } from '../../utils/sharingTypes'
import { getStartingRent } from '../../utils/vacancy'

function formatRentLine(sharing) {
  const entries = sharingToEntries(sharing)
  if (entries.length === 0) return NO_DATA_LABEL

  const startingRent = getStartingRent(sharing)
  if (!Number.isFinite(startingRent)) return NO_DATA_LABEL

  return `from ${displayCurrency(startingRent)}`
}

function formatPolicyLine(pg) {
  const notice = formatNoticePeriod(pg.noticePeriodDays)
  const bill = formatCurrentBillIncluded(pg.currentBillIncluded)
  const parts = [notice, bill].filter((part) => part && part !== 'Not specified')

  return parts.length ? parts.join(' · ') : NO_DATA_LABEL
}

export default function PgSharingOverviewList({ pgs, emptyMessage = NO_DATA_LABEL }) {
  if (!pgs?.length) {
    return <div className="admin-empty-note">{emptyMessage}</div>
  }

  return (
    <ul className="admin-data-list">
      {pgs.map((pg) => {
        const sharingEntries = sharingToEntries(pg.sharing)
        const rentLine = formatRentLine(pg.sharing)
        const policyLine = formatPolicyLine(pg)

        return (
          <li key={pg.id} className="admin-data-card">
            <div className="min-w-0 flex-1">
              <Link
                to={`/admin/pgs/${pg.id}`}
                className="block truncate font-medium text-main hover:text-brand-emphasis"
              >
                {displayText(pg.name)}
              </Link>
              <p className="mt-0.5 truncate text-xs text-muted">{displayText(pg.area)}</p>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:items-end">
              <div className="sharing-type-chips">
                {sharingEntries.length ? (
                  sharingEntries.map((entry) => (
                    <span key={entry.type} className="sharing-type-chip">
                      {getSharingLabel(entry.type)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted">{NO_DATA_LABEL}</span>
                )}
              </div>

              <div className="text-left text-sm sm:text-right">
                <p
                  className={`font-semibold ${
                    rentLine === NO_DATA_LABEL ? 'text-sm font-medium text-muted' : 'text-brand-emphasis'
                  }`}
                >
                  {rentLine}
                </p>
                <p className="text-xs text-muted">{policyLine}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
