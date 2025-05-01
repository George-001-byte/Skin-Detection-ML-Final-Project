
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/lib/authUtils";
import { getAllStoredImages, getStoredImagesFromDB, StoredImage } from "@/lib/storageUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const History = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyses = async () => {
      setIsLoading(true);
      try {
        // Get analyses from both sources
        const localImages = getAllStoredImages();
        let dbImages: StoredImage[] = [];
        
        if (user) {
          //dbImages = await getStoredImagesFromDB();
          //console.log("DB images loaded:", dbImages.length);
        }
        
        // Combine and deduplicate (in case some are in both)
        const allImages = [...dbImages, ...localImages];
        const uniqueImages = Array.from(
          new Map(allImages.map(item => [item.id, item])).values()
        );
        
        // Sort by date (newest first)
        setStoredImages(uniqueImages.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (error) {
        console.error("Error loading analyses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check if the user is authenticated or loading
    if (!loading) {
      setIsAuthorized(true);
      loadAnalyses();
    }
  }, [user, loading]);

  const viewAnalysis = (analysis: StoredImage) => {
    // Store the analysis data for the analysis page to display
    sessionStorage.setItem('analysisResult', JSON.stringify(analysis.result));
    sessionStorage.setItem('analyzedImageUrl', analysis.imageUrl);
    
    // Navigate to analysis page
    navigate('/analysis');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Analysis History</h1>
          <p className="text-gray-600">View all your previous skin analyses</p>
        </div>
        
        {storedImages.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="py-8">
                <h3 className="text-lg font-medium mb-2">No analyses yet</h3>
                <p className="text-gray-500 mb-4">You haven't performed any skin analyses yet.</p>
                <Button onClick={() => navigate('/dashboard')}>Start New Analysis</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storedImages.map((analysis, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={analysis.imageUrl} 
                      alt={`Analysis of ${analysis.result.disease.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{analysis.result.disease.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        analysis.result.disease.riskLevel === "High" ? "bg-red-100 text-red-800" :
                        analysis.result.disease.riskLevel === "Moderate" ? "bg-amber-100 text-amber-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {analysis.result.disease.riskLevel} Risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(analysis.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {analysis.result.disease.description.substring(0, 100)}...
                    </p>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewAnalysis(analysis)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
    </div>
  );
};

export default History;
