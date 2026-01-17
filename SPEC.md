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

## 5. API Integration

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

## 6. UI/UX Requirements

### 6.1 Layout
- Max width: 896px (4xl)
- Centered container with responsive padding
- Card-based sections with rounded corners and subtle shadows

### 6.2 Color Scheme
| Element | Color |
|---------|-------|
| Primary action | Blue-600 (#2563eb) |
| Low risk | Green-500 (#22c55e) |
| Moderate risk | Yellow-500 (#eab308) |
| High risk | Orange-500 (#f97316) |
| Critical risk | Red-500 (#ef4444) |
| Background | Gray-50 (#f9fafb) |
| Card background | White |

### 6.3 Interactive Elements
- **Example task buttons**: Click to populate task input
- **Collapsible sections**: Toggle visibility of assessment sections
- **Checklist items**: Checkable pre-task verification items
- **Loading state**: Spinner with "Analyzing Risks..." text

### 6.4 Accessibility
- All interactive elements must be keyboard accessible
- Color indicators must have text alternatives
- Form inputs must have associated labels
- Sufficient color contrast ratios (WCAG AA minimum)

---

## 7. Data Schema

### 7.1 Assessment Response Schema
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

## 8. Example Tasks Database

Pre-defined quick-select tasks:
1. "Changing my car's brake pads in the driveway"
2. "Deep frying a turkey for Thanksgiving"
3. "Cutting down a dead tree in my backyard with a chainsaw"
4. "Cleaning the gutters using an extension ladder"
5. "Pressure washing my deck and siding"
6. "Replacing an electrical outlet in my kitchen"
7. "Using muriatic acid to clean concrete stains"

---

## 9. Security Considerations

### 9.1 API Key Management
- **Development**: Environment variables (`.env.local`)
- **Production**: Backend proxy to avoid client-side exposure
- **Never**: Commit API keys to version control

### 9.2 Input Validation
- Sanitize task description before display
- Limit input length to prevent abuse
- Rate limit API calls per session

### 9.3 Content Safety
- AI responses may be unpredictable; display advisory disclaimer
- Do not store user task descriptions without consent

---

## 10. Future Enhancements

### 10.1 Phase 2
- [ ] Save assessments to local storage
- [ ] Export assessment as PDF
- [ ] Share assessment via URL
- [ ] Dark mode support

### 10.2 Phase 3
- [ ] User accounts and assessment history
- [ ] Custom hazard categories
- [ ] Industry-specific templates (construction, food service, etc.)
- [ ] Multi-language support

### 10.3 Phase 4
- [ ] Mobile app (React Native)
- [ ] Offline mode with cached AI responses
- [ ] Integration with safety management systems
- [ ] Team collaboration features

---

## 11. Testing Requirements

### 11.1 Unit Tests
- Risk score calculation functions
- Risk level determination
- JSON parsing and validation

### 11.2 Integration Tests
- API call and response handling
- Error state management
- Form submission flow

### 11.3 E2E Tests
- Complete user flow from input to assessment display
- Example task button functionality
- Section collapse/expand behavior
- Checklist interaction

---

## 12. Acceptance Criteria

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
