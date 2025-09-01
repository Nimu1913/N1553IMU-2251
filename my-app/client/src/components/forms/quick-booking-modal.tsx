import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const quickBookingSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Phone number is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  appointmentType: z.enum(["test_drive", "sales_meeting", "trade_in", "service"]),
  vehicleVIN: z.string().optional(),
  vehicleInfo: z.string().optional(),
  scheduledDate: z.string().min(1, "Date and time is required"),
  notes: z.string().optional(),
  leadSource: z.string().default("walk_in"),
});

type QuickBookingForm = z.infer<typeof quickBookingSchema>;

interface QuickBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickBookingModal({ open, onOpenChange }: QuickBookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuickBookingForm>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      appointmentType: "test_drive",
      vehicleVIN: "",
      vehicleInfo: "",
      scheduledDate: "",
      notes: "",
      leadSource: "walk_in",
    },
  });

  const createAppointment = useMutation({
    mutationFn: (data: QuickBookingForm) => 
      apiRequest("POST", "/api/appointments", {
        ...data,
        scheduledDate: new Date(data.scheduledDate).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to schedule appointment",
      });
    },
  });

  const onSubmit = (data: QuickBookingForm) => {
    createAppointment.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="quick-booking-modal">
        <DialogHeader>
          <DialogTitle>Quick Booking</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter customer name" 
                      {...field} 
                      data-testid="input-customer-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="(555) 123-4567" 
                      {...field} 
                      data-testid="input-customer-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="customer@email.com" 
                      {...field} 
                      data-testid="input-customer-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-appointment-type">
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="test_drive">Test Drive</SelectItem>
                      <SelectItem value="sales_meeting">Sales Meeting</SelectItem>
                      <SelectItem value="trade_in">Trade-in Evaluation</SelectItem>
                      <SelectItem value="service">Service Appointment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Information</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 2024 Honda Accord" 
                      {...field} 
                      data-testid="input-vehicle-info"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleVIN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle VIN (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter VIN number" 
                      {...field} 
                      data-testid="input-vehicle-vin"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      data-testid="input-scheduled-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-booking"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createAppointment.isPending}
                data-testid="button-submit-booking"
              >
                {createAppointment.isPending ? "Booking..." : "Book Now"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
