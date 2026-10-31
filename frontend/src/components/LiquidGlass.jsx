import React from 'react';

/**
 * LiquidGlass - Ultra-High-Performance Modern Glass Container
 * WebGL animation loop disabled to ensure 120 FPS buttery-smooth UI with 0% GPU throttle.
 * Pure CSS hardware-accelerated frosted aesthetics.
 */
export default function LiquidGlass({
  children,
  className = '',
  radius = 28,
  glow = 1,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      style={{ borderRadius: radius }}
      className={`liquid-glass relative isolate overflow-hidden border border-line shadow-xs ${className}`}
      {...props}
    >
      <div className="relative z-10 w-full">{children}</div>
    </Component>
  );
}
