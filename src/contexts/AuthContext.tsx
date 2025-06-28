import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
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
  storedRefreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [storedRefreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      console.log("Restoring state:", {
        storedUser,
        storedToken,
        storedRefreshToken,
      });

      if (storedUser && !user) {
        setUser(JSON.parse(storedUser));
      } else if (storedToken) {
        try {
          const payload = JSON.parse(atob(storedToken.split(".")[1]));
          const userInfo: User = {
            id: parseInt(payload.sub),
            username: payload.username || "Unknown",
            role: payload.role || "Guest",
          };
          setUser(userInfo);
        } catch (error) {
          console.error("Failed to parse user from token:", error);
        }
      }

      if (!accessToken && storedRefreshToken) {
        try {
          await handleRefreshToken();
        } catch (error) {
          console.error("Refresh failed:", error);
          handleLogout();
        }
      }

      setIsInitialized(true);
    };

    initializeAuth();
  }, []); // Chạy một lần khi mount

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
      localStorage.setItem("user", JSON.stringify(userInfo));
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const handleRefreshToken = async () => {
    if (!storedRefreshToken) throw new Error("Không có refresh token!");
    try {
      const response: RefreshResultDTO = await refreshToken({
        refreshToken: storedRefreshToken,
      });
      localStorage.setItem("accessToken", response.accessToken);
      setAccessToken(response.accessToken);
      console.log("Token refreshed successfully");

      // Cập nhật user từ accessToken mới
      const payload = JSON.parse(atob(response.accessToken.split(".")[1]));
      const userInfo: User = {
        id: parseInt(payload.sub),
        username: payload.username || "Unknown",
        role: payload.role || "Guest",
      };
      setUser(userInfo);
      localStorage.setItem("user", JSON.stringify(userInfo));
    } catch (error: any) {
      handleLogout();
      console.error("Refresh token failed:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        storedRefreshToken,
        setRefreshToken,
        login: handleLogin,
        logout: handleLogout,
        refreshAccessToken: handleRefreshToken,
        isInitialized,
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
