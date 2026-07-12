export default function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-app bg-card">
      <div className="aspect-[4/3] bg-stone-200 dark:bg-slate-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-stone-200 dark:bg-slate-800" />
        <div className="h-5 w-1/3 rounded bg-stone-200 dark:bg-slate-800" />
        <div className="h-3 w-full rounded bg-stone-200 dark:bg-slate-800" />
        <div className="h-3 w-2/3 rounded bg-stone-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}
