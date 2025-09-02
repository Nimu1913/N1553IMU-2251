import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Mail, 
  Send, 
  Users, 
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

export default function Communications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");

  const conversations = [
    {
      id: "1",
      customerName: "Anna Andersson",
      lastMessage: "Jag är intresserad av BMW 320i. Kan vi boka en provkörning?",
      timestamp: "2 min ago",
      unread: 2,
      status: "active",
      avatar: "AA",
      vehicleInterest: "BMW 320i 2023",
      leadSource: "Blocket"
    },
    {
      id: "2", 
      customerName: "Erik Johansson",
      lastMessage: "Tack för informationen om finansiering!",
      timestamp: "15 min ago",
      unread: 0,
      status: "responded",
      avatar: "EJ",
      vehicleInterest: "Audi A4 2024",
      leadSource: "Website"
    },
    {
      id: "3",
      customerName: "Maria Karlsson", 
      lastMessage: "Är bilen fortfarande tillgänglig?",
      timestamp: "1h ago",
      unread: 1,
      status: "pending",
      avatar: "MK",
      vehicleInterest: "Volvo XC90 2023",
      leadSource: "Referral"
    }
  ];

  const messages = [
    {
      id: "1",
      senderId: "customer",
      senderName: "Anna Andersson",
      content: "Hej! Jag såg er annons för BMW 320i på Blocket. Kan ni berätta mer om bilens historia?",
      timestamp: "10:30 AM",
      type: "text"
    },
    {
      id: "2", 
      senderId: "agent",
      senderName: "You",
      content: "Hej Anna! Tack för ditt intresse. BMW:n är från 2023 med endast en ägare. Den har full servicehistorik och är i utmärkt skick. Skulle du vara intresserad av en provkörning?",
      timestamp: "10:32 AM", 
      type: "text"
    },
    {
      id: "3",
      senderId: "customer",
      senderName: "Anna Andersson",
      content: "Det låter perfekt! Jag är intresserad av BMW 320i. Kan vi boka en provkörning?",
      timestamp: "10:35 AM",
      type: "text"
    }
  ];

  const templates = [
    {
      id: "1",
      name: "Welcome Message",
      subject: "Tack för ditt intresse!",
      content: "Hej {customerName}! Tack för ditt intresse för vår {vehicleModel}. Vi återkommer inom kort med mer information."
    },
    {
      id: "2",
      name: "Test Drive Booking",
      subject: "Provkörning - {vehicleModel}",
      content: "Hej {customerName}! Vi har bokat en provkörning för {vehicleModel} den {date} kl {time}. Vi ses på {dealershipAddress}."
    },
    {
      id: "3",
      name: "Follow-up",
      subject: "Har du några frågor?",
      content: "Hej {customerName}! Jag ville höra om du har några frågor efter din provkörning av {vehicleModel}?"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "responded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "responded":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto bg-secondary/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Communications Center</h1>
              <p className="text-muted-foreground">Manage all customer communications from one place</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" data-testid="button-schedule-call">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
              <Button data-testid="button-new-message">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          <Tabs defaultValue="messages" className="space-y-6">
            <TabsList>
              <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
              <TabsTrigger value="campaigns" data-testid="tab-sms-campaigns">SMS Campaigns</TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-comm-analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Conversation List */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Conversations</CardTitle>
                      <Button variant="ghost" size="sm" data-testid="button-filter-conversations">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input 
                        placeholder="Search conversations..." 
                        className="pl-9"
                        data-testid="input-search-conversations"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`p-4 cursor-pointer border-b hover:bg-accent ${
                            selectedConversation === conversation.id ? 'bg-accent' : ''
                          }`}
                          data-testid={`conversation-${conversation.id}`}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src="" />
                              <AvatarFallback>{conversation.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium truncate">{conversation.customerName}</h4>
                                <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{conversation.vehicleInterest}</p>
                              <p className="text-sm text-muted-foreground truncate mt-1">{conversation.lastMessage}</p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge className={getStatusColor(conversation.status)} variant="secondary">
                                  {getStatusIcon(conversation.status)}
                                  <span className="ml-1 text-xs">{conversation.status}</span>
                                </Badge>
                                {conversation.unread > 0 && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    {conversation.unread}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Message View */}
                <Card className="lg:col-span-2 flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>AA</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">Anna Andersson</h3>
                          <p className="text-sm text-muted-foreground">Interested in BMW 320i 2023</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" data-testid="button-call-customer">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-video-call">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-more-options">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.senderId === 'agent'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                            data-testid={`message-${message.id}`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <Textarea 
                        placeholder="Type your message..."
                        className="flex-1 min-h-[60px] resize-none"
                        data-testid="input-message"
                      />
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" data-testid="button-send-message">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-use-template">
                          Templates
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    SMS Campaign Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Campaign Name</label>
                        <Input placeholder="Enter campaign name" data-testid="input-campaign-name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Target Audience</label>
                        <Input placeholder="All customers, Hot leads, etc." data-testid="input-target-audience" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <Textarea 
                          placeholder="Enter your SMS message (max 160 characters)"
                          className="h-24"
                          data-testid="input-sms-message"
                        />
                      </div>
                      <Button data-testid="button-send-sms-campaign">
                        <Send className="w-4 h-4 mr-2" />
                        Send Campaign
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium">Recent Campaigns</h3>
                      <div className="space-y-2">
                        <div className="p-3 border rounded-lg" data-testid="campaign-history-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm">Spring Sale Promotion</h4>
                              <p className="text-xs text-muted-foreground">Sent to 248 customers</p>
                            </div>
                            <span className="text-xs text-muted-foreground">2 days ago</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">32% open rate • 8 responses</p>
                        </div>
                        <div className="p-3 border rounded-lg" data-testid="campaign-history-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm">New Inventory Alert</h4>
                              <p className="text-xs text-muted-foreground">Sent to 156 customers</p>
                            </div>
                            <span className="text-xs text-muted-foreground">1 week ago</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">28% open rate • 5 responses</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {templates.map((template) => (
                      <Card key={template.id} data-testid={`template-${template.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Button variant="ghost" size="sm" data-testid={`edit-template-${template.id}`}>
                              Edit
                            </Button>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">{template.subject}</p>
                          <p className="text-sm text-muted-foreground">{template.content}</p>
                          <Button variant="outline" size="sm" className="mt-3" data-testid={`use-template-${template.id}`}>
                            Use Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="messages-sent">1,247</p>
                        <p className="text-xs text-green-600 mt-1">↗ +23% this week</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="response-rate">34%</p>
                        <p className="text-xs text-green-600 mt-1">↗ +5% this week</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="avg-response-time">12m</p>
                        <p className="text-xs text-green-600 mt-1">↗ 2m faster</p>
                      </div>
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Appointments Booked</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="appointments-booked">89</p>
                        <p className="text-xs text-green-600 mt-1">↗ +15% this week</p>
                      </div>
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}