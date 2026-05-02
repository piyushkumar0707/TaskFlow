const STATUS_STYLES = {
  todo: 'bg-gray-100 text-gray-700 border border-gray-200',
  in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
  done: 'bg-green-50 text-green-700 border border-green-200',
};

const STATUS_LABELS = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.todo;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
