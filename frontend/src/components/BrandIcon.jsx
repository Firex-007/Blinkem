// Monochrome brand logo (simple-icons SVG in /public/icons/brands) tinted with currentColor via CSS mask.
export default function BrandIcon({ name, className = '' }) {
  const src = `url(/icons/brands/${name}.svg)`;
  return (
    <span
      aria-hidden="true"
      className={`brand-icon ${className}`}
      style={{ WebkitMaskImage: src, maskImage: src }}
    />
  );
}
