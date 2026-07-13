const Badge = ({ label, className = "left-3 top-3 bg-brand-brown" }) => (
  <span
    className={`absolute rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${className}`}
  >
    {label}
  </span>
);

export default Badge;
