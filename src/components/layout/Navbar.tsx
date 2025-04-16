
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, ChevronDown, LogOut, User } from "lucide-react";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-background/80 backdrop-blur-md shadow-lg shadow-black/10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <Link to="/" className="text-2xl font-bold text-glow">
            Schedula
          </Link>
          <div className="hidden md:flex ml-8 gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-all duration-300 ease-in-out px-3 py-1.5 rounded-md ${
                location.pathname === '/' 
                  ? 'bg-primary/20 text-primary font-semibold ring-2 ring-primary/50 hover:bg-primary/30' 
                  : 'hover:bg-white/10 hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/calendar" 
              className={`text-sm font-medium transition-all duration-300 ease-in-out px-3 py-1.5 rounded-md ${
                location.pathname === '/calendar' 
                  ? 'bg-primary/20 text-primary font-semibold ring-2 ring-primary/50 hover:bg-primary/30' 
                  : 'hover:bg-white/10 hover:text-primary'
              }`}
            >
              Calendar
            </Link>
            {user?.role === "admin" && (
              <Link 
                to="/admin" 
                className={`text-sm font-medium transition-all duration-300 ease-in-out px-3 py-1.5 rounded-md ${
                  location.pathname === '/admin' 
                    ? 'bg-primary/20 text-primary font-semibold ring-2 ring-primary/50 hover:bg-primary/30' 
                    : 'hover:bg-white/10 hover:text-primary'
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2 items-center border-white/10">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {user.email}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/80 backdrop-blur-md border border-white/10">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem className="md:hidden">
                <Link to="/" className="flex items-center w-full">
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="md:hidden">
                <Link to="/calendar" className="flex items-center w-full">
                  Calendar
                </Link>
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem className="md:hidden">
                  <Link to="/admin" className="flex items-center w-full">
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
