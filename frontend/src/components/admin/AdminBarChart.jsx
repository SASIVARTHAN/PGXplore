export default function AdminBarChart({ title, data, valuePrefix = '' }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="admin-chart-card">
      <h3 className="admin-chart-title">{title}</h3>
      <div className="mt-4 flex items-end justify-between gap-2" style={{ minHeight: 140 }}>
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full max-w-[2.5rem] rounded-t-md bg-brand-500 dark:bg-brand-400"
              style={{ height: `${Math.max(12, (item.value / max) * 120)}px` }}
              title={`${valuePrefix}${item.value.toLocaleString('en-IN')}`}
            />
            <span className="text-center text-[10px] font-medium text-muted sm:text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
