import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RiskAssessmentTool from './RiskAssessmentTool';
import { MOCK_ASSESSMENT } from '../utils/mockData';
import { ApiError } from '../services/api';

// Mock analyzeTask at the service level — the hook calls through naturally
vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    analyzeTask: vi.fn(),
  };
});

import { analyzeTask } from '../services/api';

function fillAndSubmit(task = 'Cut a tree with chainsaw') {
  const textarea = screen.getByLabelText(/what task are you planning/i);
  fireEvent.change(textarea, { target: { value: task } });
  fireEvent.click(screen.getByRole('button', { name: /analyze risks/i }));
}

describe('RiskAssessmentTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock scrollIntoView which jsdom doesn't implement
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders InputForm on initial load', () => {
    render(<RiskAssessmentTool />);
    expect(screen.getByText('Risk Assessment Tool')).toBeInTheDocument();
    expect(screen.getByLabelText(/what task are you planning/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze risks/i })).toBeInTheDocument();
  });

  it('does not show results or errors initially', () => {
    render(<RiskAssessmentTool />);
    expect(screen.queryByText('Safety Assessment')).not.toBeInTheDocument();
    expect(screen.queryByText('Analysis Failed')).not.toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    let resolvePromise;
    analyzeTask.mockImplementation(() => new Promise((resolve) => { resolvePromise = resolve; }));

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Analyzing Risks...')).toBeInTheDocument();
    });

    // Resolve to clean up
    await resolvePromise(MOCK_ASSESSMENT);
  });

  it('displays results after successful analysis', async () => {
    analyzeTask.mockResolvedValue(MOCK_ASSESSMENT);

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Safety Assessment')).toBeInTheDocument();
    });

    expect(screen.getByText(MOCK_ASSESSMENT.taskSummary)).toBeInTheDocument();
    expect(screen.getByText('Start New Assessment')).toBeInTheDocument();
  });

  it('shows ErrorDisplay on failure', async () => {
    analyzeTask.mockRejectedValue(new ApiError('server error', 'SERVER', 500));

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Server error. Please try again later.')).toBeInTheDocument();
  });

  it('shows retry button only when there is saved input', async () => {
    analyzeTask.mockRejectedValue(new ApiError('fail', 'NETWORK'));

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('retry re-submits with saved input', async () => {
    analyzeTask.mockRejectedValueOnce(new ApiError('fail', 'NETWORK'));

    render(<RiskAssessmentTool />);
    fillAndSubmit('my specific task');

    await waitFor(() => {
      expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
    });

    // Now make the second call succeed
    analyzeTask.mockResolvedValueOnce(MOCK_ASSESSMENT);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText('Safety Assessment')).toBeInTheDocument();
    });

    // analyzeTask should have been called twice
    expect(analyzeTask).toHaveBeenCalledTimes(2);
  });

  it('dismiss clears error', async () => {
    analyzeTask.mockRejectedValue(new ApiError('fail', 'SERVER', 500));

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByText('Analysis Failed')).not.toBeInTheDocument();
  });

  it('"Start New Assessment" resets when no checklist progress', async () => {
    analyzeTask.mockResolvedValue(MOCK_ASSESSMENT);

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Safety Assessment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Start New Assessment'));

    // Should reset immediately (no confirm dialog) since no items are checked
    await waitFor(() => {
      expect(screen.queryByText('Safety Assessment')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Discard Progress?')).not.toBeInTheDocument();
  });

  it('"Start New Assessment" shows confirm dialog when checklist has progress', async () => {
    analyzeTask.mockResolvedValue(MOCK_ASSESSMENT);

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Safety Assessment')).toBeInTheDocument();
    });

    // Check a checklist item — find a checkbox button and click it
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    fireEvent.click(screen.getByText('Start New Assessment'));

    expect(screen.getByText('Discard Progress?')).toBeInTheDocument();
  });

  it('confirming dialog resets everything', async () => {
    analyzeTask.mockResolvedValue(MOCK_ASSESSMENT);

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Safety Assessment')).toBeInTheDocument();
    });

    // Check an item then click reset
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(screen.getByText('Start New Assessment'));

    expect(screen.getByText('Discard Progress?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /discard & start new/i }));

    await waitFor(() => {
      expect(screen.queryByText('Safety Assessment')).not.toBeInTheDocument();
      expect(screen.queryByText('Discard Progress?')).not.toBeInTheDocument();
    });
  });

  it('cancelling dialog preserves state', async () => {
    analyzeTask.mockResolvedValue(MOCK_ASSESSMENT);

    render(<RiskAssessmentTool />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('Safety Assessment')).toBeInTheDocument();
    });

    // Check an item then click reset
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(screen.getByText('Start New Assessment'));

    expect(screen.getByText('Discard Progress?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Dialog dismissed but results still visible
    expect(screen.queryByText('Discard Progress?')).not.toBeInTheDocument();
    expect(screen.getByText('Safety Assessment')).toBeInTheDocument();
  });
});
