import { useParams } from 'react-router-dom';

export function FocusMode() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600 mt-4">No analysis ID provided</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Focus Mode</h1>
      <p className="text-gray-600 mt-4">Analysis ID: {id}</p>
      <p className="text-gray-500 mt-2">
        Placeholder for InputPanel and ResultsPanel. Will be implemented in Epic 2.
      </p>
    </div>
  );
}
