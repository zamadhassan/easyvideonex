import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-white mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-400 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
