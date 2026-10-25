import { Zap } from 'lucide-react';

export default function Logo({ className }) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center text-onprimary">
        <Zap className="w-5 h-5" />
      </div>
      <span className="font-800 tracking-[-0.02em] text-lg">Blink'em</span>
    </div>
  );
}
