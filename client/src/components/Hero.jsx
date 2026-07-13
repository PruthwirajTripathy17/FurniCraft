import { useContext } from "react";
import Btn from "./Btn";
import { ShopContext } from "../context/ShopContext";
import premiumChairsImage from "../assets/premium-chairs.png";

const Hero = () => {
  const { setActiveTab } = useContext(ShopContext);

  const handleScrollToShop = () => {
    setActiveTab("All Collection");
    const element = document.getElementById("shop");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex min-h-[88vh] flex-col items-center gap-10 overflow-hidden bg-brand-cream px-5 py-16 md:px-10 lg:flex-row lg:px-24">
      <div className="absolute right-[4%] top-[8%] hidden h-80 w-44 opacity-25 [background-image:radial-gradient(circle,#C4A55A_1.2px,transparent_1.2px)] [background-size:18px_18px] lg:block" />

      <div className="relative z-10 max-w-xl flex-shrink-0 lg:basis-[520px]">
        <div className="mb-6 inline-block border border-brand-brown px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-brown">
          New Arrival
        </div>

        <h1 className="mb-6 text-5xl font-black leading-[1.03] text-brand-dark sm:text-6xl lg:text-[74px]">
          Elevate
          <br />
          Your Home
          <br />
          Aesthetics
        </h1>

        <p className="mb-10 max-w-sm text-[15px] leading-7 text-zinc-600">
          A furniture e-commerce company operates in the digital space, offering a wide range of furniture products for sale through an online platform.
        </p>

        <div className="flex flex-wrap gap-4">
          <Btn onClick={handleScrollToShop}>BUY NOW</Btn>
          <Btn variant="outline" onClick={handleScrollToShop}>VIEW DETAILS</Btn>
        </div>
      </div>

      <div className="relative z-10 flex min-h-[420px] flex-1 items-center justify-center lg:min-h-[520px]">
        <div className="absolute right-2 top-11 size-[320px] rounded-full bg-[#E8DDCB] sm:size-[420px]" />
        <img
          src={premiumChairsImage}
          alt="Premium lounge chair"
          className="relative z-10 h-[420px] w-full max-w-[520px] object-cover object-[16%_center] mix-blend-multiply drop-shadow-[0_28px_32px_rgba(70,50,24,.22)] lg:h-[520px]"
        />
        <div className="absolute bottom-8 right-3 z-20 rounded-lg bg-white px-5 py-4 text-left shadow-soft sm:bottom-[70px] sm:right-5">
          <div className="mb-1 text-xs font-extrabold uppercase text-brand-brown">Premium Chair</div>
          <div className="text-lg font-black text-brand-dark">Velvet Lounge</div>
          <div className="text-sm text-zinc-500">₹ 4999.00</div>
        </div>
      </div>
    </section>  
  );
};

export default Hero;
