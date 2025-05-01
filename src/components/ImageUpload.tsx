import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { analyzeImage } from "@/lib/simData";
import { 
  generateImageHash, 
  findImageAnalysis, 
  storeImageAnalysis,
  storeImageAnalysisInDB 
} from "@/lib/storageUtils";
import { useAuth } from "@/lib/authUtils";

export default function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const resetState = () => {
    // Reset all component state
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploading(false);
    setAnalyzing(false);
    setScanProgress(0);
    setImageHash(null);
    
    // Clear session storage
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('analyzedImageUrl');
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large (max 5MB)");
      return;
    }

    // Reset previous state and clear stored data
    resetState();

    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    
    // Generate a hash for this image
    const hash = await generateImageHash(file);
    setImageHash(hash);
    
    // Check if this image has been analyzed before
    const existingAnalysis = findImageAnalysis(hash);
    if (existingAnalysis) {
      toast.info("This image has been analyzed before. Loading previous results...");
    }
    
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !imageHash) {
      toast.error("Please select an image first");
      return;
    }

    setUploading(true);
    setScanProgress(0);
    
    // Check if this image has been analyzed before
    const existingAnalysis = findImageAnalysis(imageHash);
    
    if (existingAnalysis) {
      // Use existing analysis instead of generating a new one
      await new Promise(resolve => setTimeout(resolve, 800));
      setUploading(false);
      setAnalyzing(true);
      
      // Simulate analysis progress, but faster since we're reusing results
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + 10;
          return newProgress <= 100 ? newProgress : 100;
        });
      }, 100);
      
      // Store the existing result in session storage to pass to the analysis page
      sessionStorage.setItem('analysisResult', JSON.stringify(existingAnalysis.result));
      sessionStorage.setItem('analyzedImageUrl', existingAnalysis.imageUrl);
      
      // Clear the interval and navigate to results
      setTimeout(() => {
        clearInterval(interval);
        setAnalyzing(false); 
        navigate('/analysis');
      }, 1000);
      
      return;
    }
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUploading(false);
    setAnalyzing(true);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + 5;
        return newProgress <= 100 ? newProgress : 100;
      });
    }, 150);
    
    try {
      // Analyze image using our simulated function
      const result = await analyzeImage(selectedFile);
      
      // Store the result in session storage to pass to the analysis page
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      if (previewUrl) {
        sessionStorage.setItem('analyzedImageUrl', previewUrl);
      }
      
      // Store the image analysis for future use (locally)
      if (previewUrl && imageHash) {
        storeImageAnalysis(imageHash, previewUrl, result);
        
        // If user is authenticated, also store in Supabase
        if (user) {
          await storeImageAnalysisInDB(previewUrl, result);
        }
      }
      
      // Clear the interval and navigate to results
      clearInterval(interval);
      setTimeout(() => {
        setAnalyzing(false);
        navigate('/analysis');
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setAnalyzing(false);
      setScanProgress(0);
      toast.error("Analysis failed. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6 flex flex-col items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {previewUrl ? (
            <div className="relative w-full max-w-md mb-4">
              <img
                src={previewUrl}
                alt="Selected skin image"
                className="w-full h-auto max-h-80 object-contain rounded-md"
              />
              
              {analyzing && (
                <>
                  <div className="absolute top-0 left-0 w-full h-full bg-blue-500/10 rounded-md flex items-center justify-center">
                    <div className="scanning-line animate-scan"></div>
                    <div className="text-medical-blue font-semibold bg-white/80 px-3 py-1 rounded-full">
                      Scanning... {scanProgress}%
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div 
              className="w-full p-12 flex flex-col items-center justify-center gap-4 cursor-pointer" 
              onClick={handleUploadClick}
            >
              <div className="rounded-full bg-medical-blue/10 p-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-medical-blue" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">Upload an image of the affected skin area</p>
              <p className="text-sm text-gray-500">Click here or drag and drop</p>
              <p className="text-xs text-gray-400">Supported formats: JPG, PNG, WEBP (max 5MB)</p>
            </div>
          )}
          
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              onClick={handleUploadClick}
              disabled={uploading || analyzing}
            >
              {previewUrl ? "Change Image" : "Select Image"}
            </Button>
            
            {previewUrl && (
              <Button
                onClick={handleAnalyze}
                disabled={uploading || analyzing}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : analyzing ? (
                  "Analyzing..."
                ) : (
                  "Analyze Image"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
