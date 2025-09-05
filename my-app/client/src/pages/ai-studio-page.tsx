import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Brain, Zap, MessageSquare, BarChart3, Target, Lightbulb, Play, Settings } from "lucide-react";

export default function AIStudioPage() {
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState("GPT-4");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const aiFeatures = [
    {
      title: "Lead Scoring",
      description: "AI-powered lead qualification and scoring",
      icon: Target,
      color: "from-blue-500 to-cyan-600",
      usage: "1,247 leads scored",
      accuracy: "94%"
    },
    {
      title: "Price Optimization",
      description: "Dynamic pricing recommendations",
      icon: BarChart3,
      color: "from-green-500 to-emerald-600",
      usage: "156 vehicles optimized",
      accuracy: "87%"
    },
    {
      title: "Customer Insights",
      description: "Behavioral analysis and predictions",
      icon: Lightbulb,
      color: "from-purple-500 to-indigo-600",
      usage: "2,341 insights generated",
      accuracy: "91%"
    },
    {
      title: "Auto Responder",
      description: "Intelligent customer communication",
      icon: MessageSquare,
      color: "from-orange-500 to-red-500",
      usage: "892 messages sent",
      accuracy: "96%"
    }
  ];

  const recentAnalytics = [
    { metric: "Lead Conversion", value: "+12.3%", trend: "up", period: "This month" },
    { metric: "Response Time", value: "-45s", trend: "up", period: "Average" },
    { metric: "Customer Satisfaction", value: "4.8/5", trend: "up", period: "Latest survey" },
    { metric: "Sales Velocity", value: "+23%", trend: "up", period: "This quarter" }
  ];

  const models = ["GPT-4", "Claude-3", "Gemini Pro", "Custom Model"];

  const handleRunPrompt = () => {
    if (!prompt.trim()) return;
    
    setResponse("AI analysis in progress... This would integrate with your chosen AI model to provide intelligent insights about your dealership operations, customer behavior, and sales optimization strategies.");
    
    setTimeout(() => {
      setResponse(`Based on your query: "${prompt}"

AI Analysis Results:
• Customer behavior patterns suggest increased interest in electric vehicles (+34% this quarter)
• Optimal pricing strategy detected for BMW X3 models: reduce by 3-5% for faster turnover
• Lead scoring indicates 23 high-priority prospects requiring immediate follow-up
• Recommended inventory adjustments: increase Volvo stock, reduce luxury sedan inventory

Confidence Score: 89%
Data Sources: CRM, Market Trends, Historical Sales
Last Updated: ${new Date().toLocaleString()}`);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Studio</h1>
                <p className="text-white/70">Intelligent insights for your dealership</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
              <Settings size={18} />
              <span>Configure AI</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {aiFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{feature.accuracy}</div>
                    <div className="text-xs text-white/60">Accuracy</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                  <div className="text-xs text-green-400">{feature.usage}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">AI Prompt Interface</h2>
                <div className="flex items-center space-x-2">
                  <Zap size={20} className="text-yellow-400" />
                  <span className="text-sm text-white/70">Powered by AI</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">AI Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  >
                    {models.map(model => (
                      <option key={model} value={model} className="bg-gray-900">{model}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Query</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask AI about your dealership operations, customer insights, market trends, or optimization strategies..."
                    className="w-full h-32 p-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                  />
                </div>
                
                <button
                  onClick={handleRunPrompt}
                  disabled={!prompt.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  <Play size={18} />
                  <span>Run AI Analysis</span>
                </button>
                
                {response && (
                  <div className="mt-4 p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg">
                    <h3 className="text-sm font-semibold text-white mb-2">AI Response:</h3>
                    <div className="text-sm text-white/80 whitespace-pre-line">{response}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Performance</h3>
              <div className="space-y-4">
                {recentAnalytics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{item.metric}</div>
                      <div className="text-xs text-white/60">{item.period}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">{item.value}</div>
                      <div className="text-xs text-white/60">Improved</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <div className="font-medium text-white text-sm">Generate Lead Report</div>
                  <div className="text-xs text-white/60">AI-powered lead analysis</div>
                </button>
                <button className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <div className="font-medium text-white text-sm">Optimize Pricing</div>
                  <div className="text-xs text-white/60">Market-based recommendations</div>
                </button>
                <button className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <div className="font-medium text-white text-sm">Customer Insights</div>
                  <div className="text-xs text-white/60">Behavioral analysis</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}