
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { AnalysisResult as AnalysisResultType } from "@/lib/simData";

export default function AnalysisResult() {
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [analysisId, setAnalysisId] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Retrieve analysis results from session storage
    const storedResult = sessionStorage.getItem('analysisResult');
    const storedImageUrl = sessionStorage.getItem('analyzedImageUrl');
    
    // Reset state before processing new data
    setResult(null);
    setImageUrl(null);
    setImageError(false);
    
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult) as AnalysisResultType;
        // Convert string timestamp back to Date object
        parsedResult.timestamp = new Date(parsedResult.timestamp);
        setResult(parsedResult);
        
        // Generate a unique ID for this analysis to help with re-renders
        setAnalysisId(Date.now().toString());
      } catch (error) {
        console.error("Failed to parse analysis result:", error);
        navigate('/dashboard');
      }
    } else {
      // If no result is found, redirect to dashboard
      navigate('/dashboard');
    }
    
    if (storedImageUrl) {
      console.log("Setting image URL:", storedImageUrl);
      setImageUrl(storedImageUrl);
    }
    
    // Clean up function to handle component unmounting
    return () => {
      // We don't clear session storage here as it might be needed for returning to this page
    };
  }, [navigate]);

  const formatDatetime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 75) return "text-blue-600";
    return "text-amber-600";
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case "High": return "text-red-600";
      case "Moderate": return "text-amber-600";
      case "Low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const handleImageError = () => {
    console.error("Image failed to load:", imageUrl);
    setImageError(true);
  };

  if (!result) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-medical-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto" key={analysisId}>
      <div className="mb-8 text-center">
        <span className="inline-block bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium">
          Analysis Complete
        </span>
        <h2 className="mt-2 text-2xl font-bold">Skin Disease Analysis Results</h2>
        <p className="text-gray-500">
          Analyzed on {formatDatetime(result.timestamp)}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Analyzed Image</CardTitle>
          </CardHeader>
          <CardContent>
            {imageUrl && !imageError ? (
              <img 
                src={imageUrl} 
                alt="Analyzed skin" 
                className="w-full h-auto rounded-md" 
                onError={handleImageError}
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm text-gray-500">
              <p className="font-medium text-black mb-1">Primary Match</p>
              <p>{result.disease.name}</p>
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2 border-none shadow-md bg-white">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold">{result.disease.name}</CardTitle>
                <CardDescription className="text-sm italic">{result.disease.scientificName}</CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>
                  {Math.round(result.confidence)}% Match
                </div>
                <div className={`text-sm font-medium ${getRiskLevelColor(result.disease.riskLevel)}`}>
                  {result.disease.riskLevel} Risk
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="causes">Causes</TabsTrigger>
                <TabsTrigger value="prevention">Prevention</TabsTrigger>
                <TabsTrigger value="treatment">Treatment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-4 bg-gray-50 rounded-md">
                <p className="text-gray-800 mb-4">{result.disease.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Confidence Score</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={result.confidence} className="h-2" />
                    <span className="text-sm font-medium">{Math.round(result.confidence)}%</span>
                  </div>
                </div>
                
                {result.similarDiseases && result.similarDiseases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Similar Conditions</h4>
                    <div className="space-y-2">
                      {result.similarDiseases.map((similar, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-grow">
                            <span className="text-sm">{similar.name}</span>
                            <Progress value={similar.confidence} className="h-1.5 mt-1" />
                          </div>
                          <span className="text-xs font-medium">{Math.round(similar.confidence)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="causes" className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Common Causes</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {result.disease.causes.map((cause, index) => (
                    <li key={index} className="text-gray-700">{cause}</li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="prevention" className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Prevention Methods</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {result.disease.prevention.map((method, index) => (
                    <li key={index} className="text-gray-700">{method}</li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="treatment" className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Common Treatments</h4>
                <div className="mb-4">
                  <ul className="list-disc pl-5 space-y-1">
                    {result.disease.treatments.map((treatment, index) => (
                      <li key={index} className="text-gray-700">{treatment}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-gray-500 italic mt-4">
                  Note: These are common treatments for this condition. Always consult a healthcare professional for personalized medical advice.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              New Analysis
            </Button>
            <Button>
              Download Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
