import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-error-600">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-900">
          Access Forbidden
        </h2>
        <p className="mt-2 text-neutral-600">
          You don't have permission to access this page.
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