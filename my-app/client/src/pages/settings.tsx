import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Globe,
  Key,
  Mail,
  Smartphone,
  Save
} from "lucide-react";

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    leadAlerts: true,
    appointmentReminders: true,
    marketingEmails: false
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto bg-secondary/30 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="billing">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <Globe className="w-4 h-4 mr-2" />
                Integrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="john@automax.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dealership">Dealership</Label>
                      <Input id="dealership" defaultValue="AutoMax Dealership" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue="Sales Manager" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" defaultValue="America/New_York" />
                    </div>
                  </div>
                  <Button className="mt-4">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="email-notif">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch 
                        id="email-notif"
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="sms-notif">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Get text messages for urgent updates</p>
                        </div>
                      </div>
                      <Switch 
                        id="sms-notif"
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="push-notif">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Browser push notifications</p>
                        </div>
                      </div>
                      <Switch 
                        id="push-notif"
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-medium">Notification Types</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="lead-alerts">New Lead Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified when new leads come in</p>
                      </div>
                      <Switch 
                        id="lead-alerts"
                        checked={notifications.leadAlerts}
                        onCheckedChange={(checked) => setNotifications({...notifications, leadAlerts: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="appointment-rem">Appointment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Reminders for upcoming appointments</p>
                      </div>
                      <Switch 
                        id="appointment-rem"
                        checked={notifications.appointmentReminders}
                        onCheckedChange={(checked) => setNotifications({...notifications, appointmentReminders: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Product updates and newsletters</p>
                      </div>
                      <Switch 
                        id="marketing-emails"
                        checked={notifications.marketingEmails}
                        onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Current Plan</h3>
                        <span className="text-sm font-medium text-primary">Pro Plan</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">$99/month • Billed monthly</p>
                      <Button variant="outline" size="sm">Change Plan</Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">•••• •••• •••• 4242</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3">Update Payment Method</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect with third-party services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Google Calendar</h3>
                          <p className="text-sm text-muted-foreground">Sync your appointments</p>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Slack</h3>
                          <p className="text-sm text-muted-foreground">Get notifications in Slack</p>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">CRM System</h3>
                          <p className="text-sm text-muted-foreground">Sync with your CRM</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}