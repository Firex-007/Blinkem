import { Shimmer } from './Skeleton';

export default function Skeleton({ className }) {
  return (
    <div className={`inline-block w-full h-full rounded bg-surface2 animate-shimmer overflow-hidden ${className || ''}`}>
      <Shimmer />
    </div>
  );
}
