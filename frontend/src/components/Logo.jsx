export default function Logo({ className = '', size = 'md', onClick }) {
  const iconSizes = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
  };
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 select-none group cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(e);
        }
      }}
    >
      <img
        src="/logo-mark.png"
        alt="Blink'em Logo"
        className={`${iconSizes[size] || iconSizes.md} object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_10px_rgba(251,191,36,0.35)]`}
      />
      <div className="flex items-center tracking-[-0.03em] font-black leading-none">
        <span className={`${textSizes[size] || textSizes.md} font-black text-ink uppercase`}>
          BLINK
        </span>
        <span className={`${textSizes[size] || textSizes.md} font-black text-amber-500 dark:text-amber-400 uppercase ml-[1px]`}>
          EM
        </span>
      </div>
    </div>
  );
}
