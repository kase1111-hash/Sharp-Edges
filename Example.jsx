import React, { useState } from 'react';
import { AlertTriangle, Shield, Activity, CheckCircle, AlertCircle, Info, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const RiskMatrix = ({ severity, likelihood }) => {
  const severityLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
  const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  
  const getColor = (s, l) => {
    const score = s * l;
    if (score <= 4) return 'bg-green-500';
    if (score <= 9) return 'bg-yellow-500';
    if (score <= 16) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-2">Risk Matrix (Severity × Likelihood)</div>
      <div className="grid grid-cols-6 gap-1 text-xs">
        <div></div>
        {[1,2,3,4,5].map(l => (
          <div key={l} className={`text-center p-1 ${likelihood === l ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
            {l}
          </div>
        ))}
        {[5,4,3,2,1].map(s => (
          <React.Fragment key={s}>
            <div className={`text-right pr-2 ${severity === s ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
              {s}
            </div>
            {[1,2,3,4,5].map(l => (
              <div
                key={`${s}-${l}`}
                className={`w-6 h-6 rounded ${getColor(s, l)} ${
                  severity === s && likelihood === l ? 'ring-2 ring-blue-600 ring-offset-1' : 'opacity-30'
                }`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Severity: {severityLabels[severity - 1]} ({severity})</span>
        <span>Likelihood: {likelihoodLabels[likelihood - 1]} ({likelihood})</span>
      </div>
    </div>
  );
};

const RiskLevelBadge = ({ level, score }) => {
  const config = {
    low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    moderate: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
  };
  const c = config[level] || config.moderate;
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text} border ${c.border}`}>
      {level.toUpperCase()} {score && `(${score})`}
    </span>
  );
};

const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
};

export default function RiskAssessmentTool() {
  const [taskDescription, setTaskDescription] = useState('');
  const [expertiseLevel, setExpertiseLevel] = useState('general');
  const [environment, setEnvironment] = useState('home');
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeRisk = async () => {
    if (!taskDescription.trim()) return;
    
    setLoading(true);
    setError(null);
    
    const systemPrompt = `You are a safety analyst generating Job Safety & Environmental Analysis (JSEA) briefs for everyday tasks. Analyze the described activity and return a JSON object with this exact structure:

{
  "taskSummary": "Brief 1-2 sentence summary of what the user plans to do",
  "parsedContext": {
    "actions": ["list of action verbs identified"],
    "materials": ["materials/substances involved"],
    "tools": ["tools or equipment mentioned or implied"],
    "environmentFactors": ["relevant environmental considerations"]
  },
  "hazards": [
    {
      "category": "thermal|chemical|mechanical|electrical|biological|ergonomic|environmental|psychological",
      "description": "Specific hazard description",
      "mechanism": "How injury/damage could occur"
    }
  ],
  "riskAssessment": {
    "severity": 1-5,
    "likelihood": 1-5,
    "overallLevel": "low|moderate|high|critical",
    "rationale": "Brief explanation of the rating"
  },
  "controls": {
    "elimination": ["Ways to remove the hazard entirely, if any"],
    "substitution": ["Safer alternatives to materials/methods"],
    "engineering": ["Physical barriers, ventilation, equipment modifications"],
    "administrative": ["Procedures, training, supervision, timing"],
    "ppe": ["Personal protective equipment needed"]
  },
  "emergencyActions": [
    "Specific emergency response steps relevant to identified hazards"
  ],
  "preTaskChecklist": [
    "Things to verify before starting"
  ],
  "ethicalNote": "If this activity might be shared, recorded, or observed by others (especially children or inexperienced individuals), include guidance on modeling safe behavior. Otherwise, provide a general responsibility note.",
  "additionalConsiderations": "Any other relevant safety wisdom, common mistakes, or things people often overlook with this type of task"
}

Consider the user's stated expertise level (${expertiseLevel}) and environment (${environment}) when calibrating advice specificity and tone. Be practical and actionable, not alarmist. Focus on realistic hazards, not edge cases.

Severity scale: 1=Negligible (minor discomfort), 2=Minor (first aid), 3=Moderate (medical treatment), 4=Major (serious injury/hospitalization), 5=Catastrophic (fatality/permanent disability)

Likelihood scale: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain`;

    const userPrompt = `Analyze this task for safety risks:

Task Description: ${taskDescription}
User Expertise: ${expertiseLevel}
Environment: ${environment}

Provide a comprehensive but practical safety assessment.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API error');
      }

      const content = data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAssessment(parsed);
      } else {
        throw new Error('Could not parse response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exampleTasks = [
    "Changing my car's brake pads in the driveway",
    "Deep frying a turkey for Thanksgiving",
    "Cutting down a dead tree in my backyard with a chainsaw",
    "Cleaning the gutters using an extension ladder",
    "Pressure washing my deck and siding",
    "Replacing an electrical outlet in my kitchen",
    "Using muriatic acid to clean concrete stains"
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Risk Assessment Tool</h1>
              <p className="text-sm text-gray-500">On-the-fly safety analysis for everyday tasks</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are you planning to do?
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe your task in natural language... e.g., 'I'm going to refinish my hardwood floors using a drum sander and oil-based polyurethane'"
                className="w-full h-28 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="mt-2">
                <span className="text-xs text-gray-500">Examples: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exampleTasks.map((task, i) => (
                    <button
                      key={i}
                      onClick={() => setTaskDescription(task)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                    >
                      {task.length > 40 ? task.slice(0, 40) + '...' : task}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Experience Level
                </label>
                <select
                  value={expertiseLevel}
                  onChange={(e) => setExpertiseLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="novice">Novice - First time doing this</option>
                  <option value="general">General - Some basic experience</option>
                  <option value="experienced">Experienced - Done this many times</option>
                  <option value="professional">Professional - Trained/certified</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="home">Home / Residential</option>
                  <option value="garage">Garage / Workshop</option>
                  <option value="outdoor">Outdoor / Yard</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="commercial">Commercial / Job Site</option>
                  <option value="remote">Remote / Wilderness</option>
                </select>
              </div>
            </div>

            <button
              onClick={analyzeRisk}
              disabled={loading || !taskDescription.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Risks...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Generate Safety Brief
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {assessment && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6 pb-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Safety Assessment Brief</h2>
                <p className="text-gray-600 mt-1">{assessment.taskSummary}</p>
              </div>
              <RiskLevelBadge 
                level={assessment.riskAssessment.overallLevel} 
                score={assessment.riskAssessment.severity * assessment.riskAssessment.likelihood}
              />
            </div>

            <Section title="Parsed Context" icon={Info} defaultOpen={false}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Actions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assessment.parsedContext.actions.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Materials:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assessment.parsedContext.materials.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tools:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assessment.parsedContext.tools.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Environment:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assessment.parsedContext.environmentFactors.map((e, i) => (
                      <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Hazards Identified" icon={AlertTriangle}>
              <div className="space-y-3">
                {assessment.hazards.map((hazard, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded uppercase font-medium">
                        {hazard.category}
                      </span>
                    </div>
                    <p className="font-medium text-red-900">{hazard.description}</p>
                    <p className="text-sm text-red-700 mt-1">{hazard.mechanism}</p>
                  </div>
                ))}
              </div>
              <RiskMatrix 
                severity={assessment.riskAssessment.severity} 
                likelihood={assessment.riskAssessment.likelihood} 
              />
              <p className="text-sm text-gray-600 mt-3 italic">{assessment.riskAssessment.rationale}</p>
            </Section>

            <Section title="Controls (Hierarchy)" icon={Shield}>
              <div className="space-y-3">
                {[
                  { key: 'elimination', label: 'Elimination', color: 'green', desc: 'Remove the hazard' },
                  { key: 'substitution', label: 'Substitution', color: 'teal', desc: 'Replace with safer alternative' },
                  { key: 'engineering', label: 'Engineering', color: 'blue', desc: 'Isolate people from hazard' },
                  { key: 'administrative', label: 'Administrative', color: 'purple', desc: 'Change how people work' },
                  { key: 'ppe', label: 'PPE', color: 'orange', desc: 'Protect the worker' }
                ].map(({ key, label, color, desc }) => (
                  assessment.controls[key]?.length > 0 && (
                    <div key={key}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-medium text-${color}-700`}>{label}</span>
                        <span className="text-xs text-gray-500">— {desc}</span>
                      </div>
                      <ul className="space-y-1 ml-4">
                        {assessment.controls[key].map((control, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className={`w-4 h-4 text-${color}-500 mt-0.5 flex-shrink-0`} />
                            {control}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            </Section>

            <Section title="Pre-Task Checklist" icon={CheckCircle}>
              <ul className="space-y-2">
                {assessment.preTaskChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <input type="checkbox" className="mt-1 rounded border-gray-300" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Emergency Actions" icon={AlertCircle}>
              <ol className="space-y-2 list-decimal list-inside">
                {assessment.emergencyActions.map((action, i) => (
                  <li key={i} className="text-sm text-gray-700">{action}</li>
                ))}
              </ol>
            </Section>

            {assessment.ethicalNote && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-900">Responsibility Note</span>
                    <p className="text-sm text-blue-800 mt-1">{assessment.ethicalNote}</p>
                  </div>
                </div>
              </div>
            )}

            {assessment.additionalConsiderations && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-amber-900">Additional Considerations</span>
                    <p className="text-sm text-amber-800 mt-1">{assessment.additionalConsiderations}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t text-xs text-gray-400 text-center">
              This assessment is advisory. Always consult professionals for high-risk activities.
              Generated for: {expertiseLevel} level • {environment} environment
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
