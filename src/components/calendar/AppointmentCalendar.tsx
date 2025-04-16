import React, { useState, useEffect } from "react";
import { format, startOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Star, Rocket, FileText, Calendar, CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppointments, Appointment } from "@/context/AppointmentContext";
import { useAuth } from "@/context/AuthContext";
import AppointmentModal from "./AppointmentModal";
import CreateSlotModal from "./CreateSlotModal";
import AddAppointmentModal from "./AddAppointmentModal";
import EditAppointmentModal from "./EditAppointmentModal";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ViewMode = "month" | "week" | "day";

interface AppointmentCalendarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

// Sample appointment titles for better displayed data
const sampleTitles = [
  "Interstellar Investment Review",
  "Lunar Property Acquisition",
  "Space Tourism Portfolio Planning",
  "Quantum Computing Fund Analysis",
  "Mars Colony Funding Strategy"
];

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { appointments, availableSlots, getAvailableSlotsForDate, loading, createAvailableSlot, deleteAppointment } = useAppointments();
  const { isAdmin } = useAuth();
  
  // Enhance appointments with better titles
  const enhancedAppointments = appointments.map(appointment => {
    if (appointment.title.startsWith('Appointment ')) {
      const index = parseInt(appointment.id.split('-')[1]) % sampleTitles.length;
      return { ...appointment, title: sampleTitles[index] };
    }
    return appointment;
  });
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    if (viewMode !== "day") {
      setViewMode("day");
    }
  };
  
  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="calendar-day-header text-center font-medium" key={i}>
          {format(addDays(startDate, i), 'EEEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const rows = [];
    
    let days = [];
    let day = startDate;
    
    for (let i = 0; i < 42; i++) {
      const formattedDate = format(day, "d");
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      const currentDay = day;
      
      const dayAppointments = enhancedAppointments.filter(
        (appointment) => isSameDay(new Date(appointment.date), currentDay)
      );
      
      const daySlots = availableSlots.filter(
        (slot) => isSameDay(new Date(slot.date), currentDay)
      );
      
      const availableCount = daySlots.filter(slot => !slot.isBooked).length;
      const appointmentCount = dayAppointments.length;
      
      days.push(
        <div
          key={`cell-${i}`}
          className={`calendar-day ${
            !isCurrentMonth ? "opacity-30 text-gray-500" : ""
          } ${isToday ? "ring-2 ring-primary" : ""} border-white/10 bg-card/20`}
          onClick={() => onDateClick(currentDay)}
        >
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isToday ? "font-bold text-white" : "text-white"}`}>
              {formattedDate}
            </span>
            {isCurrentMonth && (
              <div className="flex gap-1">
                {appointmentCount > 0 && (
                  <Badge variant="secondary" className="text-xs rounded-full w-5 h-5 p-0 flex items-center justify-center text-white">
                    {appointmentCount}
                  </Badge>
                )}
                {availableCount > 0 && (
                  <Badge variant="outline" className="text-xs rounded-full w-5 h-5 p-0 flex items-center justify-center bg-calendar-available/20 text-calendar-available border-calendar-available/30">
                    {availableCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="calendar-day-content">
            {isCurrentMonth &&
              dayAppointments.slice(0, 2).map((appointment) => (
                <div
                  key={appointment.id}
                  className={`calendar-event status-${appointment.status}`}
                >
                  {appointment.title.substring(0, 12)}...
                </div>
              ))}
            
            {isCurrentMonth && dayAppointments.length > 2 && (
              <div className="text-xs text-white/70">
                +{dayAppointments.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
      
      if ((i + 1) % 7 === 0) {
        rows.push(
          <div key={`row-${i}`} className="grid grid-cols-7 gap-2">
            {days}
          </div>
        );
        days = [];
      }
      
      day = addDays(day, 1);
    }
    
    return <div className="space-y-2">{rows}</div>;
  };
  
  const renderDayView = () => {
    if (!selectedDate) return null;
    
    const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy");
    const dayAppointments = enhancedAppointments.filter(
      (appointment) => isSameDay(new Date(appointment.date), selectedDate)
    );
    
    const daySlots = getAvailableSlotsForDate(selectedDate);
    
    const handleCreateDefaultSlots = async () => {
      if (!isAdmin) return;
      
      const defaultSlots = [
        { startTime: "09:00", endTime: "10:00" },
        { startTime: "11:00", endTime: "12:00" },
        { startTime: "14:00", endTime: "15:00" },
        { startTime: "16:00", endTime: "17:00" }
      ];
      
      for (const slot of defaultSlots) {
        await createAvailableSlot({
          date: selectedDate,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{formattedDate}</h2>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setIsAddAppointmentModalOpen(true)}
            className="flex items-center gap-1"
          >
            <CalendarPlus className="h-4 w-4 mr-1" />
            Create Appointment
          </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Available Time Slots</h3>
              {isAdmin && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1 text-white hover:bg-accent/50 border-white/20"
                  onClick={() => setIsSlotModalOpen(true)}
                >
                  <Plus className="h-4 w-4" /> Add Slot
                </Button>
              )}
            </div>
            
            {daySlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-md text-white ${
                      slot.isBooked
                        ? "slot-booked bg-white/10"
                        : "slot-available cursor-pointer hover:bg-calendar-available/30 bg-card/40 border border-white/10"
                    }`}
                    onClick={() => {
                      if (!slot.isBooked) {
                        setSelectedDate(slot.date);
                        setIsCreateModalOpen(true);
                      }
                    }}
                  >
                    <div className="font-medium">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="text-sm">
                      {slot.isBooked ? "Booked" : "Available"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/70 text-center py-6 bg-card/20 rounded-md border border-white/10">
                <div className="mb-4">No available slots for this date.</div>
                {isAdmin && (
                  <div className="mt-2 space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-white hover:bg-accent/50 border-white/20"
                      onClick={() => setIsSlotModalOpen(true)}
                    >
                      Add Custom Time Slot
                    </Button>
                    <div>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="mt-2"
                        onClick={handleCreateDefaultSlots}
                      >
                        Create Default Time Slots
                      </Button>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <Button
                    onClick={() => setIsAddAppointmentModalOpen(true)}
                    className="bg-cosmic-purple hover:bg-cosmic-purple/80"
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Create appointment anyway
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">Appointments</h3>
            {dayAppointments.length > 0 ? (
              <div className="space-y-2">
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-md border border-white/10 bg-card/40 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white flex items-center">
                          {appointment.title.includes("Interstellar") ? (
                            <Star className="h-4 w-4 mr-2 text-cosmic-purple" />
                          ) : appointment.title.includes("Lunar") ? (
                            <Rocket className="h-4 w-4 mr-2 text-cosmic-purple" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2 text-cosmic-purple" />
                          )}
                          {appointment.title}
                        </div>
                        <div className="text-sm text-white/80">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                        {appointment.description && (
                          <p className="text-sm mt-1 text-white/70">{appointment.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={`status-${appointment.status}`}>
                          {appointment.status}
                        </Badge>
                        
                        <div className="flex space-x-1 mt-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-white hover:bg-white/10"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:bg-white/10"
                            onClick={() => handleDeleteAppointment(appointment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/70 text-center py-6 bg-card/20 rounded-md border border-white/10">
                No appointments for this date
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderCalendar = () => {
    switch (viewMode) {
      case "day":
        return renderDayView();
      case "month":
      default:
        return (
          <>
            {renderDays()}
            {renderCells()}
          </>
        );
    }
  };
  
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (selectedAppointment) {
      try {
        await deleteAppointment(selectedAppointment.id);
        toast.success('Appointment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete appointment');
        console.error(error);
      }
      setIsDeleteDialogOpen(false);
      setSelectedAppointment(null);
    }
  };
  
  return (
    <div className="purple-space-card p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-white">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="text-white hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setViewMode("month");
              setSelectedDate(null);
            }}
            className={viewMode !== "month" ? "border-white/20 text-white" : ""}
          >
            Month
          </Button>
          <Button
            variant={viewMode === "day" && selectedDate ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (selectedDate) {
                setViewMode("day");
              } else {
                setSelectedDate(new Date());
                setViewMode("day");
              }
            }}
            className={!(viewMode === "day" && selectedDate) ? "border-white/20 text-white" : ""}
          >
            Day
          </Button>
        </div>
      </div>
      
      <div className="mt-4">{renderCalendar()}</div>
      
      {isCreateModalOpen && selectedDate && (
        <AppointmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          selectedDate={selectedDate}
          availableSlots={getAvailableSlotsForDate(selectedDate).filter(slot => !slot.isBooked)}
        />
      )}
      
      {isSlotModalOpen && selectedDate && (
        <CreateSlotModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          selectedDate={selectedDate}
        />
      )}

      {isAddAppointmentModalOpen && selectedDate && (
        <AddAppointmentModal
          isOpen={isAddAppointmentModalOpen}
          onClose={() => setIsAddAppointmentModalOpen(false)}
          selectedDate={selectedDate}
        />
      )}

      {isEditModalOpen && selectedAppointment && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-white border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white bg-transparent border-white/20 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAppointment}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppointmentCalendar;
