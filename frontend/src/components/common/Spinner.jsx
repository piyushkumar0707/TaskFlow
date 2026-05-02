export default function Spinner({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className={`${sizeClass} border-2 border-surface-container-high border-t-primary rounded-full animate-spin`} />
  );
}
