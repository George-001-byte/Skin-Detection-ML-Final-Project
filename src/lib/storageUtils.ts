
import { AnalysisResult, DiseaseData } from "./simData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// Type for stored image with analysis result
export type StoredImage = {
  id: string;
  imageUrl: string;
  result: AnalysisResult;
  timestamp: string;
};

// Generate a hash for an image file (simple implementation)
export const generateImageHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Store image analysis locally (for non-authenticated users)
export const storeImageAnalysis = (imageId: string, imageUrl: string, result: AnalysisResult): void => {
  try {
    // Get existing analyses from localStorage
    const storedImages = getAllStoredImages();
    
    // Add the new analysis
    const newImage: StoredImage = {
      id: imageId,
      imageUrl,
      result,
      timestamp: new Date().toISOString(),
    };
    
    // Add to the beginning of the array
    storedImages.unshift(newImage);
    
    // Store back to localStorage (limit to 20 entries)
    localStorage.setItem('skinAnalysisImages', JSON.stringify(storedImages.slice(0, 20)));
  } catch (error) {
    console.error('Error storing image analysis:', error);
  }
};

// Store image analysis in Supabase database
export const storeImageAnalysisInDB = async (imageUrl: string, result: AnalysisResult): Promise<boolean> => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      toast.error('You need to be logged in to save analyses');
      return false;
    }
    
    const { error } = await supabase.from('skin_analyses').insert({
      disease: result.disease.name,
      risk_level: result.disease.riskLevel,
      description: result.disease.description,
      causes: result.disease.causes.join("\n"),
      prevention: result.disease.prevention.join("\n"),
      image_url: imageUrl, // Ensure this is stored correctly
      user_id: user.id
    });

    if (error) {
      console.error('Error storing analysis in database:', error);
      toast.error('Failed to save analysis to your account');
      return false;
    }

    toast.success('Analysis saved to your account');
    return true;
  } catch (error) {
    console.error('Error storing analysis in database:', error);
    return false;
  }
};

// Find an image analysis by its hash
export const findImageAnalysis = (imageHash: string): StoredImage | null => {
  try {
    const storedImages = getAllStoredImages();
    return storedImages.find(img => img.id === imageHash) || null;
  } catch {
    return null;
  }
};

// Get all stored image analyses from localStorage
export const getAllStoredImages = (): StoredImage[] => {
  try {
    const storedData = localStorage.getItem('skinAnalysisImages');
    return storedData ? JSON.parse(storedData) : [];
  } catch {
    return [];
  }
};

// Get all stored image analyses from Supabase DB
export const getStoredImagesFromDB = async (): Promise<StoredImage[]> => {
  try {
    // Check if user is authenticated first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching analyses from database:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert DB format to StoredImage format
    return data.map(item => {
      const disease: DiseaseData = {
        id: item.disease.toLowerCase().replace(/\s+/g, '-'),
        name: item.disease,
        scientificName: "", // We don't have this in DB
        description: item.description || "",
        causes: item.causes ? item.causes.split('\n') : [],
        prevention: item.prevention ? item.prevention.split('\n') : [],
        treatments: [], // We don't have this in DB
        riskLevel: item.risk_level as "Low" | "Moderate" | "High",
        imageUrl: "", // This will be overridden below
      };

      const result: AnalysisResult = {
        disease,
        confidence: 90, // Simulated confidence value
        timestamp: new Date(item.created_at),
      };

      return {
        id: item.id,
        imageUrl: item.image_url || "", // Ensure we're using the image_url field
        result,
        timestamp: item.created_at,
      };
    });
  } catch (error) {
    console.error('Error processing analyses from database:', error);
    return [];
  }
};
