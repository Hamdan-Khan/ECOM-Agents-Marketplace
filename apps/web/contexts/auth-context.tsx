import { LoginResponse } from "@/app/login/page";
import { useAuth } from "@/hooks/use-auth";
import { apiPost } from "@/services/api";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { setIsAdmin } = useAuth();

  // useEffect(() => {
  //   const checkLocalStorage = async () => {
  //     const storedUser = localStorage.getItem("user");
  //     const storedToken = localStorage.getItem("token");
  //     if (storedUser && storedToken) {
  //       const parsedUser = JSON.parse(storedUser);
  //       if (parsedUser && typeof parsedUser === "object") {
  //         const data = await apiPost<LoginResponse>("/users/login", {
  //           email: parsedUser.email,
  //           password: parsedUser.password,
  //         });
  //         if (data) {
  //           setUser(data.user);
  //           setToken(data.token);
  //           setIsAdmin(data.user.role == "ADMIN");
  //         }
  //       }
  //     }
  //   };

  //   checkLocalStorage();
  // }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
