import { useContext } from "react";
import Btn from "./Btn";
import { ShopContext } from "../context/ShopContext";

const promos = [
  { 
    pct: "GET 30% OFF", 
    title: "Wicker Hanging\nChairs", 
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80", 
    category: "Chair" 
  },
  { 
    pct: "GET 15% OFF", 
    title: "Brasslegged\nArmchair", 
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=400&q=80", 
    category: "Chair" 
  },
];

const PromoBanners = () => {
  const { setActiveTab } = useContext(ShopContext);

  const handlePromoClick = (category) => {
    setActiveTab(category);
    const element = document.getElementById("shop");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="grid gap-6 px-5 pt-12 md:px-10 lg:grid-cols-2 lg:px-20">
      {promos.map(({ pct, title, image, category }) => (
        <div key={title} className="flex items-center justify-between gap-6 rounded-2xl bg-[#E4F2F7] px-6 py-10 sm:px-10 sm:py-11">
          <div>
            <div className="mb-3 text-[13px] font-bold uppercase text-brand-brown">{pct}</div>
            <h3 className="mb-6 whitespace-pre-line text-3xl font-black leading-tight text-brand-dark">{title}</h3>
            <Btn onClick={() => handlePromoClick(category)}>BUY NOW</Btn>
          </div>
          <img 
            src={image} 
            alt={title.replace("\n", " ")} 
            className="h-28 w-28 md:h-36 md:w-36 object-cover rounded-xl shadow-sm hover:scale-105 transition-transform duration-300 bg-white border border-zinc-150" 
          />
        </div>
      ))}
    </section>
  );
};

export default PromoBanners;
