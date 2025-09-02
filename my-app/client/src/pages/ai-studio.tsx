import { useState, useRef } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Wand2, 
  Download, 
  Sparkles, 
  Camera, 
  Palette,
  Zap,
  Eye,
  Settings,
  RefreshCw,
  ImageIcon,
  Cpu
} from "lucide-react";

export default function AIStudio() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [generatedShowroom, setGeneratedShowroom] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  type ShowroomStyle = { id: string; name: string; description?: string };

  const { data: showroomStyles = [] } = useQuery<ShowroomStyle[]>({
    queryKey: ["/api/ai-photo/showroom-styles"],
  });

  const analyzePhoto = useMutation({
    mutationFn: (imageData: string) => 
      apiRequest("POST", "/api/ai-photo/analyze", { image: imageData }),
    onSuccess: async (response) => {
      const data = await response.json();
      console.log("Received analysis data:", data);
      setAnalysisResult(data);
      toast({
        title: "Photo Analyzed!",
        description: data.vehicleDetected ? 
          `Detected ${data.vehicleType} - ${data.lighting} lighting quality` :
          "No vehicle detected in image",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze photo",
      });
    },
  });

  const generateShowroom = useMutation({
    mutationFn: (data: { vehicleInfo: any; showroomStyle: string; aspectRatio: string }) =>
      apiRequest("POST", "/api/ai-photo/generate-showroom", data),
    onSuccess: async (response) => {
      const data = await response.json();
      setGeneratedShowroom(data.background);
      toast({
        title: "Showroom Generated!",
        description: "Your AI-powered showroom background is ready",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive", 
        title: "Generation Failed",
        description: error.message || "Failed to generate showroom",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setAnalysisResult(null);
        setGeneratedShowroom(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedImage) {
      analyzePhoto.mutate(selectedImage);
    }
  };

  const handleGenerateShowroom = () => {
    if (analysisResult && selectedStyle) {
      generateShowroom.mutate({
        vehicleInfo: analysisResult,
        showroomStyle: selectedStyle,
        aspectRatio: "16:9"
      });
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto bg-secondary/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <Sparkles className="w-7 h-7 mr-3 text-primary" />
                AI Photo Studio
              </h1>
              <p className="text-muted-foreground">Transform any car photo into a stunning showroom masterpiece</p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Cpu className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                GPT-5 Vision
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="transform" className="space-y-6">
            <TabsList>
              <TabsTrigger value="transform" data-testid="tab-transform">Transform Photos</TabsTrigger>
              <TabsTrigger value="enhance" data-testid="tab-enhance">Enhance Quality</TabsTrigger>
              <TabsTrigger value="batch" data-testid="tab-batch">Batch Processing</TabsTrigger>
            </TabsList>

            <TabsContent value="transform" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Vehicle Photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="upload-area"
                    >
                      {selectedImage ? (
                        <div className="space-y-4">
                          <img 
                            src={selectedImage} 
                            alt="Uploaded vehicle" 
                            className="max-h-48 mx-auto rounded-lg shadow-md"
                          />
                          <p className="text-sm text-muted-foreground">Click to change photo</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                          <div>
                            <p className="text-lg font-medium">Drop your vehicle photo here</p>
                            <p className="text-sm text-muted-foreground">or click to browse files</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="file-input"
                    />
                    
                    {selectedImage && (
                      <Button 
                        onClick={handleAnalyze}
                        disabled={analyzePhoto.isPending}
                        className="w-full"
                        data-testid="analyze-button"
                      >
                        {analyzePhoto.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing with AI...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Analyze Photo
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cpu className="w-5 h-5 mr-2" />
                      AI Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult ? (
                      <div className="space-y-4" data-testid="analysis-results">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Vehicle Detected</Label>
                            <div className="mt-1">
                              <Badge className={analysisResult.vehicleDetected ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}>
                                {analysisResult.vehicleDetected ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Vehicle Type</Label>
                            <p className="text-sm font-medium capitalize mt-1">{analysisResult.vehicleType || 'Unknown'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Photo Angle</Label>
                            <p className="text-sm font-medium capitalize mt-1">{analysisResult.angle || 'Unknown'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lighting Quality</Label>
                            <div className="mt-1">
                              <Badge variant="outline" className="capitalize">{analysisResult.lighting || 'Unknown'}</Badge>
                            </div>
                          </div>
                        </div>

                        {analysisResult.extractedInfo && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Detected Vehicle Info</Label>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {analysisResult.extractedInfo.make && (
                                <div><strong>Make:</strong> {analysisResult.extractedInfo.make}</div>
                              )}
                              {analysisResult.extractedInfo.model && (
                                <div><strong>Model:</strong> {analysisResult.extractedInfo.model}</div>
                              )}
                              {analysisResult.extractedInfo.color && (
                                <div><strong>Color:</strong> {analysisResult.extractedInfo.color}</div>
                              )}
                              {analysisResult.extractedInfo.year && (
                                <div><strong>Year:</strong> {analysisResult.extractedInfo.year}</div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">AI Suggestions</Label>
                          <p className="text-sm text-muted-foreground">{analysisResult.suggestions}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Upload and analyze a photo to see AI insights</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Showroom Generation */}
              {analysisResult?.vehicleDetected && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Showroom Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-1 space-y-4">
                        <div>
                          <Label htmlFor="showroom-style">Showroom Style</Label>
                          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                            <SelectTrigger data-testid="select-showroom-style">
                              <SelectValue placeholder="Choose a showroom style" />
                            </SelectTrigger>
                            <SelectContent>
                              {showroomStyles.map((style: any) => (
                                <SelectItem key={style.id} value={style.id}>
                                  {style.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedStyle && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {showroomStyles.find((s: any) => s.id === selectedStyle)?.description}
                            </p>
                          )}
                        </div>

                        <Button 
                          onClick={handleGenerateShowroom}
                          disabled={!selectedStyle || generateShowroom.isPending}
                          className="w-full"
                          data-testid="generate-showroom-button"
                        >
                          {generateShowroom.isPending ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Showroom
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="lg:col-span-2">
                        {generatedShowroom ? (
                          <div className="space-y-4" data-testid="generated-showroom">
                            <img 
                              src={generatedShowroom} 
                              alt="Generated showroom background"
                              className="w-full rounded-lg shadow-lg"
                            />
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => downloadImage(generatedShowroom, 'showroom-background.png')}
                                data-testid="download-background"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Background
                              </Button>
                              <Button 
                                variant="outline"
                                data-testid="create-composite"
                              >
                                <Palette className="w-4 h-4 mr-2" />
                                Create Composite
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                            <Wand2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Select a style and generate your AI showroom background</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="enhance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Photo Enhancement Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Advanced photo enhancement features coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Batch processing for multiple photos coming soon!</p>
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