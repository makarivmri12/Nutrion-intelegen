import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Helper to start the server
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: !!ai });
  });

  // Intelligent Nutrition Analysis Endpoint
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in environment variables. Please check Settings > Secrets.",
        });
      }

      const { patientProfile, foodLogs, totals, targets } = req.body;

      const prompt = `
You are an expert Clinical Dietitian & Nutrition Intelligence AI. Analyze the following patient data and food logs to generate a comprehensive, highly professional Clinical Nutrition Diagnostic Report.

PATIENT PROFILE:
- Name/ID: ${patientProfile.name || "Anonymous Patient"}
- Age: ${patientProfile.age || "N/A"} years
- Gender: ${patientProfile.gender || "N/A"}
- Height: ${patientProfile.height || "N/A"} cm
- Weight: ${patientProfile.weight || "N/A"} kg
- BMI: ${patientProfile.bmi || "N/A"} (${patientProfile.bmiCategory || "N/A"})
- BMR: ${patientProfile.bmr || "N/A"} kcal/day
- Activity Level: ${patientProfile.activityLevel || "N/A"}
- Medical Conditions / Goals: ${patientProfile.conditions || "None specified"}

DIETARY FOOD LOGS (SPREADSHEET DATA):
${JSON.stringify(foodLogs, null, 2)}

DAILY CONSUMED TOTALS VS. DAILY REQUISITE TARGETS:
- Calories Consumed: ${totals.calories.toFixed(1)} kcal (Target: ${targets.calories} kcal)
- Protein Consumed: ${totals.protein.toFixed(1)} g (Target: ${targets.protein} g)
- Carbohydrates Consumed: ${totals.carbs.toFixed(1)} g (Target: ${targets.carbs} g)
- Fats Consumed: ${totals.fat.toFixed(1)} g (Target: ${targets.fat} g)
- Sodium Consumed: ${totals.sodium.toFixed(1)} mg (Target: ${targets.sodium} mg)
- Fiber Consumed: ${totals.fiber.toFixed(1)} g (Target: ${targets.fiber} g)
- Iron Consumed: ${totals.iron.toFixed(1)} mg (Target: ${targets.iron} mg)
- Calcium Consumed: ${totals.calcium.toFixed(1)} mg (Target: ${targets.calcium} mg)
- Vitamin C Consumed: ${totals.vitaminC.toFixed(1)} mg (Target: ${targets.vitaminC} mg)

Please generate a professional, structured clinical report in Markdown format. The report MUST include:
1. **Clinical Diagnostic Summary**: An elegant summary of the patient's general nutritional and physiological state based on BMI, BMR, and total intake.
2. **Detailed Macronutrient & Micronutrient Risk Analysis**: Identify which nutrients are deficient, excess, or optimal. Explain the physiological risks for this specific patient (e.g., impact of high sodium on blood pressure, or low calcium on bone density).
3. **Food Substitutions & Immediate Actions**: Give highly specific ingredient substitutions (e.g., swap white rice for quinoa, reduce salt with herbs, or increase chia seeds for omega-3 and fiber).
4. **Actionable 1-Day Tailored Menu Plan**: Craft an ideal, nutrient-dense breakfast, lunch, dinner, and snack menu that perfectly hits their target requirements and accommodates their medical conditions.

Return your response strictly in Markdown format. Be highly scientific, encouraging, and detailed.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text;
      res.json({ report: text });
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      res.status(500).json({ error: error.message || "Internal server error during analysis." });
    }
  });

  // Integration of Vite development server middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Nutri-Intelligence Platform Server] running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Unhandled promise rejection during server startup:", error);
});
