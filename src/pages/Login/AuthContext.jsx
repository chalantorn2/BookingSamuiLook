// src/pages/Login/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../services/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ตรวจสอบ session จาก localStorage หรือวิธีอื่น (ถ้ามี)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, rememberMe = false) => {
    try {
      setLoading(true);
      // ค้นหาผู้ใช้ในตาราง users
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("active", true)
        .single();

      if (error || !userData) {
        return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
      }

      // ตรวจสอบรหัสผ่าน (plain text)
      if (userData.password !== password) {
        return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
      }

      // อัปเดต last_login
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userData.id);

      setUser(userData);
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("user");
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("user");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
