const cards = [
  { bg: "bg-[#E4F2F7]", title: "Exclusive offers for you", cta: "SIGN UP" },
  { bg: "bg-[#F5F5E0]", title: "Join Our Community", cta: "JOIN FREE NOW" },
  { bg: "bg-[#FDE8E8]", title: "Get our FREE app Now!", apps: true },
];

const CTACards = () => (
  <section className="px-5 py-16 md:px-10 lg:px-20">
    <div className="grid gap-6 lg:grid-cols-3">
      {cards.map(({ bg, title, cta, apps }) => (
        <article key={title} className={`${bg} rounded-lg px-6 py-9 sm:px-8`}>
          <h3 className="mb-3 text-xl font-black text-brand-dark">{title}</h3>
          <p className="mb-6 text-[13px] leading-6 text-zinc-600">
            Get weekly deals, valuable health information and more.
          </p>
          {apps ? (
            <div className="flex flex-wrap gap-2.5">
              {["Google Play", "Apple Store"].map((store) => (
                <button
                  key={store}
                  className="rounded-md bg-brand-dark px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-brown"
                >
                  {store}
                </button>
              ))}
            </div>
          ) : (
            <button className="border-2 border-brand-dark px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-brand-dark transition-colors hover:bg-brand-dark hover:text-white">
              {cta}
            </button>
          )}
        </article>
      ))}
    </div>
  </section>
);

export default CTACards;
