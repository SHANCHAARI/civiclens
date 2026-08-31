import { AIProvider, AIAnalysisResult } from "./types";

const CATEGORIES = [
  {
    slug: "pothole",
    name: "Pothole",
    dept: "ROAD_INFRASTRUCTURE",
    severity: "HIGH" as const,
    observations: [
      "Road surface depression visible",
      "Potential hazard to two-wheelers",
      "Appears to be caused by water damage",
      "Located in traffic lane",
    ],
  },
  {
    slug: "road-damage",
    name: "Road Damage",
    dept: "ROAD_INFRASTRUCTURE",
    severity: "MEDIUM" as const,
    observations: [
      "Surface cracking visible",
      "Asphalt deterioration",
      "Width approximately 0.5m",
      "Partial lane obstruction",
    ],
  },
  {
    slug: "broken-streetlight",
    name: "Broken Streetlight",
    dept: "ELECTRICAL",
    severity: "MEDIUM" as const,
    observations: [
      "Streetlight fixture non-functional",
      "Pole appears structurally sound",
      "Affects nighttime visibility",
      "Near pedestrian crossing",
    ],
  },
  {
    slug: "garbage-waste",
    name: "Garbage / Waste",
    dept: "SANITATION",
    severity: "HIGH" as const,
    observations: [
      "Accumulated waste visible",
      "Multiple bags dumped",
      "Near residential area",
      "Potential health hazard",
    ],
  },
  {
    slug: "water-leakage",
    name: "Water Leakage",
    dept: "WATER_SUPPLY",
    severity: "HIGH" as const,
    observations: [
      "Active water leak visible",
      "Water pooling on surface",
      "Appears to be from underground pipe",
      "Road surface compromised",
    ],
  },
  {
    slug: "drainage-problem",
    name: "Drainage Problem",
    dept: "DRAINAGE",
    severity: "MEDIUM" as const,
    observations: [
      "Blocked drainage channel",
      "Water stagnation",
      "Debris accumulation",
      "Near residential area",
    ],
  },
  {
    slug: "damaged-sidewalk",
    name: "Damaged Sidewalk",
    dept: "ROAD_INFRASTRUCTURE",
    severity: "LOW" as const,
    observations: [
      "Broken sidewalk tiles",
      "Uneven walking surface",
      "Accessibility concern",
      "Partial obstruction of pedestrian path",
    ],
  },
  {
    slug: "fallen-tree",
    name: "Fallen Tree",
    dept: "PARKS_GARDENS",
    severity: "CRITICAL" as const,
    observations: [
      "Tree partially blocking road",
      "Root system exposed",
      "Branches across traffic lane",
      "Immediate clearance needed",
    ],
  },
  {
    slug: "traffic-signal-issue",
    name: "Traffic Signal Issue",
    dept: "TRAFFIC_MANAGEMENT",
    severity: "CRITICAL" as const,
    observations: [
      "Signal malfunctioning",
      "Light stuck on single color",
      "Intersection affected",
      "Safety concern for commuters",
    ],
  },
  {
    slug: "illegal-dumping",
    name: "Illegal Dumping",
    dept: "SANITATION",
    severity: "HIGH" as const,
    observations: [
      "Construction debris dumped",
      "Non-biodegradable waste",
      "Blocked waterway",
      "Environmental concern",
    ],
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomConfidence(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export class MockAIProvider implements AIProvider {
  async analyzeImage(_imageUrl: string): Promise<AIAnalysisResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    const category = pickRandom(CATEGORIES);

    const descriptions: Record<string, string> = {
      pothole: `Large road surface depression approximately ${Math.round(Math.random() * 80 + 30)}cm wide, presenting a potential hazard to vehicles and two-wheelers. The pothole appears to be caused by water damage to the road surface.`,
      "road-damage": `Visible road surface deterioration with cracking and asphalt loss. The damaged area spans approximately ${Math.round(Math.random() * 50 + 20)}cm, reducing effective lane width.`,
      "broken-streetlight": "Streetlight fixture appears non-functional. The pole is structurally sound but the lamp assembly shows signs of damage or electrical failure. Affects nighttime visibility in the area.",
      "garbage-waste": "Accumulated waste visible at the location. Multiple bags of uncollected garbage are creating an unsanitary condition. The waste appears to be domestic in nature.",
      "water-leakage": "Active water leak observed at street level. Water appears to be emerging from underground infrastructure, creating a puddle approximately 1 meter in diameter. Road surface integrity is compromised.",
      "drainage-problem": "Drainage channel appears blocked, causing water to pool on the road surface. Debris and sediment accumulation is restricting normal water flow.",
      "damaged-sidewalk": "Sidewalk tiles are broken and uneven, creating a tripping hazard. The damage spans approximately 2 meters of the pedestrian path.",
      "fallen-tree": "A tree has partially fallen across the road, obstructing one lane. Branches are spread across approximately 3 meters. Immediate clearance may be needed for traffic flow.",
      "traffic-signal-issue": "Traffic signal appears to be malfunctioning. The light is not cycling through its normal sequence, causing confusion at the intersection.",
      "illegal-dumping": "Construction and industrial waste has been illegally dumped at this location. The debris includes concrete fragments, plastic, and other non-biodegradable materials.",
    };

    return {
      category: category.name,
      categoryConfidence: randomConfidence(0.75, 0.98),
      severity: category.severity,
      severityConfidence: randomConfidence(0.7, 0.95),
      description: descriptions[category.slug] || `Detected issue categorized as ${category.name}. Further assessment may be required.`,
      observations: category.observations.slice(0, Math.floor(Math.random() * 2) + 2),
      suggestedDepartment: category.dept,
      reasoning: `Image analysis detected visual features consistent with ${category.name.toLowerCase()}. Severity assessed as ${category.severity.toLowerCase()} based on visible impact, location context, and safety risk indicators.`,
    };
  }
}

export function getAIProvider(): AIProvider {
  return new MockAIProvider();
}
