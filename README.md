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
2. **Analysis**: The app's server sends your task to Claude (Claude Sonnet 5.5) with a structured JSEA prompt
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
git clone https://github.com/kase1111-hash/Sharp-Edges.git
cd Sharp-Edges

# Install dependencies
npm install

# Add your Anthropic API key (see Configuration)
cp .env.example .env.local

# Start the API server and the Vite dev server together
npm run dev
```

Then open http://localhost:5173. `npm run dev` runs the API server on port 3001 and
Vite on port 5173, which forwards `/api` requests to the API server. To run them
separately, use `npm run dev:server` and `npm run dev:client`.

## Requirements

- Node.js 20.19+ or 22.12+
- An Anthropic API key for Claude

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. Get an API key from [console.anthropic.com](https://console.anthropic.com/)

The key is read only by the API server (`server/index.js` loads `.env.local`, then `.env`;
variables already set in the environment take precedence) and is never sent to the browser.
Do not use a `VITE_` prefix for it: Vite exposes `VITE_` variables to client code.

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key used by the server |
| `PORT` | No | Port for `npm start` (default `3001`) |
| `TRUST_PROXY` | No | Number of reverse proxies in front of the server, so rate limiting sees real client IPs |

## Production

```bash
npm run build
ANTHROPIC_API_KEY=your_api_key_here npm start
```

`npm start` serves the built app and the `/api/analyze` endpoint from one Express server
(port `3001` unless `PORT` is set). The endpoint allows each client a burst of 3 analyses,
then 10 per minute. If the server runs behind a reverse proxy, set `TRUST_PROXY` (e.g. `1`);
otherwise every client shares the proxy's address and therefore one rate limit.

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
- `express` - API server and production static hosting
- `@anthropic-ai/sdk` - Official Anthropic SDK, used by the server to call Claude

## Project Structure

```
Sharp-Edges/
├── server/
│   ├── index.js                 # Entry point: loads env files, starts the server
│   └── app.js                   # Express app: /api/analyze proxy to Claude, rate limiting
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
│   │   └── api.js               # Client for the /api/analyze endpoint
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
