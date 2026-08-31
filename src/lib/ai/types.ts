export interface AIAnalysisResult {
  category: string;
  categoryConfidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  severityConfidence: number;
  description: string;
  observations: string[];
  suggestedDepartment: string;
  reasoning: string;
}

export interface AIProvider {
  analyzeImage(imageUrl: string): Promise<AIAnalysisResult>;
}

export type { AIAnalysisResult as AnalysisResult };
