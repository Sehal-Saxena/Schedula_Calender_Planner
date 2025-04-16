
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  role: "user" | "admin";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate authentication loading
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("appointmentUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    // Simulate delay for checking authentication
    setTimeout(checkAuth, 1000);
  }, []);

  // Mock login function - this would connect to Supabase in production
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo: create mock user based on email
      // In real app: this would validate with Supabase
      const isAdmin = email.includes("admin");
      const mockUser = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        role: isAdmin ? "admin" : "user" as "admin" | "user",
      };
      
      setUser(mockUser);
      localStorage.setItem("appointmentUser", JSON.stringify(mockUser));
      toast.success("Login successful!");
    } catch (error) {
      toast.error("Login failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock signup function - would connect to Supabase
  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        role: "user" as "user",
      };
      
      setUser(mockUser);
      localStorage.setItem("appointmentUser", JSON.stringify(mockUser));
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("appointmentUser");
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
