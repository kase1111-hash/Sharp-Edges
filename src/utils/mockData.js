export const MOCK_ASSESSMENT = {
  taskSummary: "Cutting down a dead tree using a chainsaw in a residential backyard setting, requiring proper safety equipment and technique to manage falling hazards and equipment risks.",
  parsedContext: {
    actions: ["cutting", "felling", "sectioning", "clearing"],
    materials: ["dead wood", "chainsaw fuel", "bar oil"],
    tools: ["chainsaw", "safety chaps", "helmet", "gloves", "safety glasses"],
    environmentFactors: ["uneven ground", "nearby structures", "overhead power lines", "wind conditions"],
  },
  hazards: [
    {
      category: "mechanical",
      description: "Chainsaw kickback",
      mechanism: "Sudden upward rotation of the guide bar when the chain nose contacts an object, potentially causing severe lacerations or loss of limb control",
    },
    {
      category: "mechanical",
      description: "Falling tree or branches",
      mechanism: "Unpredictable fall direction due to dead wood brittleness, wind, or improper notch cuts causing crush injuries",
    },
    {
      category: "ergonomic",
      description: "Chainsaw vibration and weight",
      mechanism: "Extended use causing hand-arm vibration syndrome, fatigue, and reduced reaction time",
    },
    {
      category: "thermal",
      description: "Hot chainsaw components",
      mechanism: "Contact burns from muffler, chain brake, or overheated bar during or after operation",
    },
    {
      category: "environmental",
      description: "Uneven terrain",
      mechanism: "Slips, trips, and falls while operating equipment or retreating from falling tree",
    },
  ],
  riskAssessment: {
    severity: 4,
    likelihood: 3,
    overallLevel: "high",
    rationale: "Tree felling involves multiple serious hazards with potential for major injury. The combination of powerful cutting equipment, unpredictable falling mass, and outdoor variables creates significant risk even for experienced operators.",
  },
  controls: {
    elimination: [
      "Hire a professional arborist for large or complex trees",
      "Consider leaving standing dead wood as wildlife habitat if safe",
    ],
    substitution: [
      "Use a smaller electric chainsaw for manageable sections",
      "Rent a lift or bucket truck instead of climbing",
    ],
    engineering: [
      "Use felling wedges to control fall direction",
      "Install guide ropes to direct the fall",
      "Clear two escape routes at 45-degree angles from fall direction",
    ],
    administrative: [
      "Check weather conditions - avoid windy days",
      "Notify neighbors and establish a danger zone",
      "Have a spotter who can see the entire tree",
      "Plan the cut sequence before starting",
      "Take regular breaks to prevent fatigue",
    ],
    ppe: [
      "Chainsaw chaps or pants (cut-resistant)",
      "Safety helmet with face screen and ear protection",
      "Steel-toed boots with ankle support",
      "Cut-resistant gloves",
      "High-visibility vest if working near roads",
    ],
  },
  emergencyActions: [
    "Stop chainsaw immediately and set brake",
    "Call 911 for serious injuries",
    "Apply direct pressure to any bleeding wounds",
    "Do not move victim if spinal injury suspected",
    "Have first aid kit accessible at work site",
  ],
  preTaskChecklist: [
    "Inspect chainsaw chain tension and sharpness",
    "Check bar oil and fuel levels",
    "Test chain brake function",
    "Verify all PPE is in good condition",
    "Assess tree lean and plan fall direction",
    "Clear escape routes of debris",
    "Confirm no power lines within 2x tree height",
    "Brief any helpers on signals and safe positions",
  ],
  ethicalNote: "Tree removal impacts local ecosystems. Consider consulting an arborist to confirm the tree cannot be saved and to assess any protected species or nesting birds before proceeding.",
  additionalConsiderations: "Dead trees can be more hazardous than live ones due to unpredictable branch brittleness and internal decay that may not be visible. Consider having the tree professionally assessed if you're unsure of its structural integrity.",
};
