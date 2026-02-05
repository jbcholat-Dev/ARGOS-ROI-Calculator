export function App() {
  return (
    <div className="min-h-screen bg-surface-canvas flex items-center justify-center">
      <div className="bg-surface-card p-8 rounded-lg shadow-md">
        <h1 className="text-heading text-pfeiffer-red font-bold mb-4">
          ARGOS ROI Calculator
        </h1>
        <p className="text-body text-gray-700">
          Pfeiffer Vacuum Predictive Maintenance Platform
        </p>
        <div className="mt-6 flex gap-4">
          <div className="w-16 h-16 bg-pfeiffer-red rounded flex items-center justify-center text-white font-bold">
            Red
          </div>
          <div className="w-16 h-16 bg-roi-positive rounded flex items-center justify-center text-white font-bold">
            ROI+
          </div>
          <div className="w-16 h-16 bg-roi-warning rounded flex items-center justify-center text-white font-bold">
            Warn
          </div>
        </div>
      </div>
    </div>
  );
}
