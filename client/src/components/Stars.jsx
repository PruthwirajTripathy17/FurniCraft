import { FaStar } from "react-icons/fa";

const Stars = ({ rating = 0, max = 5, size = 14, className = "" }) => (
  <div className={`flex gap-0.5 ${className}`} aria-label={`${rating} out of ${max} stars`}>
    {Array.from({ length: max }).map((_, i) => (
      <FaStar
        key={i}
        size={size}
        className={`${i < rating ? "text-brand-gold fill-current" : "text-zinc-300 dark:text-zinc-700"}`}
      />
    ))}
  </div>
);

export default Stars;

