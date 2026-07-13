import { useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isLoggedIn, login, register } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  if (isLoggedIn) {
    return <Navigate to={from} replace />;
  }

  const isRegister = mode === "register";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let loggedUser;
      if (isRegister) {
        const data = await register(name, email, password);
        loggedUser = data?.user;
      } else {
        const data = await login(email, password);
        loggedUser = data?.user;
      }

      if (loggedUser?.role === "admin") {
        navigate(from === "/" ? "/admin" : from, { replace: true });
      } else {
        if (from.startsWith("/admin")) {
          navigate("/", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Customer Visual Branding panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-sand via-[#EDE8DE] to-brand-cream text-brand-dark flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,90,43,0.1),transparent)] pointer-events-none" />
        <h1 className="text-5xl font-black mb-6 tracking-tight text-brand-brown">FurniCraft</h1>
        <p className="text-xl text-zinc-600 max-w-md leading-relaxed">
          Sign in to save items in your wishlist, add premium handcrafted pieces to your cart, and coordinate your modern living space.
        </p>
      </div>

      {/* Customer Form Panel */}
      <div className="flex-1 flex justify-center items-center bg-[#FAF9F5] p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-zinc-100/60">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-brand-dark">
              {isRegister ? "Join FurniCraft" : "Welcome Back"}
            </h2>
            <p className="text-zinc-500 mt-2">Sign in to buy premium furniture</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="relative">
                <FiUser className="absolute left-4 top-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand-brown outline-none transition-all"
                />
              </div>
            )}

            <div className="relative">
              <FiMail className="absolute left-4 top-4 text-zinc-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand-brown outline-none transition-all"
              />
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-4 text-zinc-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand-brown outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-brown hover:bg-brand-brown-dark text-white py-3.5 rounded-xl font-bold tracking-wide transition shadow-md active:scale-98"
            >
              {isRegister ? "Create Account" : "Log In"}
            </button>
          </form>

          <button
            onClick={() => setMode(isRegister ? "login" : "register")}
            className="w-full mt-6 text-brand-brown hover:text-brand-brown-dark font-bold text-sm text-center block transition-colors"
          >
            {isRegister ? "Already have an account? Sign In" : "Create a new shopper account"}
          </button>
        </div>
      </div>
    </div>
  );
}
