import { describe, it, expect } from 'vitest';
import {
  calculateRiskScore,
  getRiskLevel,
  getRiskLevelFromFactors,
  getRiskColor,
  getRiskTailwindClasses,
  getMatrixCellColor,
  getMatrixCellClass,
  getSeverityLabel,
  getLikelihoodLabel,
  RISK_COLORS,
  SEVERITY_SCALE,
  LIKELIHOOD_SCALE,
  RISK_LEVEL_INFO,
} from './riskCalculations';

describe('calculateRiskScore', () => {
  it('calculates risk score as severity * likelihood', () => {
    expect(calculateRiskScore(1, 1)).toBe(1);
    expect(calculateRiskScore(3, 4)).toBe(12);
    expect(calculateRiskScore(5, 5)).toBe(25);
    expect(calculateRiskScore(2, 3)).toBe(6);
  });

  it('handles boundary values correctly', () => {
    expect(calculateRiskScore(1, 5)).toBe(5);
    expect(calculateRiskScore(5, 1)).toBe(5);
    expect(calculateRiskScore(4, 4)).toBe(16);
  });
});

describe('getRiskLevel', () => {
  it('returns "low" for scores 1-4', () => {
    expect(getRiskLevel(1)).toBe('low');
    expect(getRiskLevel(2)).toBe('low');
    expect(getRiskLevel(3)).toBe('low');
    expect(getRiskLevel(4)).toBe('low');
  });

  it('returns "moderate" for scores 5-9', () => {
    expect(getRiskLevel(5)).toBe('moderate');
    expect(getRiskLevel(6)).toBe('moderate');
    expect(getRiskLevel(7)).toBe('moderate');
    expect(getRiskLevel(8)).toBe('moderate');
    expect(getRiskLevel(9)).toBe('moderate');
  });

  it('returns "high" for scores 10-16', () => {
    expect(getRiskLevel(10)).toBe('high');
    expect(getRiskLevel(12)).toBe('high');
    expect(getRiskLevel(15)).toBe('high');
    expect(getRiskLevel(16)).toBe('high');
  });

  it('returns "critical" for scores 17-25', () => {
    expect(getRiskLevel(17)).toBe('critical');
    expect(getRiskLevel(20)).toBe('critical');
    expect(getRiskLevel(25)).toBe('critical');
  });
});

describe('getRiskLevelFromFactors', () => {
  it('combines calculateRiskScore and getRiskLevel', () => {
    expect(getRiskLevelFromFactors(1, 1)).toBe('low');      // score: 1
    expect(getRiskLevelFromFactors(2, 2)).toBe('low');      // score: 4
    expect(getRiskLevelFromFactors(2, 3)).toBe('moderate'); // score: 6
    expect(getRiskLevelFromFactors(3, 3)).toBe('moderate'); // score: 9
    expect(getRiskLevelFromFactors(4, 3)).toBe('high');     // score: 12
    expect(getRiskLevelFromFactors(4, 4)).toBe('high');     // score: 16
    expect(getRiskLevelFromFactors(5, 4)).toBe('critical'); // score: 20
    expect(getRiskLevelFromFactors(5, 5)).toBe('critical'); // score: 25
  });
});

describe('getRiskColor', () => {
  it('returns correct hex colors for each level', () => {
    expect(getRiskColor('low')).toBe('#22c55e');
    expect(getRiskColor('moderate')).toBe('#eab308');
    expect(getRiskColor('high')).toBe('#f97316');
    expect(getRiskColor('critical')).toBe('#ef4444');
  });

  it('returns default color for invalid level', () => {
    expect(getRiskColor('invalid')).toBe('#eab308'); // defaults to moderate
    expect(getRiskColor(undefined)).toBe('#eab308');
  });
});

describe('getRiskTailwindClasses', () => {
  it('returns Tailwind classes for each level', () => {
    expect(getRiskTailwindClasses('low').bg).toBe('bg-green-500');
    expect(getRiskTailwindClasses('moderate').bg).toBe('bg-yellow-500');
    expect(getRiskTailwindClasses('high').bg).toBe('bg-orange-500');
    expect(getRiskTailwindClasses('critical').bg).toBe('bg-red-500');
  });

  it('returns default classes for invalid level', () => {
    expect(getRiskTailwindClasses('invalid').bg).toBe('bg-yellow-500');
  });
});

describe('getMatrixCellColor', () => {
  it('returns correct color for matrix positions', () => {
    // Low risk positions
    expect(getMatrixCellColor(1, 1)).toBe('#22c55e'); // score: 1
    expect(getMatrixCellColor(2, 2)).toBe('#22c55e'); // score: 4

    // Moderate risk positions
    expect(getMatrixCellColor(1, 5)).toBe('#eab308'); // score: 5
    expect(getMatrixCellColor(3, 3)).toBe('#eab308'); // score: 9

    // High risk positions
    expect(getMatrixCellColor(2, 5)).toBe('#f97316'); // score: 10
    expect(getMatrixCellColor(4, 4)).toBe('#f97316'); // score: 16

    // Critical risk positions
    expect(getMatrixCellColor(5, 4)).toBe('#ef4444'); // score: 20
    expect(getMatrixCellColor(5, 5)).toBe('#ef4444'); // score: 25
  });
});

describe('getMatrixCellClass', () => {
  it('returns correct Tailwind class for matrix positions', () => {
    expect(getMatrixCellClass(1, 1)).toBe('bg-green-500');
    expect(getMatrixCellClass(3, 3)).toBe('bg-yellow-500');
    expect(getMatrixCellClass(4, 4)).toBe('bg-orange-500');
    expect(getMatrixCellClass(5, 5)).toBe('bg-red-500');
  });
});

describe('getSeverityLabel', () => {
  it('returns correct labels for each rating', () => {
    expect(getSeverityLabel(1)).toBe('Negligible');
    expect(getSeverityLabel(2)).toBe('Minor');
    expect(getSeverityLabel(3)).toBe('Moderate');
    expect(getSeverityLabel(4)).toBe('Major');
    expect(getSeverityLabel(5)).toBe('Catastrophic');
  });

  it('returns "Unknown" for invalid ratings', () => {
    expect(getSeverityLabel(0)).toBe('Unknown');
    expect(getSeverityLabel(6)).toBe('Unknown');
    expect(getSeverityLabel(undefined)).toBe('Unknown');
  });
});

describe('getLikelihoodLabel', () => {
  it('returns correct labels for each rating', () => {
    expect(getLikelihoodLabel(1)).toBe('Rare');
    expect(getLikelihoodLabel(2)).toBe('Unlikely');
    expect(getLikelihoodLabel(3)).toBe('Possible');
    expect(getLikelihoodLabel(4)).toBe('Likely');
    expect(getLikelihoodLabel(5)).toBe('Almost Certain');
  });

  it('returns "Unknown" for invalid ratings', () => {
    expect(getLikelihoodLabel(0)).toBe('Unknown');
    expect(getLikelihoodLabel(6)).toBe('Unknown');
    expect(getLikelihoodLabel(undefined)).toBe('Unknown');
  });
});

describe('RISK_COLORS constant', () => {
  it('contains all four risk levels', () => {
    expect(RISK_COLORS).toHaveProperty('low');
    expect(RISK_COLORS).toHaveProperty('moderate');
    expect(RISK_COLORS).toHaveProperty('high');
    expect(RISK_COLORS).toHaveProperty('critical');
  });

  it('each level has required color properties', () => {
    ['low', 'moderate', 'high', 'critical'].forEach((level) => {
      expect(RISK_COLORS[level]).toHaveProperty('bg');
      expect(RISK_COLORS[level]).toHaveProperty('bgLight');
      expect(RISK_COLORS[level]).toHaveProperty('text');
      expect(RISK_COLORS[level]).toHaveProperty('tailwind');
    });
  });
});

describe('SEVERITY_SCALE constant', () => {
  it('contains 5 severity levels', () => {
    expect(SEVERITY_SCALE).toHaveLength(5);
  });

  it('has ratings 1-5', () => {
    const ratings = SEVERITY_SCALE.map((s) => s.rating);
    expect(ratings).toEqual([1, 2, 3, 4, 5]);
  });

  it('each level has label and description', () => {
    SEVERITY_SCALE.forEach((level) => {
      expect(level).toHaveProperty('label');
      expect(level).toHaveProperty('description');
      expect(typeof level.label).toBe('string');
      expect(typeof level.description).toBe('string');
    });
  });
});

describe('LIKELIHOOD_SCALE constant', () => {
  it('contains 5 likelihood levels', () => {
    expect(LIKELIHOOD_SCALE).toHaveLength(5);
  });

  it('has ratings 1-5', () => {
    const ratings = LIKELIHOOD_SCALE.map((l) => l.rating);
    expect(ratings).toEqual([1, 2, 3, 4, 5]);
  });

  it('each level has label and description', () => {
    LIKELIHOOD_SCALE.forEach((level) => {
      expect(level).toHaveProperty('label');
      expect(level).toHaveProperty('description');
    });
  });
});

describe('RISK_LEVEL_INFO constant', () => {
  it('contains all risk levels', () => {
    expect(RISK_LEVEL_INFO).toHaveProperty('low');
    expect(RISK_LEVEL_INFO).toHaveProperty('moderate');
    expect(RISK_LEVEL_INFO).toHaveProperty('high');
    expect(RISK_LEVEL_INFO).toHaveProperty('critical');
  });

  it('each level has label, range, and description', () => {
    ['low', 'moderate', 'high', 'critical'].forEach((level) => {
      expect(RISK_LEVEL_INFO[level]).toHaveProperty('label');
      expect(RISK_LEVEL_INFO[level]).toHaveProperty('range');
      expect(RISK_LEVEL_INFO[level]).toHaveProperty('description');
    });
  });
});

// Edge case and integration tests
describe('Risk Matrix Integration', () => {
  it('all 25 matrix cells have valid colors', () => {
    for (let severity = 1; severity <= 5; severity++) {
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        const color = getMatrixCellColor(severity, likelihood);
        expect(['#22c55e', '#eab308', '#f97316', '#ef4444']).toContain(color);
      }
    }
  });

  it('risk levels are correctly distributed across matrix', () => {
    const levelCounts = { low: 0, moderate: 0, high: 0, critical: 0 };

    for (let severity = 1; severity <= 5; severity++) {
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        const level = getRiskLevelFromFactors(severity, likelihood);
        levelCounts[level]++;
      }
    }

    // Verify distribution matches expected counts (5x5 matrix = 25 cells)
    // Low (1-4): 8 cells, Moderate (5-9): 7 cells, High (10-16): 7 cells, Critical (17-25): 3 cells
    expect(levelCounts.low).toBe(8);
    expect(levelCounts.moderate).toBe(7);
    expect(levelCounts.high).toBe(7);
    expect(levelCounts.critical).toBe(3);
  });
});
