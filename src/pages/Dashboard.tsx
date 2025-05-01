
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    if (!loading && !user) {
      navigate("/");
    } else if (!loading && user) {
      setIsAuthorized(true);
    }
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
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Skin Disease Detection</h1>
          <p className="text-gray-600">Upload an image for analysis and get instant ML-powered results</p>
        </div>
        
        <section className="mb-12">
          <ImageUpload />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-medical-blue font-bold text-xl">1</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Upload Image</h3>
                <p className="text-gray-600 text-sm">
                  Take a clear photo of the affected skin area and upload it for analysis
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-medical-blue font-bold text-xl">2</span>
                </div>
                <h3 className="font-medium text-lg mb-2">ML Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Our advanced algorithm processes the image and detects potential skin conditions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-medical-blue font-bold text-xl">3</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Get Results</h3>
                <p className="text-gray-600 text-sm">
                  Review detailed information about the detected condition, including causes and prevention
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        
       
      </main>
     
    </div>
  );
};

export default Dashboard;
