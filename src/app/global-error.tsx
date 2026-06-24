"use client";

export default function GlobalError({ error }: { error: Error }) {
  console.error(error);

  return (
    <html>
      <body>
        <div className="h-screen flex flex-col justify-center items-center">
          <h1 className="text-2xl font-semibold">
            Something went wrong
          </h1>
        </div>
      </body>
    </html>
  );
}