import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { EXPERTISE_LEVELS, ENVIRONMENTS, EXAMPLE_TASKS } from '../utils/constants';

export default function InputForm({ onSubmit, loading }) {
  const [taskDescription, setTaskDescription] = useState('');
  const [expertiseLevel, setExpertiseLevel] = useState('general');
  const [environment, setEnvironment] = useState('home');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskDescription.trim() && !loading) {
      onSubmit({ taskDescription, expertiseLevel, environment });
    }
  };

  const handleExampleClick = (example) => {
    setTaskDescription(example);
  };

  const handleClear = () => {
    setTaskDescription('');
    setExpertiseLevel('general');
    setEnvironment('home');
  };

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (taskDescription.trim() && !loading) {
          e.preventDefault();
          onSubmit({ taskDescription, expertiseLevel, environment });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskDescription, expertiseLevel, environment, loading, onSubmit]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Assessment Tool</h1>
          <p className="text-gray-500 text-sm">Get a safety analysis for any task</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Description */}
        <div>
          <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
            What task are you planning to do?
          </label>
          <textarea
            id="task"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Describe the task in detail, e.g., 'Cutting down a dead tree in my backyard with a chainsaw'"
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-400"
            disabled={loading}
          />
          <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
            <span>Press Ctrl+Enter to submit</span>
            <div className="flex items-center gap-3">
              {taskDescription && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
              <span>{taskDescription.length} / 2000 characters</span>
            </div>
          </div>
        </div>

        {/* Example Tasks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or try an example:
          </label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TASKS.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example.length > 40 ? example.substring(0, 40) + '...' : example}
              </button>
            ))}
          </div>
        </div>

        {/* Expertise Level and Environment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
              Your experience level
            </label>
            <select
              id="expertise"
              value={expertiseLevel}
              onChange={(e) => setExpertiseLevel(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white disabled:opacity-50"
            >
              {EXPERTISE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <select
              id="environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white disabled:opacity-50"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!taskDescription.trim() || loading}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Risks...
            </>
          ) : (
            'Analyze Risks'
          )}
        </button>
      </form>
    </div>
  );
}
