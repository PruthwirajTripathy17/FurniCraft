import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => (
  <footer
    id="contact"
    className="bg-brand-dark px-5 pb-7 pt-16 text-white md:px-10 lg:px-20"
  >
    <div className="mb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr] lg:gap-12">

      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
            <img
              src="../src/assets/furnicraftlogo.png"
              alt="FurniCraft"
              className="h-full w-full object-cover"
            />
          </div>

          <h2 className="text-2xl font-bold text-white">
            FurniCraft
          </h2>
        </div>

        <p className="max-w-xs text-sm leading-6 text-zinc-400">
          Premium furniture crafted for comfort, style, and durability.
          Transform your home with timeless designs.
        </p>

        <div className="mt-5 flex gap-3">
          {[
            <FaFacebookF />,
            <FaTwitter />,
            <FaLinkedinIn />,
            <FaInstagram />,
          ].map((icon, index) => (
            <button
              key={index}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A2A] transition-all duration-300 hover:bg-brand-brown"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>


      <div>
        <h4 className="mb-5 text-lg font-semibold">Services</h4>

        {[
          "Log In",
          "Wishlist",
          "Return Policy",
          "Privacy Policy",
          "Shopping FAQs",
        ].map((item) => (
          <a
            key={item}
            href="#"
            className="mb-3 block text-sm text-zinc-400 hover:text-white"
          >
            {item}
          </a>
        ))}
      </div>


      <div>
        <h4 className="mb-5 text-lg font-semibold">Company</h4>

        {[
          "Home",
          "About Us",
          "Pages",
          "Blog",
          "Contact Us",
        ].map((item) => (
          <a
            key={item}
            href="#"
            className="mb-3 block text-sm text-zinc-400 hover:text-white"
          >
            {item}
          </a>
        ))}
      </div>

      <div>
        <h4 className="mb-5 text-lg font-semibold">Contact</h4>

        <p className="mb-4 text-sm leading-6 text-zinc-400">
          Bhubaneswar,Odisha
          <br />
          India,752054
        </p>

        <p className="mb-3 text-sm text-zinc-400">
          📍 Near Kalinga Stadium,Bhubaneswar,Odisha
        </p>

        <div>
          <p className="text-sm font-medium text-white">
            +91-7077886264
          </p>
          <p className="text-xs text-zinc-500">
            Mon - Sat: 9 AM - 5 PM
          </p>
        </div>
      </div>
    </div>


    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-6">
      <p className="text-sm text-zinc-500">
        © {new Date().getFullYear()} FurniCraft. All Rights Reserved.
      </p>

      <div className="flex gap-2">
        {["Payoneer", "Mastercard", "PayPal"].map((item) => (
          <div
            key={item}
            className="rounded bg-white px-3 py-1 text-xs font-semibold text-brand-dark"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex gap-3 text-sm text-zinc-500">
        <a href="#" className="hover:text-white">
          Terms & Conditions
        </a>

        <span>|</span>

        <a href="#" className="hover:text-white">
          Privacy Policy
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;