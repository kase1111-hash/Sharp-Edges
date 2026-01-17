import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiskLevelBadge from './RiskLevelBadge';

describe('RiskLevelBadge', () => {
  it('renders with provided level and score', () => {
    render(<RiskLevelBadge level="high" score={12} />);

    expect(screen.getByText('High Risk')).toBeInTheDocument();
    expect(screen.getByText('(Score: 12)')).toBeInTheDocument();
  });

  it('computes level and score from severity and likelihood', () => {
    render(<RiskLevelBadge severity={4} likelihood={3} />);

    expect(screen.getByText('High Risk')).toBeInTheDocument();
    expect(screen.getByText('(Score: 12)')).toBeInTheDocument();
  });

  it('renders low risk correctly', () => {
    render(<RiskLevelBadge level="low" score={2} />);

    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('renders moderate risk correctly', () => {
    render(<RiskLevelBadge level="moderate" score={6} />);

    expect(screen.getByText('Moderate Risk')).toBeInTheDocument();
  });

  it('renders critical risk correctly', () => {
    render(<RiskLevelBadge level="critical" score={20} />);

    expect(screen.getByText('Critical Risk')).toBeInTheDocument();
  });

  it('hides score when not provided', () => {
    render(<RiskLevelBadge level="low" />);

    expect(screen.getByText('Low Risk')).toBeInTheDocument();
    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
  });

  it('defaults to moderate when no level provided', () => {
    render(<RiskLevelBadge />);

    expect(screen.getByText('Moderate Risk')).toBeInTheDocument();
  });
});
