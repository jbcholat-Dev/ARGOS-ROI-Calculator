import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard, FocusMode, GlobalAnalysis, Solutions } from '@/pages';

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface-canvas">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis/:id" element={<FocusMode />} />
          <Route path="/global" element={<GlobalAnalysis />} />
          <Route path="/solutions" element={<Solutions />} />
        </Routes>
      </div>
    </Router>
  );
}
