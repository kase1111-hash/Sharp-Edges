# Sharp-Edges

An AI-powered risk assessment tool that generates Job Safety & Environmental Analysis (JSEA) briefs for everyday tasks. Describe what you're planning to do, and get a comprehensive safety analysis with hazard identification, risk ratings, and practical controls.

## Features

- **Natural Language Input**: Describe tasks in plain English (e.g., "Cutting down a dead tree with a chainsaw")
- **Context-Aware Analysis**: Adjusts recommendations based on expertise level and environment
- **Visual Risk Matrix**: 5×5 severity vs. likelihood grid for intuitive risk visualization
- **Hazard Categories**: Identifies thermal, chemical, mechanical, electrical, biological, ergonomic, environmental, and psychological hazards
- **Hierarchy of Controls**: Follows industry-standard control methods (elimination → substitution → engineering → administrative → PPE)
- **Interactive Checklists**: Pre-task verification items you can check off
- **Emergency Actions**: Task-specific emergency response guidance

## How It Works

1. **Input**: Enter a task description, select your experience level (novice to professional), and choose your environment (home, garage, outdoor, etc.)
2. **Analysis**: The tool sends your task to Claude AI with a structured JSEA prompt
3. **Output**: Receive a detailed safety brief including:
   - Parsed context (actions, materials, tools, environment factors)
   - Identified hazards with mechanisms of injury
   - Risk score (Severity × Likelihood)
   - Tiered control recommendations
   - Pre-task checklist
   - Emergency response steps

## Risk Scoring

The tool uses a standard risk matrix:

| Score Range | Risk Level |
|-------------|------------|
| 1-4         | Low (Green) |
| 5-9         | Moderate (Yellow) |
| 10-16       | High (Orange) |
| 17-25       | Critical (Red) |

**Severity Scale** (1-5): Negligible → Minor → Moderate → Major → Catastrophic

**Likelihood Scale** (1-5): Rare → Unlikely → Possible → Likely → Almost Certain

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Sharp-Edges.git
cd Sharp-Edges

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Requirements

- Node.js 16+
- React 18+
- An Anthropic API key for Claude

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Anthropic API key to `.env.local`:
   ```
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   ```

3. Get an API key from [console.anthropic.com](https://console.anthropic.com/)

> **Note**: For production use, implement a backend proxy to avoid exposing API keys in client-side code. The current setup is for development only.

## Example Tasks

The tool includes quick-select examples:

- Changing car brake pads in the driveway
- Deep frying a turkey for Thanksgiving
- Cutting down a dead tree with a chainsaw
- Cleaning gutters using an extension ladder
- Pressure washing deck and siding
- Replacing an electrical outlet
- Using muriatic acid to clean concrete

## Dependencies

- `react` - UI framework
- `lucide-react` - Icon library (AlertTriangle, Shield, Activity, CheckCircle, etc.)

## Project Structure

```
Sharp-Edges/
├── src/
│   ├── components/          # React UI components
│   │   ├── RiskAssessmentTool.jsx
│   │   ├── InputForm.jsx
│   │   ├── ResultsDisplay.jsx
│   │   ├── RiskMatrix.jsx
│   │   └── ...
│   ├── hooks/
│   │   └── useRiskAnalysis.js   # API state management
│   ├── services/
│   │   └── api.js               # Anthropic API integration
│   └── utils/
│       ├── constants.js         # App configuration
│       └── riskCalculations.js  # Risk scoring logic
├── .env.example                 # Environment template
├── package.json
└── README.md
```

## Disclaimer

This tool provides advisory safety information only. It is not a substitute for:

- Professional safety training
- Certified risk assessments
- Expert consultation for high-risk activities
- Compliance with local regulations and codes

Always consult qualified professionals when undertaking hazardous tasks.

## License

MIT
