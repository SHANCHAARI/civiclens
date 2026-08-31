import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Hyderabad center coordinates
const CENTER = { lat: 17.385, lng: 78.4867 };
const SPREAD = 0.08;

function randomCoord() {
  return {
    lat: CENTER.lat + (Math.random() - 0.5) * SPREAD * 2,
    lng: CENTER.lng + (Math.random() - 0.5) * SPREAD * 2,
  };
}

function randomDate(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
}

const CATEGORIES = [
  { name: "Pothole", slug: "pothole", icon: "circle-alert", description: "Road surface depression or hole" },
  { name: "Road Damage", slug: "road-damage", icon: "construction", description: "General road surface damage" },
  { name: "Broken Streetlight", slug: "broken-streetlight", icon: "lamp", description: "Non-functional street lighting" },
  { name: "Garbage / Waste", slug: "garbage-waste", icon: "trash-2", description: "Uncollected waste or garbage" },
  { name: "Water Leakage", slug: "water-leakage", icon: "droplets", description: "Water pipe leakage or burst" },
  { name: "Drainage Problem", slug: "drainage-problem", icon: "waves", description: "Blocked or damaged drainage" },
  { name: "Damaged Sidewalk", slug: "damaged-sidewalk", icon: "footprints", description: "Broken pedestrian pathways" },
  { name: "Fallen Tree", slug: "fallen-tree", icon: "tree-pine", description: "Fallen or damaged trees" },
  { name: "Traffic Signal Issue", slug: "traffic-signal-issue", icon: "traffic-cone", description: "Malfunctioning traffic signals" },
  { name: "Illegal Dumping", slug: "illegal-dumping", icon: "package-x", description: "Illegal waste dumping" },
  { name: "Public Infrastructure Damage", slug: "public-infrastructure-damage", icon: "building-2", description: "Damaged public infrastructure" },
  { name: "Other", slug: "other", icon: "help-circle", description: "Other civic issues" },
];

const DEPARTMENTS = [
  { name: "Road Infrastructure", description: "Roads, bridges, and surface infrastructure" },
  { name: "Electrical", description: "Streetlights, power lines, electrical infrastructure" },
  { name: "Sanitation", description: "Waste management, garbage collection, cleanliness" },
  { name: "Water Supply", description: "Water pipes, supply infrastructure, water quality" },
  { name: "Drainage", description: "Drainage systems, storm water, sewage" },
  { name: "Parks & Gardens", description: "Public parks, trees, green spaces" },
  { name: "Traffic Management", description: "Traffic signals, road markings, signage" },
  { name: "Building Services", description: "Public buildings, structures, facilities" },
];

const WARDS = [
  { name: "Ward 1 - Abids", zone: "Zone 1", lat: 17.395, lng: 78.475 },
  { name: "Ward 2 - Secunderabad", zone: "Zone 1", lat: 17.439, lng: 78.498 },
  { name: "Ward 3 - Ameerpet", zone: "Zone 2", lat: 17.413, lng: 78.448 },
  { name: "Ward 4 - Jubilee Hills", zone: "Zone 2", lat: 17.415, lng: 78.434 },
  { name: "Ward 5 - Madhapur", zone: "Zone 3", lat: 17.448, lng: 78.391 },
  { name: "Ward 6 - Kukatpally", zone: "Zone 3", lat: 17.484, lng: 78.408 },
  { name: "Ward 7 - Dilsukhnagar", zone: "Zone 4", lat: 17.368, lng: 78.525 },
  { name: "Ward 8 - LB Nagar", zone: "Zone 4", lat: 17.342, lng: 78.551 },
  { name: "Ward 9 - Miyapur", zone: "Zone 5", lat: 17.496, lng: 78.357 },
  { name: "Ward 10 - Chandanagar", zone: "Zone 5", lat: 17.509, lng: 78.323 },
];

const ISSUE_TITLES: Record<string, string[]> = {
  pothole: [
    "Large pothole on main road",
    "Deep pothole near bus stop",
    "Multiple potholes on highway stretch",
    "Pothole causing traffic hazard",
    "Dangerous pothole near school zone",
  ],
  "road-damage": [
    "Cracked road surface",
    "Asphalt peeling on main road",
    "Road surface damage near junction",
    "Uneven road causing vehicle damage",
    "Road subsidence near drainage",
  ],
  "broken-streetlight": [
    "Streetlight not working for 3 days",
    "Multiple streetlights off on stretch",
    "Broken streetlight near park",
    "Flickering streetlight at intersection",
    "Streetlight pole bent, not functional",
  ],
  "garbage-waste": [
    "Garbage pile uncollected for a week",
    "Overflowing community dustbin",
    "Waste dumped on roadside",
    "Medical waste near residential area",
    "Construction debris on footpath",
  ],
  "water-leakage": [
    "Water pipe burst on road",
    "Leaking water main near junction",
    "Underground pipe leak causing road damage",
    "Water gushing from manhole cover",
    "Persistent leak wasting water",
  ],
  "drainage-problem": [
    "Blocked storm drain causing flooding",
    "Overflowing drainage near market",
    "Clogged drain attracting mosquitoes",
    "Damaged drain cover missing",
    "Sewage overflow on street",
  ],
  "damaged-sidewalk": [
    "Broken sidewalk tiles dangerous to pedestrians",
    "Uneven footpath near hospital",
    "Sidewalk blocked by debris",
    "Missing manhole cover on footpath",
    "Cracked pavement near school",
  ],
  "fallen-tree": [
    "Large tree fallen across road",
    "Dead tree leaning dangerously",
    "Tree branch blocking traffic lane",
    "Fallen tree on parked vehicles",
    "Uprooted tree after storm",
  ],
  "traffic-signal-issue": [
    "Traffic signal stuck on red",
    "Signal timing seems off at peak hours",
    "Signal not working at busy intersection",
    "Pedestrian signal always red",
    "Traffic light damaged after accident",
  ],
  "illegal-dumping": [
    "Construction waste dumped illegally",
    "Industrial waste near water body",
    "Electronics dumped in open area",
    "Building material blocking drain",
    "Waste dumping near school boundary",
  ],
  "public-infrastructure-damage": [
    "Damaged bus shelter",
    "Broken public water tap",
    "Damaged community notice board",
    "Bent railing near flyover",
    "Broken public bench in park",
  ],
  other: [
    "Stray animals blocking road",
    "Unauthorized construction activity",
    "Noise pollution from construction",
    "Open manhole without cover",
    "Damaged road marking paint",
  ],
};

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = [
  "REPORTED", "AI_ANALYZING", "VERIFIED", "ASSIGNED",
  "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED",
  "CITIZEN_VERIFICATION", "REOPENED",
];

const PRIORITY_WEIGHTS: Record<string, number> = {
  REPORTED: 10,
  AI_ANALYZING: 20,
  VERIFIED: 30,
  ASSIGNED: 50,
  ACKNOWLEDGED: 55,
  IN_PROGRESS: 65,
  RESOLVED: 90,
  CLOSED: 95,
  CITIZEN_VERIFICATION: 80,
  REOPENED: 40,
};

async function main() {
  console.log("🌱 Seeding CivicLens database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.citizenVerification.deleteMany();
  await prisma.supportingReport.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issueStatusHistory.deleteMany();
  await prisma.issueEvidence.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.department.deleteMany();
  await prisma.issueCategory.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const password = await bcrypt.hash("demo123", 10);

  const citizen = await prisma.user.create({
    data: { name: "Priya Sharma", email: "citizen@demo.com", password, role: "CITIZEN" },
  });
  const authority = await prisma.user.create({
    data: { name: "Rajesh Kumar", email: "authority@demo.com", password, role: "AUTHORITY" },
  });
  const admin = await prisma.user.create({
    data: { name: "Admin User", email: "admin@demo.com", password, role: "ADMIN" },
  });

  // Additional citizens
  const extraCitizens = [];
  for (let i = 0; i < 8; i++) {
    const c = await prisma.user.create({
      data: {
        name: `Citizen ${String.fromCharCode(65 + i)}`,
        email: `citizen${i + 1}@demo.com`,
        password,
        role: "CITIZEN",
      },
    });
    extraCitizens.push(c);
  }

  console.log("✅ Users created");

  // Create departments
  const departments = [];
  for (const dept of DEPARTMENTS) {
    const d = await prisma.department.create({ data: dept });
    departments.push(d);
  }
  console.log("✅ Departments created");

  // Create wards
  const wards = [];
  for (const ward of WARDS) {
    const w = await prisma.ward.create({
      data: {
        name: ward.name,
        zone: ward.zone,
        latitude: ward.lat,
        longitude: ward.lng,
      },
    });
    wards.push(w);
  }
  console.log("✅ Wards created");

  // Create categories
  const categories = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = await prisma.issueCategory.create({
      data: { ...CATEGORIES[i], sortOrder: i },
    });
    categories.push(c);
  }
  console.log("✅ Categories created");

  // Create 120 issues
  const allUsers = [citizen, ...extraCitizens];
  const deptMap: Record<string, string> = {
    pothole: departments[0].id,
    "road-damage": departments[0].id,
    "broken-streetlight": departments[1].id,
    "garbage-waste": departments[2].id,
    "water-leakage": departments[3].id,
    "drainage-problem": departments[4].id,
    "damaged-sidewalk": departments[0].id,
    "fallen-tree": departments[5].id,
    "traffic-signal-issue": departments[6].id,
    "illegal-dumping": departments[2].id,
    "public-infrastructure-damage": departments[7].id,
    other: departments[0].id,
  };

  const issueCount = 120;
  for (let i = 0; i < issueCount; i++) {
    const catIndex = Math.floor(Math.random() * CATEGORIES.length);
    const cat = CATEGORIES[catIndex];
    const titles = ISSUE_TITLES[cat.slug] || ["Reported issue"];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const coord = randomCoord();
    const ward = wards[Math.floor(Math.random() * wards.length)];
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];
    const daysBack = Math.floor(Math.random() * 60) + 1;
    const createdAt = randomDate(daysBack);
    const reportCount = Math.floor(Math.random() * 20) + 1;
    const priorityBase = PRIORITY_WEIGHTS[status] || 50;
    const priorityScore = Math.min(
      100,
      priorityBase + (Math.random() * 20 - 10) + (severity === "CRITICAL" ? 15 : severity === "HIGH" ? 10 : severity === "MEDIUM" ? 5 : 0)
    );

    const descriptions = [
      `Issue reported near ${ward.name}. ${title.toLowerCase()}. This needs immediate attention from the authorities.`,
      `Observed during evening commute. The ${cat.name.toLowerCase()} issue has been persistent for several days.`,
      `Safety concern for commuters and pedestrians. The issue appears to be worsening over time.`,
      `Reported by multiple residents in the area. No action has been taken yet despite previous complaints.`,
      `Located on a busy road with heavy vehicular traffic. This poses a significant safety risk.`,
    ];

    const issue = await prisma.issue.create({
      data: {
        title: `${title} - ${ward.name.split(" - ")[1] || ward.name}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        categorySlug: cat.slug,
        severity,
        status,
        priorityScore: Math.round(priorityScore * 10) / 10,
        reportCount,
        latitude: coord.lat,
        longitude: coord.lng,
        address: `${Math.floor(Math.random() * 500) + 1}, Main Road, ${ward.name.split(" - ")[1] || "Hyderabad"}`,
        landmark: ["Near Bus Stop", "Opposite Park", "Near School", "At Junction", "Near Market"][
          Math.floor(Math.random() * 5)
        ],
        wardId: ward.id,
        authorId: user.id,
        departmentId: deptMap[cat.slug] || departments[0].id,
        assigneeId:
          status !== "REPORTED" && status !== "AI_ANALYZING" ? authority.id : null,
        aiConfidence: 0.7 + Math.random() * 0.28,
        aiCategory: cat.name,
        aiSeverity: severity,
        aiDescription: `AI-detected: ${cat.name.toLowerCase()} classified as ${severity.toLowerCase()} severity.`,
        aiObservations: JSON.stringify([
          "Visual evidence analyzed",
          "Issue detected in public area",
          `${severity} severity indicators found`,
        ]),
        aiReasoning: `Image analysis identified features consistent with ${cat.name.toLowerCase()}. Severity: ${severity.toLowerCase()}.`,
        aiSuggestedDept: departments.find((d) => d.id === deptMap[cat.slug])?.name || "General",
        aiAnalyzedAt: new Date(createdAt.getTime() + 60000),
        isDemo: true,
        createdAt,
        updatedAt: new Date(),
      },
    });

    // Create status history
    const statusFlow = ["REPORTED", "AI_ANALYZING", "VERIFIED"];
    if (status !== "REPORTED" && status !== "AI_ANALYZING") {
      statusFlow.push("ASSIGNED");
      if (status !== "ASSIGNED") {
        statusFlow.push("ACKNOWLEDGED");
        if (status !== "ACKNOWLEDGED") {
          statusFlow.push("IN_PROGRESS");
          if (status === "RESOLVED" || status === "CLOSED" || status === "CITIZEN_VERIFICATION") {
            statusFlow.push("RESOLVED");
          }
        }
      }
    }

    // Only add statuses up to the current status
    const statusIndex = statusFlow.indexOf(status);
    const flowToRecord =
      statusIndex >= 0 ? statusFlow.slice(0, statusIndex + 1) : statusFlow;

    for (let s = 0; s < flowToRecord.length; s++) {
      await prisma.issueStatusHistory.create({
        data: {
          issueId: issue.id,
          changedById: s === 0 ? user.id : authority.id,
          fromStatus: s === 0 ? "" : flowToRecord[s - 1],
          toStatus: flowToRecord[s],
          note:
            s === 0
              ? "Issue reported by citizen"
              : `Status changed to ${flowToRecord[s].replace(/_/g, " ").toLowerCase()}`,
          createdAt: new Date(createdAt.getTime() + (s + 1) * 3600000),
        },
      });
    }
  }

  console.log(`✅ ${issueCount} issues created with status histories`);

  // Create some supporting reports
  const allIssues = await prisma.issue.findMany({ select: { id: true } });
  for (const issue of allIssues.slice(0, 30)) {
    const supporters = allUsers.slice(0, Math.floor(Math.random() * 5) + 1);
    for (const supporter of supporters) {
      try {
        await prisma.supportingReport.create({
          data: {
            issueId: issue.id,
            userId: supporter.id,
          },
        });
      } catch {
        // Skip duplicates
      }
    }
  }

  // Create some comments
  const commentTexts = [
    "I see this issue every day. It's getting worse.",
    "Can someone from the department please look into this?",
    "This has been reported multiple times already.",
    "The issue is near a school - very dangerous for children.",
    "Thank you for reporting this. I've been wanting to report it too.",
    "I can confirm this issue exists. Walked past it today.",
    "This needs urgent attention before someone gets hurt.",
  ];

  for (const issue of allIssues.slice(0, 40)) {
    const numComments = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < numComments; c++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)];
      await prisma.comment.create({
        data: {
          issueId: issue.id,
          userId: user.id,
          body: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          createdAt: randomDate(30),
        },
      });
    }
  }

  console.log("✅ Supporting reports and comments created");

  // Create some notifications
  for (const user of allUsers.slice(0, 3)) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "STATUS_UPDATE",
        title: "Issue Update",
        body: "Your reported issue has been assigned to a department.",
        read: Math.random() > 0.5,
        createdAt: randomDate(7),
      },
    });
  }

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_COMPLETE",
      entityType: "SYSTEM",
      entityId: "system",
      metadata: `Seeded ${issueCount} issues, ${allUsers.length + 3} users, ${departments.length} departments`,
    },
  });

  console.log("✅ Notifications and audit logs created");
  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Demo Accounts:");
  console.log("   Citizen:  citizen@demo.com  / demo123");
  console.log("   Authority: authority@demo.com / demo123");
  console.log("   Admin:    admin@demo.com    / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
