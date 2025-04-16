import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useAppointments, AppointmentCategory, AppointmentStatus } from "@/context/AppointmentContext";
import Layout from "@/components/layout/Layout";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays, Clock, User, FileText, Star, Rocket, Briefcase,
  Search, Filter, ChevronLeft, ChevronRight, Calendar, Tag
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

const appointmentExamples = [
  {
    title: "Interstellar Investment Review",
    description: "Annual portfolio assessment and future growth strategy planning for galactic markets.",
    time: "09:00 - 10:30",
    client: "John Anderson",
    type: "Financial Planning",
    icon: <Star className="h-5 w-5 text-cosmic-purple" />
  },
  {
    title: "Lunar Property Acquisition",
    description: "Discussion about investment opportunities in lunar real estate and development projects.",
    time: "11:00 - 12:00",
    client: "Maria Rodriguez",
    type: "Investment Consultation",
    icon: <Rocket className="h-5 w-5 text-cosmic-purple" />
  },
  {
    title: "Space Tourism Portfolio Planning", 
    description: "Evaluating investment opportunities in the emerging space tourism industry.",
    time: "14:00 - 15:30",
    client: "Robert Johnson",
    type: "Financial Planning",
    icon: <Briefcase className="h-5 w-5 text-cosmic-purple" />
  },
  {
    title: "Quantum Computing Fund Analysis",
    description: "Review of performance metrics for quantum computing technology investments.",
    time: "16:00 - 17:00",
    client: "Sarah Chen",
    type: "Investment Review",
    icon: <FileText className="h-5 w-5 text-cosmic-purple" />
  }
];

const categoryOptions = [
  { value: "investment", label: "Investment Review", color: "bg-blue-500" },
  { value: "financial", label: "Financial Planning", color: "bg-green-500" },
  { value: "consultation", label: "Consultation", color: "bg-purple-500" },
  { value: "property", label: "Property Acquisition", color: "bg-orange-500" },
  { value: "portfolio", label: "Portfolio Planning", color: "bg-pink-500" }
];

const statusOptions = [
  { value: "confirmed", label: "Confirmed", color: "bg-green-500" },
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" }
];

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { searchAppointments } = useAppointments();
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "day" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AppointmentCategory | "">("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const navigateToday = () => {
    setSelectedDate(new Date());
    if (calendarViewMode !== "day") {
      setCalendarViewMode("day");
    }
  };
  
  const navigatePreviousWeek = () => {
    if (selectedDate) {
      setSelectedDate(subDays(selectedDate, 7));
    } else {
      setSelectedDate(subDays(new Date(), 7));
    }
  };
  
  const navigateNextWeek = () => {
    if (selectedDate) {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(new Date(), 7));
    }
  };
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  const handleCalendarTitleClick = () => {
    setCalendarViewMode("month");
    setSelectedDate(null);
  };

  const handleSearch = () => {
    const results = searchAppointments(searchQuery, {
      category: categoryFilter as AppointmentCategory || undefined,
      status: statusFilter as AppointmentStatus || undefined,
      startDate: dateRange.from,
      endDate: dateRange.to
    });
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setStatusFilter("");
    setDateRange({ from: undefined, to: undefined });
    setShowSearchResults(false);
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 
          className="text-3xl font-bold text-white mb-2 font-title flex items-center cursor-pointer" 
          onClick={handleCalendarTitleClick}
        >
          <span className="mr-2">Cosmic Calendar</span>
          <CalendarDays className="h-6 w-6 text-cosmic-purple animate-float" />
        </h1>
        <p className="text-white/80">
          Schedule your appointments with our interstellar financial advisors
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToday}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={navigatePreviousWeek}
              className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={navigateNextWeek}
              className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
            <Input
              placeholder="Search appointments"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 border-white/20 bg-card/30 text-white w-full"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-card/95 backdrop-blur-lg border-white/10">
              <div className="space-y-4">
                <h3 className="font-medium text-white">Filter Appointments</h3>
                
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Category</label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value as AppointmentCategory | "")}
                  >
                    <SelectTrigger className="w-full border-white/20 bg-card/50 text-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/20">
                      <SelectItem value="" className="text-white">All Categories</SelectItem>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${option.color}`}></span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Status</label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "")}
                  >
                    <SelectTrigger className="w-full border-white/20 bg-card/50 text-white">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/20">
                      <SelectItem value="" className="text-white">All Statuses</SelectItem>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${option.color}`}></span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Date Range</label>
                  <div className="calendar-popover">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={1}
                      className="border-white/20"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Clear
                  </Button>
                  <Button onClick={handleSearch}>Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant={showSearchResults ? "default" : "outline"} 
            onClick={handleSearch}
            className={!showSearchResults ? "border-white/20 text-white hover:bg-white/10" : ""}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {showSearchResults ? (
            <Card className="purple-space-card border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-white">
                    Search Results ({searchResults.length})
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearSearch}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Back to Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    No appointments found matching your search criteria
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((appointment) => {
                      const category = categoryOptions.find(c => c.value === appointment.category);
                      
                      return (
                        <div 
                          key={appointment.id} 
                          className="p-4 border border-white/10 rounded-lg bg-card/30 hover:bg-card/40 transition-all"
                          onClick={() => {
                            setSelectedDate(new Date(appointment.date));
                            setCalendarViewMode("day");
                            setShowSearchResults(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-white">{appointment.title}</h3>
                              <div className="flex items-center mt-1 text-white/70 text-sm">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(new Date(appointment.date), "MMMM d, yyyy")}
                                <Clock className="h-3 w-3 ml-3 mr-1" />
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                              {appointment.description && (
                                <p className="text-sm text-white/60 mt-2">{appointment.description}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <div className={`px-2 py-1 text-xs rounded-full ${
                                appointment.status === "confirmed" ? "bg-green-500/20 text-green-300" :
                                appointment.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                                "bg-red-500/20 text-red-300"
                              }`}>
                                {appointment.status}
                              </div>
                              
                              {category && (
                                <div className="flex items-center text-xs text-white/60">
                                  <Tag className="h-3 w-3 mr-1" />
                                  <span className={`w-2 h-2 rounded-full mr-1 ${category.color}`}></span>
                                  {category.label}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <AppointmentCalendar 
              viewMode={calendarViewMode}
              setViewMode={setCalendarViewMode}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}
        </div>
        
        <div className="space-y-6">
          <Card className="purple-space-card border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-cosmic-purple" />
                Featured Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentExamples.map((appointment, index) => (
                  <div key={index} className="border border-white/10 bg-card/20 backdrop-blur-sm rounded-lg p-4 hover:bg-card/30 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{appointment.icon}</div>
                      <div>
                        <h3 className="font-semibold text-white">{appointment.title}</h3>
                        <p className="text-sm text-white/70 mt-1">{appointment.description}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-white/60">
                          <Clock className="h-3 w-3" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                          <User className="h-3 w-3" />
                          <span>{appointment.client}</span>
                        </div>
                        <div className="mt-3">
                          <span className="inline-block bg-cosmic-purple/20 text-cosmic-purple text-xs px-2 py-1 rounded-full border border-cosmic-purple/30">
                            {appointment.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;
