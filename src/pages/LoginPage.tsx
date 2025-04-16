
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const LoginPage: React.FC = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Auto-login with demo account
    const autoLogin = async () => {
      try {
        await login("demo@schedula.com", "password123");
      } catch (error) {
        console.error("Auto-login failed", error);
      }
    };
    
    if (!user) {
      autoLogin();
    }
  }, [user, login]);
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2742&q=80')] bg-cover bg-center px-4">
      <div className="max-w-md w-full text-center glass-card p-8 rounded-xl space-y-4">
        <div className="bg-primary p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
        <h1 className="text-4xl font-bold text-glow">Schedula</h1>
        <p className="text-xl font-medium text-white/90">Accessing your dashboard</p>
        <p className="text-muted-foreground">
          Loading your appointments and scheduled events...
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
