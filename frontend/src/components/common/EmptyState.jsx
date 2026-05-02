export default function EmptyState({ icon = 'inbox', title = 'Nothing here', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
      {description && <p className="text-sm text-on-surface-variant max-w-xs">{description}</p>}
    </div>
  );
}
