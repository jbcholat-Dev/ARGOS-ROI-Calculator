export function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-pfeiffer-red border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
