import React, { createContext, useContext, useState, type ReactNode } from "react";
import { login, refreshToken } from "../services/apis/auth"; 
import type { ResponseLoginDTO, RefreshResultDTO } from "../types"; 

export interface User {
  id: number;
  username: string;
  role: string; 
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  storedRefreshToken: string | null; // State lưu refresh token
  setRefreshToken: (token: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [storedRefreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );

  const handleLogin = async (username: string, password: string) => {
    try {
      const response: ResponseLoginDTO = await login({ username, password });
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      const payload = JSON.parse(atob(response.accessToken.split(".")[1]));
      const userInfo: User = {
        id: parseInt(payload.sub), 
        username,
        role: payload.role || "Guest", 
      };
      setUser(userInfo);
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const handleRefreshToken = async () => {
  if (!storedRefreshToken) throw new Error("Không có refresh token!");
  try {
    const response: RefreshResultDTO = await refreshToken({ refreshToken: storedRefreshToken });
    localStorage.setItem("accessToken", response.accessToken);
    setAccessToken(response.accessToken);
  } catch (error: any) {
    handleLogout();
    throw new Error(error.message || "Làm mới token thất bại!");
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        storedRefreshToken, // State lưu refresh token
        setRefreshToken,
        login: handleLogin,
        logout: handleLogout,
        refreshAccessToken: handleRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};