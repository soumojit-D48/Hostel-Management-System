import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-neutral-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}