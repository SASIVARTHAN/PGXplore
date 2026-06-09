import { FiBell, FiCalendar, FiHome } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa6'
import { useAdmin } from '../../contexts/AdminContext'
import { useToast } from '../../components/Toast'

const typeIcon = { booking: FiCalendar, review: FaStar, vacancy: FiHome }

function NotificationIcon({ type }) {
  const Icon = typeIcon[type] || FiBell
  return <Icon aria-hidden />
}

export default function AdminNotificationsPage() {
  const { state, markNotificationRead, markAllNotificationsRead } = useAdmin()
  const { showToast } = useToast()

  const bookingAlerts = state.notifications.filter((n) => n.type === 'booking')
  const reviewAlerts = state.notifications.filter((n) => n.type === 'review')
  const vacancyAlerts = state.notifications.filter((n) => n.type === 'vacancy')

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={() => {
            markAllNotificationsRead()
            showToast('All notifications marked read.')
          }}
        >
          Mark all read
        </button>
      </div>

      {[
        { title: 'New booking alerts', items: bookingAlerts },
        { title: 'New review alerts', items: reviewAlerts },
        { title: 'Vacancy alerts', items: vacancyAlerts },
      ].map((section) => (
        <div key={section.title} className="admin-panel">
          <h2 className="admin-panel-title">{section.title}</h2>
          <ul className="mt-4 space-y-3">
            {section.items.length === 0 ? (
              <li className="text-sm text-muted">No alerts.</li>
            ) : (
              section.items.map((n) => (
                <li
                  key={n.id}
                  className={`flex gap-3 rounded-xl border border-app p-4 ${n.read ? 'bg-card-muted opacity-70' : 'bg-card'}`}
                >
                  <span className="text-xl"><NotificationIcon type={n.type} /></span>
                  <div className="flex-1">
                    <p className="font-medium text-main">{n.title}</p>
                    <p className="text-sm text-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-muted">{new Date(n.at).toLocaleString()}</p>
                  </div>
                  {!n.read && (
                    <button type="button" className="btn-secondary text-xs" onClick={() => markNotificationRead(n.id)}>
                      Mark read
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  )
}
