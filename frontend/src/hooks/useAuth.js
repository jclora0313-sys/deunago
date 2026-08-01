import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (
      !storedUser ||
      storedUser === "undefined" ||
      storedUser === "null"
    ) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Usuario inválido en localStorage:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return null;
  }
};

export default function useAuth(showToast, trackingIntervalRef) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENT");

  const user = getStoredUser();

  const register = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name,
        phone,
        password,
        role,
      });

      showToast("Cuenta creada", "success");
      setMode("login");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error creando cuenta",
        "error"
      );
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        phone,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.reload();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error iniciando sesión",
        "error"
      );
    }
  };

  const logout = () => {
    if (trackingIntervalRef?.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.reload();
  };

  return {
    user,

    mode,
    setMode,

    name,
    setName,

    phone,
    setPhone,

    password,
    setPassword,

    role,
    setRole,

    register,
    login,
    logout,
  };
}