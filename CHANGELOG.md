# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-23

### Added

- Natural language task input with description field
- Expertise level selector (novice, intermediate, experienced, professional)
- Environment selector (home, garage, outdoor, workshop, industrial, commercial)
- AI-powered risk analysis using Claude API
- Interactive 5x5 risk matrix visualization
- Risk level badges with color-coded severity indicators
- Hazard identification with category classification
  - Thermal, chemical, mechanical, electrical, biological, ergonomic, environmental, psychological
- Hierarchy of controls recommendations
  - Elimination, substitution, engineering controls, administrative controls, PPE
- Interactive pre-task checklist with checkbox functionality
- Emergency action guidance
- Collapsible result sections for better UX
- Confirmation dialog for new assessments
- Example task quick-select buttons
- Comprehensive error handling and display
- Loading states during API calls
- Unit tests for risk calculations and utilities
- Component tests using React Testing Library
- Accessibility improvements (ARIA labels, keyboard navigation)
- Responsive design with Tailwind CSS
- Technical specification document (SPEC.md)

### Technical Details

- Built with React 18 and Vite 6
- Styled with Tailwind CSS 3
- Icons from Lucide React
- Testing with Vitest and React Testing Library
- ES modules throughout

## [Unreleased]

### Added

- Express API server (`server/`) that holds the Anthropic API key and serves `/api/analyze`, so the key no longer ships to the browser
- Per-client rate limiting on `/api/analyze`: bursts of 3, then 10 requests per minute (`TRUST_PROXY` for deployments behind a reverse proxy)
- `npm run dev` starts the API server and the Vite dev server together

### Changed

- Model switched from the retired `claude-sonnet-4-20250514` to `claude-sonnet-5-5` at low effort, called through the official Anthropic SDK (automatic retries, server-side refusal fallback)
- The API key is configured as `ANTHROPIC_API_KEY` in `.env.local` (previously `VITE_ANTHROPIC_API_KEY`)
- Node.js 20.19+ or 22.12+ is required

### Fixed

- Every analysis failed because the configured model had been retired
- The server never read `.env.local`, so the documented setup failed with "API key not configured"
- A capitalized or unrecognized risk level from the model crashed the results view
- Truncated and declined model responses were reported as parse errors; they now get specific messages and are logged
- Checklist ticks carried over to the next assessment when a new analysis was submitted from the form
- Upstream API failures were not logged on the server

### Planned

- Assessment history and storage
- PDF export functionality
- Multi-language support
