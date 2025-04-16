
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { addDays, format, parse, startOfMonth, endOfMonth, addMonths, isSameDay } from "date-fns";

// Types
export type AppointmentStatus = "confirmed" | "pending" | "cancelled";
export type AppointmentCategory = "investment" | "financial" | "consultation" | "property" | "portfolio";

export type Appointment = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  category?: AppointmentCategory;
  priority?: "high" | "medium" | "low";
};

export type TimeSlot = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

type AppointmentContextType = {
  appointments: Appointment[];
  availableSlots: TimeSlot[];
  createAppointment: (appointment: Omit<Appointment, "id" | "userId" | "status">) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  createAvailableSlot: (slot: Omit<TimeSlot, "id" | "isBooked">) => Promise<void>;
  deleteAvailableSlot: (id: string) => Promise<void>;
  getAvailableSlotsForDate: (date: Date) => TimeSlot[];
  getUserAppointments: () => Appointment[];
  searchAppointments: (query: string, filters?: {
    category?: AppointmentCategory;
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
  }) => Appointment[];
  refreshData: () => void;
  loading: boolean;
};

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Mock data generator for demo purposes
const generateMockData = (userId: string) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const nextMonthEnd = endOfMonth(addMonths(today, 1));
  
  // Generate appointments
  const mockAppointments: Appointment[] = [];
  const statuses: AppointmentStatus[] = ["confirmed", "pending", "cancelled"];
  const categories: AppointmentCategory[] = ["investment", "financial", "consultation", "property", "portfolio"];
  const priorities = ["high", "medium", "low"];
  
  // Add some past appointments
  for (let i = 0; i < 5; i++) {
    const randDays = Math.floor(Math.random() * 20) + 1;
    const date = addDays(monthStart, randDays);
    
    mockAppointments.push({
      id: `apt-${i}`,
      userId,
      title: `Appointment ${i + 1}`,
      description: `Description for appointment ${i + 1}`,
      date,
      startTime: `${10 + Math.floor(Math.random() * 8)}:00`,
      endTime: `${10 + Math.floor(Math.random() * 8) + 1}:00`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)] as "high" | "medium" | "low",
    });
  }
  
  // Generate available slots
  const mockSlots: TimeSlot[] = [];
  
  // Add slots for this month and next month
  for (let day = 1; day <= 60; day++) {
    // Only add slots for about 70% of days (randomly)
    if (Math.random() > 0.3) {
      const date = addDays(today, day);
      if (date <= nextMonthEnd) {
        // Morning slot
        mockSlots.push({
          id: `slot-${day}-1`,
          date,
          startTime: "09:00",
          endTime: "10:00",
          isBooked: Math.random() > 0.7,
        });
        
        // Afternoon slots
        mockSlots.push({
          id: `slot-${day}-2`,
          date,
          startTime: "14:00",
          endTime: "15:00",
          isBooked: Math.random() > 0.7,
        });
        
        mockSlots.push({
          id: `slot-${day}-3`,
          date,
          startTime: "16:00",
          endTime: "17:00",
          isBooked: Math.random() > 0.7,
        });
      }
    }
  }
  
  return { mockAppointments, mockSlots };
};

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Load mock data
      refreshData();
    } else {
      setAppointments([]);
      setAvailableSlots([]);
      setLoading(false);
    }
  }, [user]);

  const refreshData = () => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (user) {
        const { mockAppointments, mockSlots } = generateMockData(user.id);
        setAppointments(mockAppointments);
        setAvailableSlots(mockSlots);
      }
      setLoading(false);
    }, 1000);
  };

  const createAppointment = async (appointmentData: Omit<Appointment, "id" | "userId" | "status">) => {
    if (!user) throw new Error("User must be authenticated");
    
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAppointment: Appointment = {
        ...appointmentData,
        id: `apt-${Math.random().toString(36).substring(2, 9)}`,
        userId: user.id,
        status: "pending",
      };
      
      setAppointments(prev => [...prev, newAppointment]);
      
      // Mark slot as booked
      setAvailableSlots(prev => 
        prev.map(slot => {
          if (
            isSameDay(slot.date, appointmentData.date) &&
            slot.startTime === appointmentData.startTime &&
            slot.endTime === appointmentData.endTime
          ) {
            return { ...slot, isBooked: true };
          }
          return slot;
        })
      );
      
      toast.success("Appointment booked successfully!");
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAppointments(prev =>
        prev.map(apt => (apt.id === updatedAppointment.id ? updatedAppointment : apt))
      );
      
      toast.success("Appointment updated successfully!");
    } catch (error) {
      toast.error("Failed to update appointment. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? { ...apt, status } : apt))
      );
      
      // If cancelled, free up the slot
      if (status === "cancelled") {
        const appointment = appointments.find(apt => apt.id === id);
        if (appointment) {
          setAvailableSlots(prev =>
            prev.map(slot => {
              if (
                isSameDay(slot.date, appointment.date) &&
                slot.startTime === appointment.startTime &&
                slot.endTime === appointment.endTime
              ) {
                return { ...slot, isBooked: false };
              }
              return slot;
            })
          );
        }
      }
      
      toast.success(`Appointment ${status} successfully!`);
    } catch (error) {
      toast.error("Failed to update appointment. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const appointment = appointments.find(apt => apt.id === id);
      
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      
      // Free up the slot
      if (appointment) {
        setAvailableSlots(prev =>
          prev.map(slot => {
            if (
              isSameDay(slot.date, appointment.date) &&
              slot.startTime === appointment.startTime &&
              slot.endTime === appointment.endTime
            ) {
              return { ...slot, isBooked: false };
            }
            return slot;
          })
        );
      }
      
      toast.success("Appointment deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete appointment. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAvailableSlot = async (slotData: Omit<TimeSlot, "id" | "isBooked">) => {
    if (!user?.role || user.role !== "admin") throw new Error("Only admins can create slots");
    
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newSlot: TimeSlot = {
        ...slotData,
        id: `slot-${Math.random().toString(36).substring(2, 9)}`,
        isBooked: false,
      };
      
      setAvailableSlots(prev => [...prev, newSlot]);
      toast.success("Time slot created successfully!");
    } catch (error) {
      toast.error("Failed to create time slot. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAvailableSlot = async (id: string) => {
    if (!user?.role || user.role !== "admin") throw new Error("Only admins can delete slots");
    
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAvailableSlots(prev => prev.filter(slot => slot.id !== id));
      toast.success("Time slot deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete time slot. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlotsForDate = (date: Date) => {
    return availableSlots.filter(slot => isSameDay(slot.date, date));
  };

  const getUserAppointments = () => {
    if (!user) return [];
    if (user.role === "admin") return appointments;
    return appointments.filter(apt => apt.userId === user.id);
  };

  // New search function with filtering capabilities
  const searchAppointments = (query: string, filters?: {
    category?: AppointmentCategory;
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
  }) => {
    let filtered = getUserAppointments();
    
    // Apply text search
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.title.toLowerCase().includes(lowercaseQuery) || 
        (apt.description && apt.description.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Apply filters if provided
    if (filters) {
      if (filters.category) {
        filtered = filtered.filter(apt => apt.category === filters.category);
      }
      
      if (filters.status) {
        filtered = filtered.filter(apt => apt.status === filters.status);
      }
      
      if (filters.startDate) {
        filtered = filtered.filter(apt => new Date(apt.date) >= filters.startDate);
      }
      
      if (filters.endDate) {
        filtered = filtered.filter(apt => new Date(apt.date) <= filters.endDate);
      }
    }
    
    return filtered;
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        availableSlots,
        createAppointment,
        updateAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        createAvailableSlot,
        deleteAvailableSlot,
        getAvailableSlotsForDate,
        getUserAppointments,
        searchAppointments,
        refreshData,
        loading,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentProvider");
  }
  return context;
};
