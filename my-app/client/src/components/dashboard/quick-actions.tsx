import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, UserPlus, QrCode } from "lucide-react";
import { useLocation } from "wouter";
import { QuickBookingModal } from "@/components/forms/quick-booking-modal";
import { useState } from "react";

export function QuickActions() {
  const [, setLocation] = useLocation();
  const [showQuickBooking, setShowQuickBooking] = useState(false);

  return (
    <>
      <Card data-testid="quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              onClick={() => setShowQuickBooking(true)}
              className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-schedule-test-drive"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Test Drive
            </Button>
            
            <Button 
              onClick={() => setLocation("/leads")}
              variant="outline" 
              className="w-full justify-center"
              data-testid="button-add-lead"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-center"
              data-testid="button-generate-qr"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <QuickBookingModal 
        open={showQuickBooking} 
        onOpenChange={setShowQuickBooking} 
      />
    </>
  );
}
