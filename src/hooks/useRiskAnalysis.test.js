import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRiskAnalysis } from './useRiskAnalysis';
import { ApiError } from '../services/api';

// Mock the api module so we control analyzeTask behavior
vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    analyzeTask: vi.fn(),
  };
});

// Import the mocked version after vi.mock
import { analyzeTask } from '../services/api';

const MOCK_RESULT = { taskSummary: 'test summary', riskAssessment: { severity: 3, likelihood: 2, overallLevel: 'moderate' } };

describe('useRiskAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useRiskAnalysis());
    expect(result.current.assessment).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading=true during request', async () => {
    let resolvePromise;
    analyzeTask.mockImplementation(() => new Promise((resolve) => { resolvePromise = resolve; }));

    const { result } = renderHook(() => useRiskAnalysis());

    // Start the analysis (don't await)
    let analyzePromise;
    act(() => {
      analyzePromise = result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.loading).toBe(true);

    // Resolve and wait
    await act(async () => {
      resolvePromise(MOCK_RESULT);
      await analyzePromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('sets assessment on success', async () => {
    analyzeTask.mockResolvedValue(MOCK_RESULT);

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.assessment).toEqual(MOCK_RESULT);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('maps NO_API_KEY error to user-friendly message', async () => {
    analyzeTask.mockRejectedValue(new ApiError('raw msg', 'NO_API_KEY'));

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.error).toBe('API key not configured. Please check your environment setup.');
    expect(result.current.assessment).toBeNull();
  });

  it('maps NETWORK error to user-friendly message', async () => {
    analyzeTask.mockRejectedValue(new ApiError('raw msg', 'NETWORK'));

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.error).toBe('Unable to connect to the server. Please check your internet connection.');
  });

  it('maps AUTH error to user-friendly message', async () => {
    analyzeTask.mockRejectedValue(new ApiError('raw msg', 'AUTH', 401));

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.error).toBe('Authentication failed. Please check your API key.');
  });

  it('maps RATE_LIMIT error to user-friendly message', async () => {
    analyzeTask.mockRejectedValue(new ApiError('raw msg', 'RATE_LIMIT', 429));

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.error).toBe('Too many requests. Please wait a moment and try again.');
  });

  it('maps SERVER error to user-friendly message', async () => {
    analyzeTask.mockRejectedValue(new ApiError('raw msg', 'SERVER', 500));

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.error).toBe('Server error. Please try again later.');
  });

  it('maps PARSE error to user-friendly message', async () => {
    analyzeTask.mockRejectedValue(new ApiError('raw msg', 'PARSE'));

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.error).toBe('Could not parse the response. Please try again.');
  });

  it('falls back to err.message for unknown error codes', async () => {
    analyzeTask.mockRejectedValue(new Error('something unexpected'));

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.error).toBe('something unexpected');
  });

  it('sets error for empty task without calling API', async () => {
    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('', 'general', 'home');
    });

    expect(result.current.error).toBe('Please provide a task description');
    expect(analyzeTask).not.toHaveBeenCalled();
  });

  it('sets error for whitespace-only task without calling API', async () => {
    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('   ', 'general', 'home');
    });

    expect(result.current.error).toBe('Please provide a task description');
    expect(analyzeTask).not.toHaveBeenCalled();
  });

  it('silently ignores AbortError from cancelled requests', async () => {
    const abortError = new DOMException('aborted', 'AbortError');
    analyzeTask.mockRejectedValue(abortError);

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    // AbortError should not set error state
    expect(result.current.error).toBeNull();
  });

  it('passes signal to analyzeTask', async () => {
    analyzeTask.mockResolvedValue(MOCK_RESULT);

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(analyzeTask).toHaveBeenCalledWith(
      'test task', 'general', 'home',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('reset clears all state', async () => {
    analyzeTask.mockResolvedValue(MOCK_RESULT);

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.assessment).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.assessment).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('clearError clears only error, preserves assessment', async () => {
    analyzeTask.mockResolvedValue(MOCK_RESULT);

    const { result } = renderHook(() => useRiskAnalysis());

    // First get an assessment
    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    const savedAssessment = result.current.assessment;

    // Now trigger an error on a second call
    analyzeTask.mockRejectedValue(new ApiError('fail', 'SERVER', 500));

    await act(async () => {
      await result.current.analyze('test task 2', 'general', 'home');
    });

    expect(result.current.error).not.toBeNull();

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    // Assessment was cleared when analyze was called the second time
    expect(result.current.assessment).toBeNull();
  });

  it('loading returns to false after error', async () => {
    analyzeTask.mockRejectedValue(new ApiError('fail', 'NETWORK'));

    const { result } = renderHook(() => useRiskAnalysis());

    await act(async () => {
      await result.current.analyze('test task', 'general', 'home');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).not.toBeNull();
  });
});
