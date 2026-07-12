import { forwardRef } from 'react'

/**
 * Admin list page: fixed header inside the card, scrollable body for list items.
 */
const AdminScrollPanel = forwardRef(function AdminScrollPanel(
  { title, subtitle, headerActions, children, footer },
  bodyRef,
) {
  return (
    <div className="admin-scroll-panel">
      <div className="admin-scroll-panel__header">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="admin-panel-title">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
        </div>
      </div>
      <div ref={bodyRef} className="admin-scroll-panel__body">
        {children}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  )
})

export default AdminScrollPanel
