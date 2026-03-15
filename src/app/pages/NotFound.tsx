import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold mb-3">404</h1>
        <p className="text-gray-400 mb-6">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg px-5 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-colors"
        >
          Back To Home
        </Link>
      </div>
    </div>
  );
}
