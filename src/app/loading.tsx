export default function Loading(){
    return <div className="flex flex-col md:flex-row justify-center flex-grow gap-4 lg:max-w-screen-lg max-w-screen-sm mx-auto overflow-hidden mt-6 pb-12 animate-pulse">
      <div className="flex flex-col gap-3 my-5 mx-2 flex-1">
        <div className="rounded-lg bg-white py-3 px-4 border h-14" />

        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg bg-white py-4 px-4 border">
            <div className="flex gap-2 items-center">
              <div className="rounded-full bg-gray-200 w-10 h-10" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-52 bg-gray-100 rounded mt-2" />
              </div>
            </div>

            <div className="h-4 w-4/5 bg-gray-100 rounded mt-4" />

            <div className="grid gap-2 mt-4">
              <div className="h-10 w-full bg-gray-100 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 my-5 mx-2 w-64 flex-shrink-0">
        <div className="rounded-lg bg-white py-4 px-4 border h-24" />
        <div className="rounded-lg bg-white py-4 px-4 border h-24" />
      </div>
    </div>
}