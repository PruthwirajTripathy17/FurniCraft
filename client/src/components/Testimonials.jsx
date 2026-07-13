import { useEffect, useState } from "react";
import Stars from "./Stars";
import { apiRequest } from "../services/api";
import { TestimonialCardSkeleton } from "./skeleton/Skeletons";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    apiRequest("/testimonials")
      .then(setTestimonials)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const visible = testimonials.slice(activeIndex, activeIndex + 3);
  const padded =
    visible.length < 3 && testimonials.length > 0
      ? [...visible, ...testimonials.slice(0, 3 - visible.length)]
      : visible;

  const prev = () =>
    setActiveIndex((i) =>
      i === 0 ? Math.max(0, testimonials.length - 3) : Math.max(0, i - 1),
    );
  const next = () =>
    setActiveIndex((i) =>
      i + 3 >= testimonials.length ? 0 : i + 1,
    );

  return (
    <section id="about" className="bg-[#1F1F1F] px-5 py-20 text-center md:px-10 lg:px-20">
      <div className="mb-4 inline-block border border-zinc-600 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
        Testimonials
      </div>
      <h2 className="mb-12 text-4xl font-black text-white md:text-[44px]">Client Feedback</h2>

      <div className="mx-auto mb-10 grid max-w-[920px] gap-5 md:grid-cols-3">
        {loading ? (
          <TestimonialCardSkeleton count={3} />
        ) : testimonials.length === 0 ? (
          <p className="col-span-3 text-zinc-400">No testimonials yet.</p>
        ) : (
          padded.map((t) => (
            <article key={t._id} className="relative rounded-lg bg-white px-6 py-7 text-left shadow-lg transition-transform hover:-translate-y-1">
              <div className="absolute right-5 top-4 font-serif text-4xl leading-none text-brand-gold opacity-50">"</div>
              <Stars rating={t.rating} />
              
              <div className="flex items-center gap-3.5 mt-3.5 mb-3">
                {t.image ? (
                  <img 
                    src={t.image} 
                    alt={t.name} 
                    className="size-11 rounded-full object-cover border border-zinc-100 shadow-sm" 
                  />
                ) : (
                  <div className="size-11 rounded-full bg-brand-sand flex items-center justify-center text-sm font-bold text-brand-brown">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-base font-bold text-brand-dark leading-tight">{t.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{t.role}</div>
                </div>
              </div>

              <p className="text-[13px] leading-6 text-zinc-600">
                {t.feedback}
              </p>
            </article>
          ))
        )}
      </div>

      {!loading && testimonials.length > 3 && (
        <div className="flex justify-center gap-3">
          <button
            onClick={prev}
            className="size-11 rounded-full border border-zinc-500 text-base text-white transition-colors hover:border-white hover:bg-white/10"
          >
            &lt;
          </button>
          <button
            onClick={next}
            className="size-11 rounded-full border border-zinc-500 text-base text-white transition-colors hover:border-white hover:bg-white/10"
          >
            &gt;
          </button>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
