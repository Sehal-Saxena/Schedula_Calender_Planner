
import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { useAppointments } from "@/context/AppointmentContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, MoreHorizontal, Plus, Search } from "lucide-react";

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { appointments, availableSlots, updateAppointmentStatus, deleteAppointment } = useAppointments();
  
  // Redirect to login if not authenticated or not admin
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  const futureSlots = availableSlots.filter(
    (slot) => new Date(slot.date) >= new Date()
  );
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Appointments</span>
              <Link to="/calendar">
                <Button size="sm">View Calendar</Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Showing all recent appointment bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.slice(0, 5).map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.title}</TableCell>
                      <TableCell>
                        {format(new Date(appointment.date), "MMM d")} at{" "}
                        {appointment.startTime}
                      </TableCell>
                      <TableCell>
                        <Badge className={`status-${appointment.status} capitalize`}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {appointment.status !== "confirmed" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "confirmed"
                                  )
                                }
                              >
                                Mark as Confirmed
                              </DropdownMenuItem>
                            )}
                            {appointment.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "cancelled"
                                  )
                                }
                                className="text-destructive"
                              >
                                Cancel
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteAppointment(appointment.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Time Slots</span>
              <Link to="/calendar">
                <Button size="sm">Add Slots</Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Upcoming time slots available for booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {futureSlots.slice(0, 5).map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>
                        {format(new Date(slot.date), "MMMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {slot.startTime} - {slot.endTime}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            slot.isBooked
                              ? "bg-calendar-booked/20 text-calendar-booked border-calendar-booked/30"
                              : "bg-calendar-available/20 text-calendar-available border-calendar-available/30"
                          }
                        >
                          {slot.isBooked ? "Booked" : "Available"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>
            Manage and monitor all appointments in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                className="pl-9"
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {appointment.title}
                  </TableCell>
                  <TableCell>{appointment.userId}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.date), "MMM d, yyyy")} at{" "}
                    {appointment.startTime} - {appointment.endTime}
                  </TableCell>
                  <TableCell>
                    <Badge className={`status-${appointment.status} capitalize`}>
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {appointment.status !== "confirmed" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateAppointmentStatus(appointment.id, "confirmed")
                            }
                          >
                            Mark as Confirmed
                          </DropdownMenuItem>
                        )}
                        {appointment.status !== "cancelled" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateAppointmentStatus(appointment.id, "cancelled")
                            }
                            className="text-destructive"
                          >
                            Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default AdminPage;
