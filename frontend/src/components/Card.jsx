export default function Card({ children, className }) {
  return (
    <div className={`bg-surface border border-line rounded-card shadow-sm2 p-4 ${className || ''}`}>{children}</div>
  );
}
