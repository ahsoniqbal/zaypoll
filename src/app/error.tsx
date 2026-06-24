"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-2xl font-semibold mb-2">
        Something went wrong
      </h1>

      <p className="text-gray-600 mb-4">
        Please try again later.
      </p>

      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}