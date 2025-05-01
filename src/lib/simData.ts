
// Simulation data for skin disease detection

export type DiseaseData = {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  causes: string[];
  prevention: string[];
  treatments: string[];
  riskLevel: "Low" | "Moderate" | "High";
  imageUrl: string;
};

export type AnalysisResult = {
  disease: DiseaseData;
  confidence: number;
  additionalNotes?: string;
  similarDiseases?: Array<{
    name: string;
    confidence: number;
  }>;
  timestamp: Date;
};

// Simulated skin diseases database
export const skinDiseases: DiseaseData[] = [
  {
    id: "melanoma",
    name: "Melanoma",
    scientificName: "Melanoma malignum",
    description: "Melanoma is a type of skin cancer that can spread to other organs in the body. It forms in melanocytes, the cells that make melanin, which gives skin its color.",
    causes: [
      "Ultraviolet (UV) radiation exposure from the sun or tanning beds",
      "Genetic factors",
      "Having many moles or abnormal moles",
      "Fair skin, light hair, and freckles",
      "Family history of melanoma"
    ],
    prevention: [
      "Use sunscreen with SPF 30 or higher",
      "Wear protective clothing when outdoors",
      "Avoid tanning beds",
      "Regular skin self-examinations",
      "Annual skin check-ups with a dermatologist"
    ],
    treatments: [
      "Surgery to remove the melanoma",
      "Immunotherapy",
      "Targeted therapy",
      "Radiation therapy",
      "Chemotherapy"
    ],
    riskLevel: "High",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "eczema",
    name: "Eczema",
    scientificName: "Atopic dermatitis",
    description: "A chronic skin condition characterized by itchy, inflamed skin. It commonly appears on the face, backs of the knees, wrists, hands, or feet.",
    causes: [
      "Genetic factors",
      "Immune system dysfunction",
      "Environmental triggers",
      "Allergies",
      "Stress"
    ],
    prevention: [
      "Identify and avoid triggers",
      "Regular moisturizing",
      "Use mild, fragrance-free soaps",
      "Avoid hot water bathing",
      "Humidify dry air"
    ],
    treatments: [
      "Topical corticosteroids",
      "Moisturizers",
      "Antihistamines for itching",
      "Prescription medications",
      "Light therapy"
    ],
    riskLevel: "Moderate",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "acne",
    name: "Acne",
    scientificName: "Acne vulgaris",
    description: "A common skin condition that occurs when hair follicles become clogged with oil and dead skin cells, leading to pimples, blackheads, and whiteheads.",
    causes: [
      "Excess oil production",
      "Hair follicles clogged by oil and dead skin cells",
      "Bacteria",
      "Hormonal changes",
      "Certain medications"
    ],
    prevention: [
      "Regular face washing",
      "Use oil-free products",
      "Avoid touching your face",
      "Maintain a healthy diet",
      "Manage stress"
    ],
    treatments: [
      "Topical treatments (benzoyl peroxide, retinoids)",
      "Oral antibiotics",
      "Hormonal treatments",
      "Isotretinoin for severe cases",
      "Extraction procedures"
    ],
    riskLevel: "Low",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "psoriasis",
    name: "Psoriasis",
    scientificName: "Psoriasis vulgaris",
    description: "An immune-mediated disease that causes raised, red, scaly patches to appear on the skin. It typically affects the outside of the elbows, knees, or scalp.",
    causes: [
      "Immune system dysfunction",
      "Genetic predisposition",
      "Environmental triggers",
      "Stress",
      "Certain medications"
    ],
    prevention: [
      "Avoid triggers (stress, alcohol, smoking)",
      "Regular moisturizing",
      "Maintain a healthy lifestyle",
      "Limit alcohol consumption",
      "Avoid medications that can trigger flares"
    ],
    treatments: [
      "Topical treatments",
      "Light therapy",
      "Oral or injected medications",
      "Biologic drugs",
      "Lifestyle modifications"
    ],
    riskLevel: "Moderate",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "rosacea",
    name: "Rosacea",
    scientificName: "Acne rosacea",
    description: "A chronic inflammatory skin condition that primarily affects the face, causing redness, visible blood vessels, and sometimes small, red, pus-filled bumps.",
    causes: [
      "Blood vessel abnormalities",
      "Skin mites (Demodex folliculorum)",
      "Genetic factors",
      "Environmental triggers",
      "Helicobacter pylori bacteria"
    ],
    prevention: [
      "Identify and avoid triggers",
      "Use gentle skincare products",
      "Protect face from sun exposure",
      "Avoid hot beverages and spicy foods",
      "Manage stress"
    ],
    treatments: [
      "Topical medications",
      "Oral antibiotics",
      "Laser therapy",
      "Light therapy",
      "Lifestyle modifications"
    ],
    riskLevel: "Low",
    imageUrl: "/placeholder.svg"
  }
];

// Function to simulate image analysis
export const analyzeImage = (imageFile: File): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    // Simulate processing time
    const processingTime = 3000 + Math.random() * 2000;
    
    setTimeout(() => {
      // Randomly select a disease for the simulation
      const randomIndex = Math.floor(Math.random() * skinDiseases.length);
      const disease = skinDiseases[randomIndex];
      
      // Generate a confidence score between 70% and 99%
      const confidence = 70 + Math.random() * 29;
      
      // Generate similar diseases with lower confidence
      const otherDiseases = skinDiseases
        .filter(d => d.id !== disease.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(d => ({
          name: d.name,
          confidence: 20 + Math.random() * 30 // between 20% and 50%
        }));
      
      const result: AnalysisResult = {
        disease,
        confidence,
        similarDiseases: otherDiseases,
        timestamp: new Date(),
      };
      
      resolve(result);
    }, processingTime);
  });
};
