export const EXPERTISE_LEVELS = [
  { value: 'novice', label: 'Novice', description: 'First time doing this task' },
  { value: 'general', label: 'General', description: 'Some basic experience' },
  { value: 'experienced', label: 'Experienced', description: 'Done this many times' },
  { value: 'professional', label: 'Professional', description: 'Trained/certified in this area' },
];

export const ENVIRONMENTS = [
  { value: 'home', label: 'Home / Residential' },
  { value: 'garage', label: 'Garage / Workshop' },
  { value: 'outdoor', label: 'Outdoor / Yard' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'commercial', label: 'Commercial / Job Site' },
  { value: 'remote', label: 'Remote / Wilderness' },
];

export const EXAMPLE_TASKS = [
  "Changing my car's brake pads in the driveway",
  "Deep frying a turkey for Thanksgiving",
  "Cutting down a dead tree in my backyard with a chainsaw",
  "Cleaning the gutters using an extension ladder",
  "Pressure washing my deck and siding",
  "Replacing an electrical outlet in my kitchen",
  "Using muriatic acid to clean concrete stains",
];

export const HAZARD_CATEGORIES = {
  thermal: { label: 'Thermal', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  chemical: { label: 'Chemical', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  mechanical: { label: 'Mechanical', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  electrical: { label: 'Electrical', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  biological: { label: 'Biological', color: 'text-green-600', bgColor: 'bg-green-100' },
  ergonomic: { label: 'Ergonomic', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  environmental: { label: 'Environmental', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  psychological: { label: 'Psychological', color: 'text-pink-600', bgColor: 'bg-pink-100' },
};

export const RISK_LEVELS = {
  low: { label: 'Low', color: 'text-green-700', bgColor: 'bg-green-500', lightBg: 'bg-green-100' },
  moderate: { label: 'Moderate', color: 'text-yellow-700', bgColor: 'bg-yellow-500', lightBg: 'bg-yellow-100' },
  high: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-500', lightBg: 'bg-orange-100' },
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-500', lightBg: 'bg-red-100' },
};

export const SEVERITY_LABELS = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
export const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

export const CONTROL_HIERARCHY = [
  { key: 'elimination', label: 'Elimination', description: 'Remove the hazard entirely', priority: 1 },
  { key: 'substitution', label: 'Substitution', description: 'Use safer alternatives', priority: 2 },
  { key: 'engineering', label: 'Engineering Controls', description: 'Physical barriers and modifications', priority: 3 },
  { key: 'administrative', label: 'Administrative Controls', description: 'Procedures and training', priority: 4 },
  { key: 'ppe', label: 'PPE', description: 'Personal protective equipment', priority: 5 },
];
