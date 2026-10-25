import { Check } from 'lucide-react';
import { t } from '../i18n';

const STEPS = [
  { key: 'on_the_way', labelKey: 'status.on_the_way' },
  { key: 'arrived', labelKey: 'status.arrived' },
  { key: 'in_progress', labelKey: 'status.in_progress' },
  { key: 'completed', labelKey: 'status.completed' },
];

export default function StatusStepper({ currentStatus = 'on_the_way' }) {
  // Mapping current display status to index
  const statusOrder = {
    confirmed: 0,
    on_the_way: 0,
    arrived: 1,
    in_progress: 2,
    completed: 3,
  };

  const currentIndex = statusOrder[currentStatus] ?? 0;

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-surface2 z-0 rounded-full" />
        
        {/* Completed track line */}
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-primary z-0 rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 transition-all ${
                  isDone
                    ? 'bg-primary text-onprimary'
                    : isCurrent
                    ? 'bg-primary text-onprimary ring-4 ring-primary/20 scale-110'
                    : 'bg-surface2 text-muted border border-line'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-600 text-center whitespace-nowrap ${
                  isCurrent ? 'text-primary font-700' : isDone ? 'text-ink' : 'text-muted'
                }`}
              >
                {t(step.labelKey) || step.key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
