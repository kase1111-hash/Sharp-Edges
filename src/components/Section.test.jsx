import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Section from './Section';
import { AlertTriangle } from 'lucide-react';

describe('Section', () => {
  it('renders title and children when open by default', () => {
    render(
      <Section title="Test Section">
        <p>Section content</p>
      </Section>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    render(
      <Section title="Test Section" icon={AlertTriangle}>
        <p>Content</p>
      </Section>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('hides content when defaultOpen is false', () => {
    render(
      <Section title="Test Section" defaultOpen={false}>
        <p>Hidden content</p>
      </Section>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('toggles content visibility on click', () => {
    render(
      <Section title="Test Section">
        <p>Toggle content</p>
      </Section>
    );

    // Initially visible
    expect(screen.getByText('Toggle content')).toBeInTheDocument();

    // Click to close
    fireEvent.click(screen.getByText('Test Section'));
    expect(screen.queryByText('Toggle content')).not.toBeInTheDocument();

    // Click to open again
    fireEvent.click(screen.getByText('Test Section'));
    expect(screen.getByText('Toggle content')).toBeInTheDocument();
  });

  it('button is keyboard accessible', () => {
    render(
      <Section title="Test Section">
        <p>Content</p>
      </Section>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
