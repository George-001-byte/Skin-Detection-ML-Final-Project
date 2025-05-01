
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AnalysisResult from "@/components/AnalysisResult";
import { useAuth } from "@/lib/authUtils";
import { getAllStoredImages, getStoredImagesFromDB, StoredImage } from "@/lib/storageUtils";
import { Card, CardContent } from "@/components/ui/card";

const Analysis = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [previousAnalyses, setPreviousAnalyses] = useState<StoredImage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const loadAnalyses = async () => {
      // Check if the user is authenticated
      if (!loading && !user) {
        navigate("/");
      } else if (!loading && user) {
        setIsAuthorized(true);
        
        // Load previous analyses from both sources
        const localImages = getAllStoredImages();
        let dbImages: StoredImage[] = [];
        
        if (user) {
          //dbImages = await getStoredImagesFromDB();
        }
        
        // Combine and deduplicate
        const allImages = [...dbImages, ...localImages];
        const uniqueImages = Array.from(
          new Map(allImages.map(item => [item.id, item])).values()
        );
        
        setPreviousAnalyses(uniqueImages);
        
        // Set up a refresh on mount to ensure we're showing the latest data
        setRefreshKey(prev => prev + 1);
      }
    };
    
    loadAnalyses();
  }, [navigate, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <AnalysisResult key={refreshKey} />
        
        {previousAnalyses.length > 1 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-4">Previous Analyses</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previousAnalyses
                .slice(0, 8) // Limit to 8 previous analyses
                .map((analysis, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={analysis.imageUrl} 
                        alt={`Previous analysis ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback for broken images
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium truncate">{analysis.result.disease.name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
      
    </div>
  );
};

export default Analysis;
