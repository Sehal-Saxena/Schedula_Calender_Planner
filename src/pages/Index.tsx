
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    // Auto-login for demo purposes
    if (!user) {
      login("demo@schedula.com", "demopassword");
    }
    
    // Always redirect to dashboard
    navigate("/dashboard");
  }, [navigate, user, login]);

  return null;
};

export default Index;
