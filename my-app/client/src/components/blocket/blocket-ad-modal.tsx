import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BLOCKET_VEHICLE_CATEGORIES } from "@shared/blocket-types";

const blocketAdSchema = z.object({
  sourceId: z.string().min(1, "Source ID is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  categoryId: z.number().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
});

type BlocketAdForm = z.infer<typeof blocketAdSchema>;

interface BlocketAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: any;
}

export function BlocketAdModal({ open, onOpenChange, vehicle }: BlocketAdModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BlocketAdForm>({
    resolver: zodResolver(blocketAdSchema),
    defaultValues: {
      sourceId: "",
      vehicleId: "",
      categoryId: BLOCKET_VEHICLE_CATEGORIES.CARS,
      title: "",
      body: "",
      price: "",
    },
  });

  // Update form when vehicle changes
  useState(() => {
    if (vehicle) {
      form.reset({
        sourceId: `vehicle-${vehicle.id}-${Date.now()}`,
        vehicleId: vehicle.id,
        categoryId: BLOCKET_VEHICLE_CATEGORIES.CARS,
        title: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`,
        body: `Beautiful ${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.color} color.

${vehicle.mileage ? `Mileage: ${vehicle.mileage} km` : ""}
VIN: ${vehicle.vin}

This vehicle is in excellent condition and ready for a new owner. Contact us for more information and to schedule a test drive!

Features:
- ${vehicle.color} color
- ${vehicle.year} model year
- Well maintained

Perfect for both city driving and longer trips. Don't miss this opportunity!`,
        price: vehicle.price || "",
      });
    }
  });

  const createBlocketAd = useMutation({
    mutationFn: (data: BlocketAdForm) => 
      apiRequest("POST", "/api/blocket-ads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocket-ads"] });
      toast({
        title: "Success",
        description: "Blocket ad created successfully!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create Blocket ad",
      });
    },
  });

  const onSubmit = (data: BlocketAdForm) => {
    createBlocketAd.mutate(data);
  };

  const categoryOptions = [
    { value: BLOCKET_VEHICLE_CATEGORIES.CARS, label: "Cars (Bilar)" },
    { value: BLOCKET_VEHICLE_CATEGORIES.TRANSPORT_VEHICLES, label: "Transport Vehicles (Transportbilar)" },
    { value: BLOCKET_VEHICLE_CATEGORIES.MOTORCYCLES, label: "Motorcycles (Motorcykel)" },
    { value: BLOCKET_VEHICLE_CATEGORIES.TRAILERS, label: "Trailers (Trailer)" },
    { value: BLOCKET_VEHICLE_CATEGORIES.CARAVANS, label: "Caravans (Husvagn)" },
    { value: BLOCKET_VEHICLE_CATEGORIES.MOTORHOMES, label: "Motorhomes (Husbil)" },
    { value: BLOCKET_VEHICLE_CATEGORIES.ATV, label: "ATV" },
    { value: BLOCKET_VEHICLE_CATEGORIES.TRUCKS, label: "Trucks (Lastbil)" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="blocket-ad-modal">
        <DialogHeader>
          <DialogTitle>Create Blocket Advertisement</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sourceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Unique identifier for this ad" 
                      {...field} 
                      data-testid="input-source-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blocket Category</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter ad title" 
                      {...field} 
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (SEK)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter price in SEK" 
                      {...field} 
                      data-testid="input-price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed description of the vehicle" 
                      className="min-h-[200px]"
                      {...field} 
                      data-testid="input-body"
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
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createBlocketAd.isPending}
                data-testid="button-create-ad"
              >
                {createBlocketAd.isPending ? "Creating..." : "Create Ad"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}