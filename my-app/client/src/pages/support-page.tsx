import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Phone, Plus, Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, User, Mail } from "lucide-react";

export default function SupportPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("tickets");

  const tickets = [
    {
      id: "T-2024-001",
      subject: "Login issues with mobile app",
      description: "Unable to login to the mobile application after updating to the latest version. Getting error 'Invalid credentials' even with correct password.",
      status: "Open",
      priority: "High",
      category: "Technical",
      createdBy: "Erik Svensson",
      createdDate: "2024-01-15",
      lastUpdate: "2024-01-15 14:30",
      assignedTo: "Support Team",
      responses: 2
    },
    {
      id: "T-2024-002",
      subject: "Blocket integration not syncing",
      description: "Vehicle listings are not syncing with Blocket automatically. Last successful sync was 3 days ago.",
      status: "In Progress",
      priority: "Medium",
      category: "Integration",
      createdBy: "Maria Karlsson",
      createdDate: "2024-01-12",
      lastUpdate: "2024-01-14 16:45",
      assignedTo: "Technical Team",
      responses: 5
    },
    {
      id: "T-2024-003",
      subject: "How to set up email templates",
      description: "Need assistance with creating custom email templates for different customer communication scenarios.",
      status: "Resolved",
      priority: "Low",
      category: "Training",
      createdBy: "Lars Andersson",
      createdDate: "2024-01-10",
      lastUpdate: "2024-01-11 10:15",
      assignedTo: "Customer Success",
      responses: 3
    },
    {
      id: "T-2024-004",
      subject: "Reporting dashboard not loading",
      description: "The sales reporting dashboard is showing a blank screen when accessed. Browser console shows multiple JavaScript errors.",
      status: "Open",
      priority: "High",
      category: "Technical",
      createdBy: "Anna Lindqvist",
      createdDate: "2024-01-14",
      lastUpdate: "2024-01-14 09:20",
      assignedTo: "Development Team",
      responses: 1
    }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking the 'Forgot Password' link on the login page, or by contacting your administrator.",
      category: "Account",
      views: 245,
      helpful: 23
    },
    {
      id: 2,
      question: "How do I sync vehicles with Blocket?",
      answer: "Go to the Blocket page and click 'Sync All' to manually sync all listings, or enable automatic sync in the settings.",
      category: "Integration",
      views: 189,
      helpful: 34
    },
    {
      id: 3,
      question: "Can I customize email templates?",
      answer: "Yes, you can create and customize email templates in the Communications section under Templates.",
      category: "Features",
      views: 156,
      helpful: 28
    },
    {
      id: 4,
      question: "How do I add new users to the system?",
      answer: "Contact your system administrator to add new users. Only administrators can create new user accounts.",
      category: "Account",
      views: 123,
      helpful: 19
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-red-500";
      case "In Progress": return "bg-yellow-500";
      case "Resolved": return "bg-green-500";
      case "Closed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved": return CheckCircle;
      case "Open": return AlertCircle;
      case "In Progress": return Clock;
      default: return Clock;
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                <Phone size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Support Center</h1>
                <p className="text-white/70">Get help and support for your account</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center space-x-2">
              <Plus size={18} />
              <span>New Ticket</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedTab("tickets")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === "tickets" 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Support Tickets
              </button>
              <button
                onClick={() => setSelectedTab("faqs")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === "faqs" 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                FAQs
              </button>
              <button
                onClick={() => setSelectedTab("contact")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === "contact" 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Contact
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search tickets or FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {selectedTab === "tickets" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-white/70 text-sm">Open Tickets</div>
                <div className="text-red-400 text-xs">Needs attention</div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-white/70 text-sm">In Progress</div>
                <div className="text-yellow-400 text-xs">Being resolved</div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">45</div>
                <div className="text-white/70 text-sm">Resolved</div>
                <div className="text-green-400 text-xs">This month</div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">4.2h</div>
                <div className="text-white/70 text-sm">Avg Response</div>
                <div className="text-blue-400 text-xs">Response time</div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const StatusIcon = getStatusIcon(ticket.status);
                return (
                  <div key={ticket.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(ticket.status)}`}></div>
                          <span className="text-sm text-white/70">{ticket.status}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StatusIcon size={14} className={getPriorityColor(ticket.priority)} />
                          <span className={`text-sm ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <div className="text-sm text-white/60">{ticket.category}</div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <span>#{ticket.id}</span>
                        <div className="flex items-center space-x-1">
                          <MessageSquare size={14} />
                          <span>{ticket.responses}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                        <p className="text-white/70 text-sm leading-relaxed">{ticket.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User size={14} className="text-white/60" />
                          <span className="text-sm text-white">{ticket.createdBy}</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="text-white/60">Created: {ticket.createdDate}</div>
                          <div className="text-white/60">Updated: {ticket.lastUpdate}</div>
                          <div className="text-white/60">Assigned: {ticket.assignedTo}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                          View Details
                        </button>
                        <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                          Add Response
                        </button>
                      </div>
                      {ticket.status !== "Resolved" && (
                        <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
                          Update Status
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {selectedTab === "faqs" && (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-white/60">{faq.category}</div>
                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <span>{faq.views} views</span>
                    <span>{faq.helpful} helpful</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                  <div className="text-sm text-white/60">Was this helpful?</div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                      Yes
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">
                      No
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === "contact" && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Contact Support</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <Phone size={24} className="text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Phone Support</h3>
                  </div>
                  <p className="text-white/70 mb-2">Call us directly for urgent issues</p>
                  <p className="text-white font-mono">+46 8 123 456 78</p>
                  <p className="text-white/60 text-sm">Mon-Fri 9:00-17:00 CET</p>
                </div>

                <div className="p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <Mail size={24} className="text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Email Support</h3>
                  </div>
                  <p className="text-white/70 mb-2">Send us an email for non-urgent matters</p>
                  <p className="text-white font-mono">support@testride.io</p>
                  <p className="text-white/60 text-sm">Response within 24 hours</p>
                </div>

                <div className="p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageSquare size={24} className="text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Live Chat</h3>
                  </div>
                  <p className="text-white/70 mb-4">Chat with our support team in real-time</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all">
                    Start Chat
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Quick Contact Form</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full p-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
                    <select className="w-full p-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
                      <option value="" className="bg-gray-900">Select a category</option>
                      <option value="technical" className="bg-gray-900">Technical Issue</option>
                      <option value="billing" className="bg-gray-900">Billing</option>
                      <option value="feature" className="bg-gray-900">Feature Request</option>
                      <option value="training" className="bg-gray-900">Training</option>
                      <option value="other" className="bg-gray-900">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full p-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                      placeholder="Describe your issue in detail..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {(selectedTab === "tickets" ? filteredTickets : filteredFAQs).length === 0 && selectedTab !== "contact" && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <Phone size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No {selectedTab} found
            </h3>
            <p className="text-white/60">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}