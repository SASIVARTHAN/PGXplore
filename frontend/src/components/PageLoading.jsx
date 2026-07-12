export default function PageLoading({ label = 'Loading…' }) {
  return (
    <div
      className="flex min-h-[min(28rem,70vh)] flex-col items-center justify-center gap-3 px-4 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600 dark:border-brand-900 dark:border-t-brand-400"
        aria-hidden
      />
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
