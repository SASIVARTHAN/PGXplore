import { displayDateTime, displayText, NO_DATA_LABEL } from '../../utils/displayValue'

export default function ActivityList({ activities, emptyMessage = NO_DATA_LABEL }) {
  if (!activities?.length) {
    return <div className="admin-empty-note">{emptyMessage}</div>
  }

  return (
    <ul className="admin-activity-list">
      {activities.map((a) => (
        <li key={a.id} className="admin-activity-item">
          <div className="min-w-0 flex-1">
            <p className="break-words font-medium text-main">{displayText(a.action)}</p>
            <p className="mt-0.5 break-words text-muted">{displayText(a.detail)}</p>
            <p className="mt-1 text-xs text-muted">{displayDateTime(a.at)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
