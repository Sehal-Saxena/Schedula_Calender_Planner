
import React, { useMemo } from "react";
import { useAppointments, Appointment } from "@/context/AppointmentContext";
import { format, isToday, isFuture, isPast, parseISO, isThisMonth } from "date-fns";
import { CalendarClock, CheckCheck, Clock, XCircle } from "lucide-react";
import StatsCard from "./StatsCard";

interface StatsProps {
  onFilterChange: (filter: string | null) => void;
  activeFilter: string | null;
}

const Stats: React.FC<StatsProps> = ({ onFilterChange, activeFilter }) => {
  const { getUserAppointments, availableSlots } = useAppointments();
  const appointments = getUserAppointments();
  
  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    
    const totalAppointments = appointments.length;
    const confirmedAppointments = appointments.filter(
      (apt) => apt.status === "confirmed"
    ).length;
    const pendingAppointments = appointments.filter(
      (apt) => apt.status === "pending"
    ).length;
    const cancelledAppointments = appointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;
    
    const upcomingAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        (isFuture(aptDate) || isToday(aptDate)) &&
        apt.status !== "cancelled"
      );
    }).length;
    
    const availableSlotsCount = availableSlots.filter(
      (slot) => !slot.isBooked && (isToday(slot.date) || isFuture(slot.date))
    ).length;
    
    return {
      total: totalAppointments,
      confirmed: confirmedAppointments,
      pending: pendingAppointments,
      cancelled: cancelledAppointments,
      upcoming: upcomingAppointments,
      availableSlots: availableSlotsCount,
    };
  }, [appointments, availableSlots]);

  const handleCardClick = (filterType: string | null) => {
    // If clicking on the already active filter, clear it
    if (activeFilter === filterType) {
      onFilterChange(null);
    } else {
      onFilterChange(filterType);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title="Total Appointments"
        value={stats.total}
        icon={<CalendarClock className="h-5 w-5 text-muted-foreground" />}
        onClick={() => handleCardClick("all")}
        className={activeFilter === "all" ? "ring-2 ring-primary" : ""}
      />
      <StatsCard
        title="Upcoming Appointments"
        value={stats.upcoming}
        icon={<Clock className="h-5 w-5 text-calendar-pending" />}
        onClick={() => handleCardClick("upcoming")}
        className={activeFilter === "upcoming" ? "ring-2 ring-primary" : ""}
      />
      <StatsCard
        title="Completed Appointments"
        value={stats.confirmed}
        icon={<CheckCheck className="h-5 w-5 text-calendar-success" />}
        onClick={() => handleCardClick("completed")}
        className={activeFilter === "completed" ? "ring-2 ring-primary" : ""}
      />
      <StatsCard
        title="Available Slots"
        value={stats.availableSlots}
        description="Open slots for booking"
        icon={<CalendarClock className="h-5 w-5 text-calendar-available" />}
        onClick={() => handleCardClick("available")}
        className={activeFilter === "available" ? "ring-2 ring-primary" : ""}
      />
    </div>
  );
};

export default Stats;
