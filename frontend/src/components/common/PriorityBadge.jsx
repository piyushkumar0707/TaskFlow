const PRIORITY_STYLES = {
  low: 'text-green-700',
  medium: 'text-amber-700',
  high: 'text-red-700',
};

const PRIORITY_ICONS = {
  low: 'keyboard_arrow_down',
  medium: 'drag_handle',
  high: 'keyboard_double_arrow_up',
};

export default function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
  const icon = PRIORITY_ICONS[priority] || 'drag_handle';
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${cls}`}>
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
}
