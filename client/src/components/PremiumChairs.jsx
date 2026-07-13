import { premiumChairs } from "../data/products";
import premiumChairsImage from "../assets/premium-chairs.png";

const imagePositions = {
  "16% center": "object-[16%_center]",
  "50% center": "object-[50%_center]",
  "84% center": "object-[84%_center]",
};

const PremiumChairs = () => (
  <section className="bg-[#F8F5EF] px-5 py-[72px] md:px-10 lg:px-20">
    <div className="mb-9 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
      <div className="text-left">
        <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-brown">Premium Chairs</div>
        <h2 className="text-4xl font-black text-brand-dark md:text-[42px]">Crafted Comfort Collection</h2>
      </div>
      <p className="max-w-[340px] text-left text-sm leading-6 text-zinc-600">
        Statement chairs made with elevated materials, refined silhouettes, and details built for modern living spaces.
      </p>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {premiumChairs.map((chair) => (
        <article key={chair.id} className="overflow-hidden rounded-lg border border-[#E8DFD1] bg-white text-left shadow-product">
          <div className="relative flex min-h-[220px] items-center justify-center bg-gradient-to-br from-brand-sand to-white">
            <span className="absolute left-4 top-4 rounded-full bg-brand-dark px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
              {chair.badge}
            </span>
            <img
              src={premiumChairsImage}
              alt={chair.name}
              className={`h-[220px] w-full object-cover ${imagePositions[chair.imagePosition] || "object-center"} mix-blend-multiply`}
            />
          </div>

          <div className="px-6 py-7">
            <h3 className="mb-2.5 text-[21px] font-black text-brand-dark">{chair.name}</h3>
            <div className="mb-5 flex flex-wrap gap-2.5">
              {[chair.material, chair.accent].map((detail) => (
                <span key={detail} className="rounded-full bg-brand-cream px-2.5 py-1.5 text-xs text-[#69583A]">
                  {detail}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <strong className="text-lg text-brand-brown">₹ {chair.price.toLocaleString("en-IN")}</strong>
              <button className="border-2 border-brand-brown px-4 py-2.5 text-sm font-extrabold text-brand-brown transition-colors hover:bg-brand-brown hover:text-white">
                VIEW CHAIR
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default PremiumChairs;
