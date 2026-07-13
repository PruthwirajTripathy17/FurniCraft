import { useContext } from "react";
import Btn from "./Btn";
import Countdown from "./Countdown";
import { ShopContext } from "../context/ShopContext";

const DealBanners = () => {
  const { setActiveTab } = useContext(ShopContext);

  const handleBuyNow = () => {
    setActiveTab("All Collection");
    const element = document.getElementById("shop");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="grid gap-6 px-5 pb-16 md:px-10 lg:grid-cols-2 lg:px-20">
      <div className="flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl bg-[#2A2A2A] px-8 py-12 sm:px-11">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">Hot Deal Furniture</div>
        <h3 className="mb-1.5 text-3xl font-black text-white">Furniture Limit Offer</h3>
        <h3 className="mb-7 text-3xl font-black text-white">30% Off</h3>
        <Btn variant="outlineW" className="w-fit" onClick={handleBuyNow}>
          BUY NOW
        </Btn>
      </div>

      <div className="flex min-h-[300px] flex-col justify-center rounded-2xl bg-brand-teal px-8 py-12 sm:px-11">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">Hot Deal Furniture</div>
        <h3 className="mb-7 text-3xl font-black text-white md:text-[32px]">Deals OF The Week</h3>
        <Countdown />
        <Btn variant="outlineW" className="w-fit" onClick={handleBuyNow}>
          BUY NOW
        </Btn>
      </div>
    </section>
  );
};

export default DealBanners;
