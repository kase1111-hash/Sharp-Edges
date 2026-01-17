/**
 * Risk Calculation Utilities
 * Implements the 5x5 risk matrix scoring system
 */

/**
 * Calculate risk score from severity and likelihood
 * @param {number} severity - Severity rating (1-5)
 * @param {number} likelihood - Likelihood rating (1-5)
 * @returns {number} Risk score (1-25)
 */
export const calculateRiskScore = (severity, likelihood) => {
  return severity * likelihood;
};

/**
 * Determine risk level from score
 * @param {number} score - Risk score (1-25)
 * @returns {'low' | 'moderate' | 'high' | 'critical'} Risk level
 */
export const getRiskLevel = (score) => {
  if (score <= 4) return 'low';
  if (score <= 9) return 'moderate';
  if (score <= 16) return 'high';
  return 'critical';
};

/**
 * Get risk level from severity and likelihood directly
 * @param {number} severity - Severity rating (1-5)
 * @param {number} likelihood - Likelihood rating (1-5)
 * @returns {'low' | 'moderate' | 'high' | 'critical'} Risk level
 */
export const getRiskLevelFromFactors = (severity, likelihood) => {
  return getRiskLevel(calculateRiskScore(severity, likelihood));
};

/**
 * Risk level color configuration
 */
export const RISK_COLORS = {
  low: {
    bg: '#22c55e',        // green-500
    bgLight: '#dcfce7',   // green-100
    text: '#15803d',      // green-700
    tailwind: {
      bg: 'bg-green-500',
      bgLight: 'bg-green-100',
      text: 'text-green-700',
    },
  },
  moderate: {
    bg: '#eab308',        // yellow-500
    bgLight: '#fef9c3',   // yellow-100
    text: '#a16207',      // yellow-700
    tailwind: {
      bg: 'bg-yellow-500',
      bgLight: 'bg-yellow-100',
      text: 'text-yellow-700',
    },
  },
  high: {
    bg: '#f97316',        // orange-500
    bgLight: '#ffedd5',   // orange-100
    text: '#c2410c',      // orange-700
    tailwind: {
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-100',
      text: 'text-orange-700',
    },
  },
  critical: {
    bg: '#ef4444',        // red-500
    bgLight: '#fee2e2',   // red-100
    text: '#b91c1c',      // red-700
    tailwind: {
      bg: 'bg-red-500',
      bgLight: 'bg-red-100',
      text: 'text-red-700',
    },
  },
};

/**
 * Get color for risk level
 * @param {'low' | 'moderate' | 'high' | 'critical'} level - Risk level
 * @returns {string} Hex color code
 */
export const getRiskColor = (level) => {
  return RISK_COLORS[level]?.bg || RISK_COLORS.moderate.bg;
};

/**
 * Get Tailwind classes for risk level
 * @param {'low' | 'moderate' | 'high' | 'critical'} level - Risk level
 * @returns {object} Tailwind class configuration
 */
export const getRiskTailwindClasses = (level) => {
  return RISK_COLORS[level]?.tailwind || RISK_COLORS.moderate.tailwind;
};

/**
 * Get cell color for matrix position
 * @param {number} severity - Severity rating (1-5)
 * @param {number} likelihood - Likelihood rating (1-5)
 * @returns {string} Hex color code
 */
export const getMatrixCellColor = (severity, likelihood) => {
  const level = getRiskLevelFromFactors(severity, likelihood);
  return getRiskColor(level);
};

/**
 * Get Tailwind background class for matrix cell
 * @param {number} severity - Severity rating (1-5)
 * @param {number} likelihood - Likelihood rating (1-5)
 * @returns {string} Tailwind background class
 */
export const getMatrixCellClass = (severity, likelihood) => {
  const level = getRiskLevelFromFactors(severity, likelihood);
  return getRiskTailwindClasses(level).bg;
};

/**
 * Severity scale definitions
 */
export const SEVERITY_SCALE = [
  { rating: 1, label: 'Negligible', description: 'Minor discomfort, no treatment needed' },
  { rating: 2, label: 'Minor', description: 'First aid treatment required' },
  { rating: 3, label: 'Moderate', description: 'Medical treatment required' },
  { rating: 4, label: 'Major', description: 'Serious injury, hospitalization' },
  { rating: 5, label: 'Catastrophic', description: 'Fatality or permanent disability' },
];

/**
 * Likelihood scale definitions
 */
export const LIKELIHOOD_SCALE = [
  { rating: 1, label: 'Rare', description: 'Highly unlikely to occur' },
  { rating: 2, label: 'Unlikely', description: 'Could occur but not expected' },
  { rating: 3, label: 'Possible', description: 'May occur occasionally' },
  { rating: 4, label: 'Likely', description: 'Will probably occur' },
  { rating: 5, label: 'Almost Certain', description: 'Expected to occur' },
];

/**
 * Risk level definitions
 */
export const RISK_LEVEL_INFO = {
  low: {
    label: 'Low',
    range: '1-4',
    description: 'Acceptable risk with standard precautions',
  },
  moderate: {
    label: 'Moderate',
    range: '5-9',
    description: 'Requires additional controls and awareness',
  },
  high: {
    label: 'High',
    range: '10-16',
    description: 'Significant risk requiring robust controls',
  },
  critical: {
    label: 'Critical',
    range: '17-25',
    description: 'Unacceptable risk without major controls or elimination',
  },
};

/**
 * Get severity label by rating
 * @param {number} rating - Severity rating (1-5)
 * @returns {string} Severity label
 */
export const getSeverityLabel = (rating) => {
  return SEVERITY_SCALE.find((s) => s.rating === rating)?.label || 'Unknown';
};

/**
 * Get likelihood label by rating
 * @param {number} rating - Likelihood rating (1-5)
 * @returns {string} Likelihood label
 */
export const getLikelihoodLabel = (rating) => {
  return LIKELIHOOD_SCALE.find((l) => l.rating === rating)?.label || 'Unknown';
};
