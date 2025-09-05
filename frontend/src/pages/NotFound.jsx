export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">This page isn’t available</h1>
        <p className="text-sm text-gray-500">
          The link you followed may be broken, or the page may have been removed.
        </p>
      </div>
    </div>
  );
}


