
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppointments, Appointment } from "@/context/AppointmentContext";
import { CalendarIcon, Clock, FileText, Tag } from "lucide-react";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

type AppointmentCategory = "investment" | "financial" | "consultation" | "property" | "portfolio";

const categoryOptions = [
  { value: "investment", label: "Investment Review", color: "bg-blue-500" },
  { value: "financial", label: "Financial Planning", color: "bg-green-500" },
  { value: "consultation", label: "Consultation", color: "bg-purple-500" },
  { value: "property", label: "Property Acquisition", color: "bg-orange-500" },
  { value: "portfolio", label: "Portfolio Planning", color: "bg-pink-500" }
];

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  const { updateAppointment } = useAppointments();
  const [title, setTitle] = useState(appointment.title);
  const [description, setDescription] = useState(appointment.description || "");
  const [startTime, setStartTime] = useState(appointment.startTime);
  const [endTime, setEndTime] = useState(appointment.endTime);
  const [category, setCategory] = useState<AppointmentCategory>(
    (appointment.category || "consultation") as AppointmentCategory
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateAppointment({
        ...appointment,
        title,
        description,
        startTime,
        endTime,
        category
      });
      toast.success("Appointment updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error("Failed to update appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value as AppointmentCategory);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Appointment</DialogTitle>
          <DialogDescription className="text-white/70">
            Update the details of your appointment on {format(new Date(appointment.date), "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-white">
                Title
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Appointment title"
                  className="pl-10 bg-card/50 border-white/20 text-white"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-white">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-white/60 z-10" />
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="pl-10 bg-card/50 border-white/20 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/20">
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
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-white">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Appointment details"
                className="min-h-[100px] bg-card/50 border-white/20 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm font-medium text-white">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10 bg-card/50 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm font-medium text-white">
                  End Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10 bg-card/50 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white border-white/20 bg-transparent hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cosmic-purple hover:bg-cosmic-purple/80 text-white"
            >
              {isSubmitting ? "Updating..." : "Update Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentModal;
