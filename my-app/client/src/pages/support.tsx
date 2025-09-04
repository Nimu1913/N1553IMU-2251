import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Book,
  Zap,
  Users
} from "lucide-react";

export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const faqs = [
    {
      question: "How do I schedule a test drive?",
      answer: "Click the 'Schedule Test Drive' button on the dashboard or use the Quick Book feature to instantly create appointments."
    },
    {
      question: "Can I integrate with my existing CRM?",
      answer: "Yes! TestRide.io supports integration with major CRM systems. Go to Settings > Integrations to configure."
    },
    {
      question: "How do I generate QR codes for walk-ins?",
      answer: "Navigate to the Dashboard and click 'Generate QR Code'. You can print or share the code with customers."
    },
    {
      question: "What's included in the Pro plan?",
      answer: "Pro plan includes unlimited test drives, advanced analytics, SMS campaigns, and priority support."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of TestRide.io",
      icon: <Book className="w-5 h-5" />,
      link: "#"
    },
    {
      title: "API Documentation",
      description: "Integrate TestRide.io with your tools",
      icon: <FileText className="w-5 h-5" />,
      link: "#"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step tutorials",
      icon: <Zap className="w-5 h-5" />,
      link: "#"
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: <Users className="w-5 h-5" />,
      link: "#"
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto bg-secondary/30 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Support Center</h1>
            <p className="text-muted-foreground">Get help and find answers to your questions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Support Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Send us a message and we'll get back to you within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Brief description of your issue" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select 
                        id="category"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option>Technical Issue</option>
                        <option>Billing Question</option>
                        <option>Feature Request</option>
                        <option>General Inquiry</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Describe your issue in detail..."
                        className="h-32"
                      />
                    </div>
                    <Button className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <details key={index} className="group">
                        <summary className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-accent transition-colors">
                          <span className="font-medium">{faq.question}</span>
                          <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                        </summary>
                        <p className="p-3 text-sm text-muted-foreground">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Contact & Resources */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Phone Support</p>
                      <p className="text-xs text-muted-foreground">1-800-TEST-RIDE</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Email Support</p>
                      <p className="text-xs text-muted-foreground">support@testride.io</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Live Chat</p>
                      <p className="text-xs text-muted-foreground">Available 9am-5pm EST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.link}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-primary">{resource.icon}</div>
                          <div>
                            <p className="font-medium text-sm">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.description}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <HelpCircle className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">Need immediate help?</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Our support team is available Monday-Friday, 9am-5pm EST.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Start Live Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}