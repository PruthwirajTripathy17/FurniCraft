const features = [
  { ic: "TRK", t: "Free Delivery", s: "Free shipping on all order" },
  { ic: "PAY", t: "Money Return", s: "Back guarantee under 7 day" },
  { ic: "24H", t: "Online Support 24/7", s: "Support online 24 hours a day" },
  { ic: "OK", t: "Reliable", s: "Trusted by 1000+ brands" },
];

const FeaturesBar = () => (
  <section className="grid gap-6 border-b border-[#EEEAE4] px-5 py-11 sm:grid-cols-2 md:px-10 lg:grid-cols-4 lg:px-20">
    {features.map(({ ic, t, s }) => (
      <div key={t} className="flex items-center gap-3.5">
        <div className="flex size-[54px] flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-brown text-sm font-bold text-brand-brown">
          {ic}
        </div>
        <div>
          <div className="text-[15px] font-bold text-brand-dark">{t}</div>
          <div className="text-xs text-zinc-500">{s}</div>
        </div>
      </div>
    ))}
  </section>
);

export default FeaturesBar;
