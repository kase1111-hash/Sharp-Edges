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

### Planned

- Backend proxy for secure API key handling
- Assessment history and storage
- PDF export functionality
- Multi-language support
