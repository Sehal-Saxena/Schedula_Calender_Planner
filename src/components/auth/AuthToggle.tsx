
import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { Button } from "@/components/ui/button";

interface AuthToggleProps {
  onSuccess?: () => void;
}

export const AuthToggle: React.FC<AuthToggleProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="mx-auto bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      {isLogin ? (
        <LoginForm onSuccess={onSuccess} />
      ) : (
        <SignupForm onSuccess={onSuccess} />
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>
        <Button
          variant="link"
          className="text-primary p-0 h-auto"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Sign up" : "Sign in"}
        </Button>
      </div>
    </div>
  );
};
