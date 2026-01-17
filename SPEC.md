# Sharp-Edges Technical Specification

## 1. Overview

### 1.1 Purpose
Sharp-Edges is a web-based risk assessment tool that generates Job Safety & Environmental Analysis (JSEA) briefs for everyday tasks. The tool uses AI to analyze user-described activities and produce structured safety guidance.

### 1.2 Goals
- Enable non-experts to identify hazards before starting tasks
- Provide actionable safety controls following industry-standard hierarchy
- Generate task-specific emergency response guidance
- Adapt recommendations based on user expertise and environment

### 1.3 Target Users
- DIY enthusiasts and homeowners
- Hobbyists undertaking unfamiliar projects
- Small business operators
- Anyone planning potentially hazardous activities

---

## 2. Functional Requirements

### 2.1 Input Collection

#### 2.1.1 Task Description
- **Type**: Free-form text input
- **Minimum**: Non-empty string
- **Maximum**: 2000 characters (recommended)
- **Placeholder**: Natural language example prompt
- **Quick-select examples**: Pre-defined task buttons for common scenarios

#### 2.1.2 Expertise Level
| Value | Label | Description |
|-------|-------|-------------|
| `novice` | Novice | First time doing this task |
| `general` | General | Some basic experience |
| `experienced` | Experienced | Done this many times |
| `professional` | Professional | Trained/certified in this area |

#### 2.1.3 Environment
| Value | Label |
|-------|-------|
| `home` | Home / Residential |
| `garage` | Garage / Workshop |
| `outdoor` | Outdoor / Yard |
| `kitchen` | Kitchen |
| `commercial` | Commercial / Job Site |
| `remote` | Remote / Wilderness |

### 2.2 Risk Analysis Output

The system shall generate and display the following sections:

#### 2.2.1 Task Summary
- 1-2 sentence summary of the interpreted task

#### 2.2.2 Parsed Context
| Field | Type | Description |
|-------|------|-------------|
| `actions` | string[] | Action verbs identified in the task |
| `materials` | string[] | Materials/substances involved |
| `tools` | string[] | Tools or equipment mentioned/implied |
| `environmentFactors` | string[] | Relevant environmental considerations |

#### 2.2.3 Hazards
Array of hazard objects:
| Field | Type | Description |
|-------|------|-------------|
| `category` | enum | One of: thermal, chemical, mechanical, electrical, biological, ergonomic, environmental, psychological |
| `description` | string | Specific hazard description |
| `mechanism` | string | How injury/damage could occur |

#### 2.2.4 Risk Assessment
| Field | Type | Description |
|-------|------|-------------|
| `severity` | integer (1-5) | Impact severity rating |
| `likelihood` | integer (1-5) | Probability of occurrence |
| `overallLevel` | enum | low, moderate, high, critical |
| `rationale` | string | Explanation of the rating |

#### 2.2.5 Controls (Hierarchy)
| Control Type | Priority | Description |
|--------------|----------|-------------|
| `elimination` | 1 (Highest) | Ways to remove the hazard entirely |
| `substitution` | 2 | Safer alternatives to materials/methods |
| `engineering` | 3 | Physical barriers, ventilation, equipment modifications |
| `administrative` | 4 | Procedures, training, supervision, timing |
| `ppe` | 5 (Lowest) | Personal protective equipment needed |

#### 2.2.6 Additional Outputs
- `emergencyActions`: string[] - Emergency response steps
- `preTaskChecklist`: string[] - Items to verify before starting
- `ethicalNote`: string - Responsibility guidance
- `additionalConsiderations`: string - Common mistakes, overlooked items

---

## 3. Risk Scoring System

### 3.1 Severity Scale
| Rating | Label | Definition |
|--------|-------|------------|
| 1 | Negligible | Minor discomfort, no treatment needed |
| 2 | Minor | First aid treatment required |
| 3 | Moderate | Medical treatment required |
| 4 | Major | Serious injury, hospitalization |
| 5 | Catastrophic | Fatality or permanent disability |

### 3.2 Likelihood Scale
| Rating | Label | Definition |
|--------|-------|------------|
| 1 | Rare | Highly unlikely to occur |
| 2 | Unlikely | Could occur but not expected |
| 3 | Possible | May occur occasionally |
| 4 | Likely | Will probably occur |
| 5 | Almost Certain | Expected to occur |

### 3.3 Risk Matrix Calculation
```
Risk Score = Severity × Likelihood
```

| Score Range | Risk Level | Color |
|-------------|------------|-------|
| 1-4 | Low | Green (#22c55e) |
| 5-9 | Moderate | Yellow (#eab308) |
| 10-16 | High | Orange (#f97316) |
| 17-25 | Critical | Red (#ef4444) |

### 3.4 Visual Risk Matrix
Display a 5×5 grid with:
- X-axis: Likelihood (1-5)
- Y-axis: Severity (5-1, inverted)
- Cell colors based on score calculation
- Current assessment highlighted with ring indicator

---

## 4. Technical Architecture

### 4.1 Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18+ |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| AI Backend | Anthropic Claude API |
| Build Tool | Vite (recommended) |

### 4.2 Component Structure

```
src/
├── components/
│   ├── RiskAssessmentTool.jsx    # Main container component
│   ├── RiskMatrix.jsx            # 5×5 visual risk grid
│   ├── RiskLevelBadge.jsx        # Colored risk level indicator
│   ├── Section.jsx               # Collapsible section wrapper
│   ├── InputForm.jsx             # Task input and selectors
│   ├── HazardList.jsx            # Hazard display cards
│   ├── ControlsHierarchy.jsx     # Tiered controls display
│   ├── Checklist.jsx             # Interactive checklist
│   └── EmergencyActions.jsx      # Emergency steps list
├── hooks/
│   └── useRiskAnalysis.js        # API call and state management
├── utils/
│   ├── riskCalculations.js       # Score and level calculations
│   └── constants.js              # Labels, colors, example tasks
└── App.jsx
```

### 4.3 State Management
```javascript
{
  // Input state
  taskDescription: string,
  expertiseLevel: 'novice' | 'general' | 'experienced' | 'professional',
  environment: 'home' | 'garage' | 'outdoor' | 'kitchen' | 'commercial' | 'remote',

  // Output state
  assessment: AssessmentObject | null,
  loading: boolean,
  error: string | null
}
```

---

## 5. Implementation Guide (5 Phases)

This section breaks the development process into five sequential phases. Complete each phase before moving to the next.

### Phase 1: Project Setup & Static UI

**Goal**: Establish project foundation and build the complete UI with mock data.

#### Tasks
1. **Initialize Project**
   ```bash
   npm create vite@latest sharp-edges -- --template react
   cd sharp-edges
   npm install tailwindcss postcss autoprefixer lucide-react
   npx tailwindcss init -p
   ```

2. **Configure Tailwind** - Update `tailwind.config.js` and add directives to CSS

3. **Create Constants File** (`src/utils/constants.js`)
   - Define expertise levels array
   - Define environments array
   - Define example tasks array
   - Define hazard category icons/colors
   - Define risk level colors and thresholds

4. **Build Input Form Component**
   - Text area for task description
   - Dropdown for expertise level
   - Dropdown for environment
   - Example task buttons (clickable chips)
   - Submit button (disabled when empty)

5. **Build Static Results Display**
   - Create mock assessment data matching the schema
   - Build Section component (collapsible card)
   - Build all result sections with mock data:
     - Task summary header
     - Parsed context tags
     - Hazards list with category icons
     - Risk assessment with placeholder matrix
     - Controls hierarchy (5 tiers)
     - Pre-task checklist (static)
     - Emergency actions list
     - Disclaimer footer

#### Deliverables
- [ ] Running Vite + React + Tailwind project
- [ ] Complete input form with all fields
- [ ] All result sections rendering with mock data
- [ ] Responsive layout (mobile-friendly)

---

### Phase 2: Risk Matrix & Calculations

**Goal**: Build the interactive 5×5 risk matrix and implement scoring logic.

#### Tasks
1. **Create Risk Calculation Utilities** (`src/utils/riskCalculations.js`)
   ```javascript
   // Calculate risk score
   export const calculateRiskScore = (severity, likelihood) =>
     severity * likelihood;

   // Determine risk level from score
   export const getRiskLevel = (score) => {
     if (score <= 4) return 'low';
     if (score <= 9) return 'moderate';
     if (score <= 16) return 'high';
     return 'critical';
   };

   // Get color for risk level
   export const getRiskColor = (level) => {
     const colors = {
       low: '#22c55e',
       moderate: '#eab308',
       high: '#f97316',
       critical: '#ef4444'
     };
     return colors[level];
   };

   // Get cell color for matrix position
   export const getMatrixCellColor = (severity, likelihood) => {
     const score = calculateRiskScore(severity, likelihood);
     return getRiskColor(getRiskLevel(score));
   };
   ```

2. **Build RiskMatrix Component**
   - Render 5×5 grid using CSS Grid or Flexbox
   - Color each cell based on severity × likelihood
   - Add axis labels (Severity 1-5 on Y, Likelihood 1-5 on X)
   - Highlight current assessment position with ring/border
   - Add hover states showing score value

3. **Build RiskLevelBadge Component**
   - Display risk level text (Low/Moderate/High/Critical)
   - Background color matches risk level
   - Show numeric score (e.g., "Score: 12")

4. **Integrate with Results Display**
   - Replace placeholder matrix with RiskMatrix component
   - Pass severity/likelihood from mock data
   - Display RiskLevelBadge in assessment header

#### Deliverables
- [ ] Working risk calculation functions with tests
- [ ] Interactive 5×5 risk matrix with correct colors
- [ ] Current position indicator on matrix
- [ ] Risk level badge displaying correctly

---

### Phase 3: API Integration

**Goal**: Connect to Claude API and replace mock data with real responses.

#### Tasks
1. **Create API Service** (`src/services/api.js`)
   ```javascript
   const SYSTEM_PROMPT = `You are a safety analyst...`; // Full prompt

   export const analyzeTask = async (task, expertise, environment) => {
     const response = await fetch('https://api.anthropic.com/v1/messages', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
         'anthropic-version': '2023-06-01'
       },
       body: JSON.stringify({
         model: 'claude-sonnet-4-20250514',
         max_tokens: 2000,
         system: SYSTEM_PROMPT,
         messages: [{
           role: 'user',
           content: `Task: ${task}\nExpertise: ${expertise}\nEnvironment: ${environment}`
         }]
       })
     });

     if (!response.ok) throw new Error('API request failed');
     return response.json();
   };
   ```

2. **Create Custom Hook** (`src/hooks/useRiskAnalysis.js`)
   ```javascript
   export const useRiskAnalysis = () => {
     const [assessment, setAssessment] = useState(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const analyze = async (task, expertise, environment) => {
       setLoading(true);
       setError(null);
       try {
         const response = await analyzeTask(task, expertise, environment);
         const parsed = parseResponse(response);
         setAssessment(parsed);
       } catch (err) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };

     return { assessment, loading, error, analyze };
   };
   ```

3. **Implement Response Parsing**
   - Extract JSON from response text using regex
   - Validate required fields exist
   - Provide fallback values for missing optional fields
   - Handle malformed JSON gracefully

4. **Build Loading State UI**
   - Spinner animation
   - "Analyzing risks..." text
   - Disable form inputs during loading

5. **Build Error State UI**
   - Red error banner
   - User-friendly error messages
   - "Try again" button

6. **Environment Configuration**
   - Create `.env.local` for API key
   - Add `.env.local` to `.gitignore`
   - Document setup in README

#### Deliverables
- [ ] Successful API calls returning assessments
- [ ] JSON parsing working reliably
- [ ] Loading state with spinner
- [ ] Error handling with user feedback
- [ ] Environment variable configuration

---

### Phase 4: Interactive Features

**Goal**: Add interactivity to checklist, sections, and polish the UX.

#### Tasks
1. **Implement Collapsible Sections**
   ```javascript
   const Section = ({ title, icon, children, defaultOpen = true }) => {
     const [isOpen, setIsOpen] = useState(defaultOpen);
     return (
       <div className="border rounded-lg">
         <button onClick={() => setIsOpen(!isOpen)}>
           {icon} {title} {isOpen ? '▼' : '▶'}
         </button>
         {isOpen && <div>{children}</div>}
       </div>
     );
   };
   ```

2. **Build Interactive Checklist**
   - Local state for checked items: `useState(new Set())`
   - Toggle function for each item
   - Visual checkmark/checkbox styling
   - Progress indicator (e.g., "3/7 completed")
   - Persist checked state during session

3. **Add Example Task Quick-Select**
   - Render example tasks as clickable buttons/chips
   - On click, populate task input field
   - Optional: auto-submit after selection

4. **Enhance Form UX**
   - Character count for task description
   - Clear button to reset form
   - Keyboard shortcut (Cmd/Ctrl+Enter) to submit

5. **Add Animation & Transitions**
   - Fade in results when loaded
   - Smooth collapse/expand for sections
   - Button hover/active states

6. **Implement "New Assessment" Flow**
   - Button to clear results and start over
   - Confirm dialog if checklist has progress

#### Deliverables
- [ ] All sections collapsible with smooth animation
- [ ] Working checklist with visual feedback
- [ ] Example tasks populate input on click
- [ ] Polished form interactions
- [ ] Clear path to start new assessment

---

### Phase 5: Testing, Polish & Deployment

**Goal**: Ensure reliability, accessibility, and prepare for production.

#### Tasks
1. **Write Unit Tests** (Vitest or Jest)
   ```javascript
   // riskCalculations.test.js
   test('calculates risk score correctly', () => {
     expect(calculateRiskScore(3, 4)).toBe(12);
   });

   test('returns correct risk level', () => {
     expect(getRiskLevel(4)).toBe('low');
     expect(getRiskLevel(9)).toBe('moderate');
     expect(getRiskLevel(16)).toBe('high');
     expect(getRiskLevel(25)).toBe('critical');
   });
   ```

2. **Write Integration Tests**
   - Mock API responses
   - Test form submission flow
   - Test error handling paths

3. **Accessibility Audit**
   - Run axe-core or Lighthouse audit
   - Add ARIA labels to interactive elements
   - Ensure keyboard navigation works
   - Test with screen reader
   - Verify color contrast ratios

4. **Performance Optimization**
   - Lazy load result components
   - Memoize expensive calculations
   - Optimize bundle size (check with `npm run build`)

5. **Add Disclaimer & Legal**
   - Prominent disclaimer on results
   - Link to full terms (if applicable)
   - "This is advisory only" messaging

6. **Production Build Setup**
   - Configure production environment variables
   - Set up backend proxy for API key (recommended)
   - Configure CSP headers if needed

7. **Deploy**
   - Build: `npm run build`
   - Deploy to Vercel/Netlify/CloudFlare Pages
   - Verify production functionality
   - Set up error monitoring (optional: Sentry)

#### Deliverables
- [ ] Unit tests passing (>80% coverage on utils)
- [ ] Integration tests for critical paths
- [ ] Accessibility score >90 on Lighthouse
- [ ] Production build under 200KB (gzipped)
- [ ] Deployed and functional on production URL

---

### Phase Summary

| Phase | Focus | Key Outcome |
|-------|-------|-------------|
| 1 | Setup & Static UI | Complete UI with mock data |
| 2 | Risk Matrix | Interactive scoring visualization |
| 3 | API Integration | Real AI-powered assessments |
| 4 | Interactivity | Polished user experience |
| 5 | Testing & Deploy | Production-ready application |

---

## 6. API Integration

### 5.1 Endpoint
```
POST https://api.anthropic.com/v1/messages
```

### 5.2 Request Headers
```javascript
{
  'Content-Type': 'application/json',
  'x-api-key': '<API_KEY>',
  'anthropic-version': '2023-06-01'
}
```

### 5.3 Request Body
```javascript
{
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2000,
  system: '<SYSTEM_PROMPT>',
  messages: [
    { role: 'user', content: '<USER_PROMPT>' }
  ]
}
```

### 5.4 System Prompt Template
The system prompt must instruct the AI to:
1. Act as a safety analyst generating JSEA briefs
2. Return a specific JSON structure (see Section 2.2)
3. Consider user expertise level and environment
4. Be practical, not alarmist
5. Focus on realistic hazards, not edge cases
6. Use defined severity and likelihood scales

### 5.5 Response Parsing
1. Extract `content[0].text` from response
2. Use regex to find JSON object: `/\{[\s\S]*\}/`
3. Parse JSON and validate structure
4. Set assessment state or throw error

### 5.6 Error Handling
| Error Type | User Message |
|------------|--------------|
| Network failure | "Unable to connect. Please check your internet connection." |
| API error | Display `error.message` from response |
| Parse failure | "Could not parse response. Please try again." |
| Empty input | Disable submit button (no error shown) |

---

## 7. UI/UX Requirements

### 7.1 Layout
- Max width: 896px (4xl)
- Centered container with responsive padding
- Card-based sections with rounded corners and subtle shadows

### 7.2 Color Scheme
| Element | Color |
|---------|-------|
| Primary action | Blue-600 (#2563eb) |
| Low risk | Green-500 (#22c55e) |
| Moderate risk | Yellow-500 (#eab308) |
| High risk | Orange-500 (#f97316) |
| Critical risk | Red-500 (#ef4444) |
| Background | Gray-50 (#f9fafb) |
| Card background | White |

### 7.3 Interactive Elements
- **Example task buttons**: Click to populate task input
- **Collapsible sections**: Toggle visibility of assessment sections
- **Checklist items**: Checkable pre-task verification items
- **Loading state**: Spinner with "Analyzing Risks..." text

### 7.4 Accessibility
- All interactive elements must be keyboard accessible
- Color indicators must have text alternatives
- Form inputs must have associated labels
- Sufficient color contrast ratios (WCAG AA minimum)

---

## 8. Data Schema

### 8.1 Assessment Response Schema
```typescript
interface Assessment {
  taskSummary: string;
  parsedContext: {
    actions: string[];
    materials: string[];
    tools: string[];
    environmentFactors: string[];
  };
  hazards: Array<{
    category: 'thermal' | 'chemical' | 'mechanical' | 'electrical' |
              'biological' | 'ergonomic' | 'environmental' | 'psychological';
    description: string;
    mechanism: string;
  }>;
  riskAssessment: {
    severity: 1 | 2 | 3 | 4 | 5;
    likelihood: 1 | 2 | 3 | 4 | 5;
    overallLevel: 'low' | 'moderate' | 'high' | 'critical';
    rationale: string;
  };
  controls: {
    elimination: string[];
    substitution: string[];
    engineering: string[];
    administrative: string[];
    ppe: string[];
  };
  emergencyActions: string[];
  preTaskChecklist: string[];
  ethicalNote: string;
  additionalConsiderations: string;
}
```

---

## 9. Example Tasks Database

Pre-defined quick-select tasks:
1. "Changing my car's brake pads in the driveway"
2. "Deep frying a turkey for Thanksgiving"
3. "Cutting down a dead tree in my backyard with a chainsaw"
4. "Cleaning the gutters using an extension ladder"
5. "Pressure washing my deck and siding"
6. "Replacing an electrical outlet in my kitchen"
7. "Using muriatic acid to clean concrete stains"

---

## 10. Security Considerations

### 10.1 API Key Management
- **Development**: Environment variables (`.env.local`)
- **Production**: Backend proxy to avoid client-side exposure
- **Never**: Commit API keys to version control

### 10.2 Input Validation
- Sanitize task description before display
- Limit input length to prevent abuse
- Rate limit API calls per session

### 10.3 Content Safety
- AI responses may be unpredictable; display advisory disclaimer
- Do not store user task descriptions without consent

---

## 11. Future Enhancements

### 11.1 Phase 2
- [ ] Save assessments to local storage
- [ ] Export assessment as PDF
- [ ] Share assessment via URL
- [ ] Dark mode support

### 11.2 Phase 3
- [ ] User accounts and assessment history
- [ ] Custom hazard categories
- [ ] Industry-specific templates (construction, food service, etc.)
- [ ] Multi-language support

### 11.3 Phase 4
- [ ] Mobile app (React Native)
- [ ] Offline mode with cached AI responses
- [ ] Integration with safety management systems
- [ ] Team collaboration features

---

## 12. Testing Requirements

### 12.1 Unit Tests
- Risk score calculation functions
- Risk level determination
- JSON parsing and validation

### 12.2 Integration Tests
- API call and response handling
- Error state management
- Form submission flow

### 12.3 E2E Tests
- Complete user flow from input to assessment display
- Example task button functionality
- Section collapse/expand behavior
- Checklist interaction

---

## 13. Acceptance Criteria

1. User can enter a task description and receive a safety assessment
2. Assessment displays all required sections (hazards, controls, checklist, etc.)
3. Risk matrix visually indicates severity and likelihood
4. Risk level badge shows correct color and label
5. All sections are collapsible
6. Loading state displays during API call
7. Errors display user-friendly messages
8. Example tasks populate the input field when clicked
9. Pre-task checklist items are checkable
10. Disclaimer is visible on all assessments
