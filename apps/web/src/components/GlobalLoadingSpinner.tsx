export default function GlobalLoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 animate-spin mx-auto mb-4">
          <div className="w-full h-full border-4 border-filecoin-200 border-t-filecoin-600 rounded-full"></div>
        </div>
        <p className="text-lg font-medium text-gray-900">Loading...</p>
        <p className="text-sm text-gray-600 mt-2">Please wait while we process your request</p>
      </div>
    </div>
  );
}
