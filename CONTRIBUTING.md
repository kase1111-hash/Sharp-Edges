# Contributing to Sharp-Edges

Thank you for your interest in contributing to Sharp-Edges! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Sharp-Edges.git
   cd Sharp-Edges
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- An Anthropic API key (for testing API integration)

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Add your Anthropic API key to `.env.local`:
   ```
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   ```

### Running the Development Server

```bash
npm run dev
```

This starts the Vite development server at `http://localhost:5173`.

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Making Changes

### Code Style

- Use functional React components with hooks
- Follow existing code patterns and naming conventions
- Keep components focused and single-purpose
- Use Tailwind CSS for styling

### Commit Messages

Write clear, descriptive commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 72 characters
- Reference issues when applicable (e.g., "Fix #123")

Examples:
```
Add hazard category filtering to results display
Fix risk matrix cell highlighting on hover
Update API error handling for rate limits
```

### Pull Request Process

1. Ensure all tests pass (`npm test`)
2. Update documentation if needed
3. Make sure your code follows the existing style
4. Create a pull request with a clear description of:
   - What changes you made
   - Why you made them
   - Any relevant issue numbers

## Project Structure

```
src/
├── components/     # React UI components
├── hooks/          # Custom React hooks
├── services/       # API and external service integrations
├── utils/          # Utility functions and constants
└── test/           # Test configuration and utilities
```

### Key Files

- `src/components/RiskAssessmentTool.jsx` - Main application component
- `src/services/api.js` - Anthropic API integration
- `src/utils/riskCalculations.js` - Risk scoring logic
- `src/utils/constants.js` - Application configuration

## Testing Guidelines

- Write tests for new utility functions
- Add component tests for new UI components
- Test edge cases and error conditions
- Use meaningful test descriptions

Example test structure:
```javascript
describe('ComponentName', () => {
  it('should render correctly with default props', () => {
    // test code
  });

  it('should handle user interaction', () => {
    // test code
  });
});
```

## Reporting Issues

When reporting issues, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser and OS information
- Screenshots if applicable

## Feature Requests

Feature requests are welcome! Please provide:

- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label.

## License

By contributing to Sharp-Edges, you agree that your contributions will be licensed under the MIT License.
