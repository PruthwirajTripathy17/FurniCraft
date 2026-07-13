import { useContext } from "react";
import Btn from "./Btn";
import Stars from "./Stars";
import { ShopContext } from "../context/ShopContext";

const HotDeal = () => {
  const { setActiveTab } = useContext(ShopContext);

  const handleBuyNow = () => {
    setActiveTab("Sofa");
    const element = document.getElementById("shop");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="grid min-h-[420px] lg:grid-cols-2">
      <div className="flex items-center justify-center bg-brand-cream p-6 md:p-16">
        <div className="border-2 border-white/30 bg-brand-brown px-8 py-12 outline outline-1 -outline-offset-[14px] outline-white/20 sm:px-11">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-white/65">Hot Deal Furniture</div>
          <h2 className="mb-8 text-4xl font-black leading-tight text-white md:text-[40px]">
            Live Furniture
            <br />
            Your Love
          </h2>
          <Btn variant="outlineW" onClick={handleBuyNow}>BUY NOW</Btn>
        </div>
      </div>

      <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80" 
          alt="Sofa Deal" 
          className="absolute inset-0 h-full w-full object-cover transform hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
          <div className="text-5xl font-black text-white tracking-widest drop-shadow-lg md:text-7xl">SOFA</div>
        </div>
        <div className="absolute right-[8%] top-[28%] z-10 rounded-md bg-white px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,.12)]">
          <div className="mb-1.5 text-[15px] font-bold text-brand-dark">SOFA</div>
          <Stars rating={4} />
          <div className="mt-1.5 font-bold text-brand-brown">₹ 19000.00</div>
        </div>
      </div>
    </section>
  );
};

export default HotDeal;
