const variants = {
  solid: "border-brand-brown bg-brand-brown text-white hover:bg-brand-brown-dark hover:border-brand-brown-dark",
  outline: "border-brand-brown bg-transparent text-brand-brown hover:bg-brand-brown hover:text-white",
  outlineW: "border-white bg-transparent text-white hover:bg-white hover:text-brand-dark",
};

const Btn = ({ children, variant = "solid", className = "", onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex min-h-12 items-center justify-center border-2 px-7 py-3 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${variants[variant] || variants.solid} ${className}`}
  >
    {children}
  </button>
);

export default Btn;
