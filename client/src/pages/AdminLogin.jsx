import { useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiAlertTriangle } from "react-icons/fi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const { isAdminLoggedIn, adminUser, adminLogin, adminLogout } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  // If already logged in as Admin, redirect to dashboard
  if (isAdminLoggedIn && adminUser?.role === "admin") {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      const data = await adminLogin(email, password);
      const loggedUser = data?.user;

      if (loggedUser?.role !== "admin") {
        setAuthError("Access denied: You do not have administrator permissions.");
        adminLogout();
        return;
      }

      navigate(from === "/" ? "/admin" : from, { replace: true });
    } catch (error) {
      console.error(error);
      setAuthError(error.message || "Invalid credentials or server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Admin Visual Branding panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-zinc-900 to-amber-950 text-white flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,90,43,0.15),transparent)] pointer-events-none" />
        <h1 className="text-5xl font-black mb-6 tracking-tight">FurniCraft Admin</h1>
        <p className="text-xl text-zinc-300 max-w-md leading-relaxed">
          Manage products, monitor sales reports, coordinate collections, and update site configurations.
        </p>
      </div>

      {/* Admin Form Panel */}
      <div className="flex-1 flex justify-center items-center bg-zinc-50 p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-zinc-100">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-zinc-900">
              Admin Panel
            </h2>
            <p className="text-zinc-500 mt-2">Sign in with administrator credentials</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <FiAlertTriangle className="flex-shrink-0" size={16} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <FiMail className="absolute left-4 top-4 text-zinc-400" />
              <input
                type="email"
                placeholder="Admin Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-brown outline-none transition-all"
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
                className="w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-brown outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-xl font-bold tracking-wide transition shadow-md active:scale-98"
            >
              Access Console
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
