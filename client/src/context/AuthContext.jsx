import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { AuthContext } from "./auth-context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem("token")));

  const isLoggedIn = Boolean(user && localStorage.getItem("token"));

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    apiRequest("/auth/me")
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    saveSession(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // --- Admin Specific Sessions (Completely Independent from Customer Sessions) ---
  const [adminUser, setAdminUser] = useState(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  });
  const [isAdminLoading, setIsAdminLoading] = useState(() => Boolean(localStorage.getItem("adminToken")));

  const isAdminLoggedIn = Boolean(adminUser && localStorage.getItem("adminToken"));

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      return;
    }

    apiRequest("/auth/me", {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
      .then((data) => {
        setAdminUser(data.user);
        localStorage.setItem("adminUser", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setAdminUser(null);
      })
      .finally(() => setIsAdminLoading(false));
  }, []);

  const saveAdminSession = (data) => {
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.user));
    setAdminUser(data.user);
  };

  const adminLogin = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data?.user?.role !== "admin") {
      throw new Error("Access denied: You do not have administrator permissions.");
    }

    saveAdminSession(data);
    return data;
  };

  const adminRegister = async (name, email, password) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (data?.user?.role !== "admin") {
      throw new Error("Access denied: Registered user is not an administrator.");
    }

    saveAdminSession(data);
    return data;
  };

  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminUser(null);
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        login,
        logout,
        register,
        user,
        updateCurrentUser,
        
        isAdminLoggedIn,
        isAdminLoading,
        adminUser,
        adminLogin,
        adminRegister,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
