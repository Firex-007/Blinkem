export function Shimmer() {
  return (
    <div className="absolute inset-0 flex items-center -translate-x-full animate-[shimmer_1.4s_infinite]" aria-hidden="true">
      <div className="h-full w-[3rem] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}
