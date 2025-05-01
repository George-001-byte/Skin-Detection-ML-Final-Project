import AuthForm from "@/components/AuthForm";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authUtils";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-medical-light to-white">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="container mx-auto px-4 py-12 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : user ? (
          <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome Back to SkinSense ML</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Continue to your dashboard to analyze skin conditions with our advanced ML technology.
            </p>
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Advanced Skin Disease Detection
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Upload images of skin concerns and get instant ML-powered analysis, including condition identification, causes, and preventive measures.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                <div className="bg-white p-3 rounded-md shadow-sm border flex items-center space-x-2">
                  <div className="rounded-full bg-blue-100 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-medical-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Secure & Private</div>
                    <div className="text-gray-500">Your data stays protected</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm border flex items-center space-x-2">
                  <div className="rounded-full bg-green-100 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Instant Results</div>
                    <div className="text-gray-500">Analysis in seconds</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <AuthForm />
            </div>
          </div>
        )}
      </main>
     
    </div>
  );
};

export default Index;
