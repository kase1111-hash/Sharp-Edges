import ErrorBoundary from './components/ErrorBoundary'
import RiskAssessmentTool from './components/RiskAssessmentTool'

function App() {
  return (
    <ErrorBoundary>
      <RiskAssessmentTool />
    </ErrorBoundary>
  )
}

export default App
