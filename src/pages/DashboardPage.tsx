
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import Stats from "@/components/dashboard/Stats";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarPlus, Rocket } from "lucide-react";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white font-title flex items-center">
          <span className="mr-2">Mission Control</span>
          <Rocket className="h-6 w-6 text-primary animate-float" />
        </h1>
        <Link to="/calendar">
          <Button className="flex items-center gap-2 bg-cosmic-purple hover:bg-cosmic-purple/80">
            <CalendarPlus className="h-4 w-4" />
            Schedule Appointment
          </Button>
        </Link>
      </div>
      
      <Stats onFilterChange={setActiveFilter} activeFilter={activeFilter} />
      
      <div className="mt-8">
        <AppointmentsList activeFilter={activeFilter} />
      </div>
    </Layout>
  );
};

export default DashboardPage;
