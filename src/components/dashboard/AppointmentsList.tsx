
import React, { useState, useMemo } from "react";
import { Appointment, useAppointments } from "@/context/AppointmentContext";
import { format, isToday, isFuture, isPast } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MoreHorizontal,
  Search,
  Rocket,
  Star,
  FileText,
  Briefcase,
  Coffee,
} from "lucide-react";

// Sample appointment titles and descriptions
const appointmentSamples = [
  { 
    title: "Interstellar Investment Review",
    description: "Annual portfolio assessment and future growth strategy planning for galactic markets.",
    icon: Star
  },
  { 
    title: "Lunar Property Acquisition",
    description: "Discussion about investment opportunities in lunar real estate and development projects.",
    icon: Rocket
  },
  { 
    title: "Space Tourism Portfolio Planning",
    description: "Evaluating investment opportunities in the emerging space tourism industry.",
    icon: Briefcase
  },
  { 
    title: "Quantum Computing Fund Analysis",
    description: "Review of performance metrics for quantum computing technology investments.",
    icon: FileText
  },
  { 
    title: "Mars Colony Funding Strategy",
    description: "Planning session for long-term investment in Martian colonization projects.",
    icon: Coffee
  }
];

interface AppointmentsListProps {
  activeFilter: string | null;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ activeFilter }) => {
  const { getUserAppointments, updateAppointmentStatus, deleteAppointment, loading, availableSlots } = useAppointments();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc">("date-asc");
  
  const allAppointments = getUserAppointments();
  
  // Add sample titles and descriptions to appointments that don't have them
  const enhancedAppointments = allAppointments.map(appointment => {
    if (appointment.title === `Appointment ${Number(appointment.id.split('-')[1]) + 1}`) {
      const sampleIndex = Number(appointment.id.split('-')[1]) % appointmentSamples.length;
      const sample = appointmentSamples[sampleIndex];
      return {
        ...appointment,
        title: sample.title,
        description: sample.description
      };
    }
    return appointment;
  });
  
  // Apply the active filter from the Stats component
  const filteredByStatsAppointments = useMemo(() => {
    if (!activeFilter) return enhancedAppointments;
    
    switch (activeFilter) {
      case "all":
        return enhancedAppointments;
      case "upcoming":
        return enhancedAppointments.filter((apt) => {
          const aptDate = new Date(apt.date);
          return (isFuture(aptDate) || isToday(aptDate)) && apt.status !== "cancelled";
        });
      case "completed":
        return enhancedAppointments.filter(apt => apt.status === "confirmed");
      case "available":
        // Show a message instead about available slots
        return [];
      default:
        return enhancedAppointments;
    }
  }, [enhancedAppointments, activeFilter]);
  
  // Then apply the user-selected filters
  const filteredAppointments = filteredByStatsAppointments
    .filter((appointment) => {
      // Filter by search query
      const matchesSearch =
        appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appointment.description &&
          appointment.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (sortBy === "date-asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
    
  const handleStatusUpdate = async (appointment: Appointment, status: "confirmed" | "pending" | "cancelled") => {
    try {
      await updateAppointmentStatus(appointment.id, status);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteAppointment(id);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const getAppointmentIcon = (title: string) => {
    const sample = appointmentSamples.find(s => s.title === title);
    const Icon = sample?.icon || Calendar;
    return <Icon className="h-4 w-4 mr-2 text-cosmic-purple" />;
  };

  // Special rendering for available slots
  if (activeFilter === "available") {
    const availableSlotsData = availableSlots.filter(
      slot => !slot.isBooked && (isToday(slot.date) || isFuture(slot.date))
    );
    
    return (
      <div className="purple-space-card p-6">
        <h2 className="text-2xl font-bold mb-6 text-white font-title">Available Time Slots</h2>
        
        {availableSlotsData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlotsData.map((slot) => (
              <div
                key={slot.id}
                className="border border-white/10 bg-card/30 backdrop-blur-md rounded-md p-4 transition-all hover:bg-card/40"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-calendar-available" />
                      Available Slot
                    </h3>
                    <div className="flex items-center text-sm text-white/80 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(slot.date), "MMMM d, yyyy")} at{" "}
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                  <Badge className="bg-calendar-available/20 text-calendar-available">
                    Available
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md bg-muted/10 border-white/10">
            <h3 className="font-medium text-lg text-white">No available slots found</h3>
            <p className="text-white/70">
              Check back later or create new available slots
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="purple-space-card p-6">
      <h2 className="text-2xl font-bold mb-6 text-white font-title">
        {activeFilter === "completed" ? "Completed Appointments" :
         activeFilter === "upcoming" ? "Upcoming Appointments" :
         "Your Cosmic Appointments"}
      </h2>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/40 text-white border-white/20"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[120px] bg-background/40 text-white border-white/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card text-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "date-asc" | "date-desc")}
          >
            <SelectTrigger className="w-[140px] bg-background/40 text-white border-white/20">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card text-white">
              <SelectItem value="date-asc">Date (Oldest)</SelectItem>
              <SelectItem value="date-desc">Date (Newest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Appointments list */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-white/10 bg-card/30 backdrop-blur-md rounded-md p-4 transition-all hover:bg-card/40"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white flex items-center">
                    {getAppointmentIcon(appointment.title)}
                    {appointment.title}
                  </h3>
                  <div className="flex items-center text-sm text-white/80 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(appointment.date), "MMMM d, yyyy")} at{" "}
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                  {appointment.description && (
                    <p className="text-sm mt-2 text-white/70">{appointment.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`status-${appointment.status} capitalize`}>
                    {appointment.status}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card text-white border-white/20">
                      {appointment.status !== "confirmed" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(appointment, "confirmed")}
                          className="text-green-400 hover:text-green-300 hover:bg-white/5"
                        >
                          Mark as Confirmed
                        </DropdownMenuItem>
                      )}
                      {appointment.status !== "cancelled" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(appointment, "cancelled")}
                          className="text-destructive hover:bg-white/5"
                        >
                          Cancel Appointment
                        </DropdownMenuItem>
                      )}
                      {(isAdmin || appointment.status === "cancelled") && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(appointment.id)}
                          className="text-destructive hover:bg-white/5"
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted/10 border-white/10">
          <h3 className="font-medium text-lg text-white">No appointments found</h3>
          <p className="text-white/70">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Book your first appointment to get started"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
