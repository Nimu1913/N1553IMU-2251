import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { MessageSquare, Plus, Search, Filter, Mail, Phone, Send, Clock, User, Star, Bot, Zap, BarChart3, Settings, Play, Pause } from "lucide-react";

export default function CommunicationsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("messages");
  const [chatbotActive, setChatbotActive] = useState(true);
  const [chatbotStats, setChatbotStats] = useState({
    conversations: 127,
    conversions: 23,
    responseTime: '1.2s',
    satisfaction: 4.8
  });

  const messages = [
    {
      id: 1,
      customerName: "Anna Lindqvist",
      customerEmail: "anna.lindqvist@gmail.com",
      subject: "BMW X3 Test Drive Follow-up",
      type: "Email",
      content: "Hi, I had a great experience with the test drive yesterday. I'm very interested in purchasing the BMW X3. Could we discuss financing options?",
      timestamp: "2024-01-15 14:30",
      status: "Unread",
      priority: "High",
      assignedTo: "Erik S."
    },
    {
      id: 2,
      customerName: "Magnus Eriksson",
      customerEmail: "+46 70 987 6543",
      subject: "Service appointment confirmation",
      type: "SMS",
      content: "Thanks for confirming my service appointment for Thursday 10 AM. See you then!",
      timestamp: "2024-01-15 12:15",
      status: "Read",
      priority: "Normal",
      assignedTo: "Maria K."
    },
    {
      id: 3,
      customerName: "Emma Johansson",
      customerEmail: "emma.johansson@company.se",
      subject: "Volvo XC90 Business Leasing",
      type: "Email",
      content: "We're looking for a fleet leasing solution for 5 Volvo XC90s. Can you provide a comprehensive quote including maintenance packages?",
      timestamp: "2024-01-15 11:45",
      status: "Replied",
      priority: "High",
      assignedTo: "Lars A."
    },
    {
      id: 4,
      customerName: "Alexander Berg",
      customerEmail: "alex.berg@email.com",
      subject: "Mercedes C-Class availability",
      type: "Web Chat",
      content: "Is the Mercedes C-Class still available? I saw it on your website and I'm interested in scheduling a viewing.",
      timestamp: "2024-01-15 09:20",
      status: "Pending",
      priority: "Normal",
      assignedTo: "Unassigned"
    }
  ];

  const templates = [
    {
      id: 1,
      name: "Welcome New Customer",
      type: "Email",
      subject: "Welcome to [Dealership Name]",
      category: "Onboarding",
      lastUsed: "2024-01-14",
      usageCount: 245
    },
    {
      id: 2,
      name: "Test Drive Follow-up",
      type: "Email",
      subject: "How was your test drive experience?",
      category: "Follow-up",
      lastUsed: "2024-01-15",
      usageCount: 189
    },
    {
      id: 3,
      name: "Service Reminder",
      type: "SMS",
      subject: "Service appointment reminder",
      category: "Service",
      lastUsed: "2024-01-15",
      usageCount: 567
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Unread": return "bg-red-500";
      case "Read": return "bg-blue-500";
      case "Replied": return "bg-green-500";
      case "Pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400";
      case "Normal": return "text-blue-400";
      case "Low": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Email": return Mail;
      case "SMS": return Phone;
      case "Web Chat": return MessageSquare;
      default: return MessageSquare;
    }
  };

  const filteredMessages = messages.filter(message => 
    message.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Communications</h1>
                <p className="text-white/70">Manage customer communications</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all flex items-center space-x-2">
              <Plus size={18} />
              <span>New Message</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedTab("messages")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === "messages" 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => setSelectedTab("templates")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === "templates" 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setSelectedTab("chatbot")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                  selectedTab === "chatbot" 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Bot size={16} />
                <span>Smart Chatbot</span>
                {chatbotActive && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search messages or templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">47</div>
            <div className="text-white/70 text-sm">Unread Messages</div>
            <div className="text-red-400 text-xs">Requires attention</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">23 min</div>
            <div className="text-white/70 text-sm">Avg Response Time</div>
            <div className="text-green-400 text-xs">Excellent!</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">156</div>
            <div className="text-white/70 text-sm">Today's Messages</div>
            <div className="text-blue-400 text-xs">+12% from yesterday</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="text-white/70 text-sm">Customer Satisfaction</div>
            <div className="text-green-400 text-xs">Outstanding!</div>
          </div>
        </div>

        {selectedTab === "messages" ? (
          <div className="space-y-4">
            {filteredMessages.map((message) => {
              const TypeIcon = getTypeIcon(message.type);
              return (
                <div key={message.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <TypeIcon size={18} className="text-green-400" />
                        <span className="text-sm text-white/70">{message.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(message.status)}`}></div>
                        <span className="text-xs text-white/70">{message.status}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star size={14} className={getPriorityColor(message.priority)} />
                        <span className={`text-xs ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-white/60">
                      <Clock size={14} />
                      <span>{message.timestamp}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-white/60" />
                        <span className="text-white font-semibold">{message.customerName}</span>
                      </div>
                      <div className="text-sm text-white/70">{message.customerEmail}</div>
                      <div className="text-sm">
                        <span className="text-white/60">Assigned to:</span>
                        <span className="text-white ml-1">{message.assignedTo}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                      <p className="text-white/80 text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                        Reply
                      </button>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                        Forward
                      </button>
                      <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors">
                        Archive
                      </button>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
                      Mark as {message.status === "Unread" ? "Read" : "Unread"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const TypeIcon = getTypeIcon(template.type);
              return (
                <div key={template.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <TypeIcon size={20} className="text-green-400" />
                      <span className="text-sm text-white/70">{template.type}</span>
                    </div>
                    <div className="text-xs text-white/60">{template.category}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <p className="text-sm text-white/70">{template.subject}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Used:</span>
                        <div className="text-white font-semibold">{template.usageCount} times</div>
                      </div>
                      <div>
                        <span className="text-white/60">Last Used:</span>
                        <div className="text-white">{template.lastUsed}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                        Use Template
                      </button>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(selectedTab === "messages" ? filteredMessages : filteredTemplates).length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-white/40 mb-4" />
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