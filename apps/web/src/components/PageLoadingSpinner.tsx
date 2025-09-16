export default function PageLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 animate-spin mx-auto mb-6">
          <div className="w-full h-full border-4 border-filecoin-200 border-t-filecoin-600 rounded-full"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Page</h2>
        <p className="text-gray-600">Please wait while we load your content</p>
      </div>
    </div>
  );
}
