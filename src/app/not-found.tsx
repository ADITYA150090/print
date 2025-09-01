// pages/index.tsx  (or app/page.tsx for App Router)
export default function ComingSoon() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white text-center px-6">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          🚀 Coming Soon
        </h1>
  
        {/* Subtitle */}
        <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-xl">
          We’re working hard to bring you something amazing.  
          Stay tuned for the launch!
        </p>
  
        {/* Email subscription box (optional) */}
        {/* <div className="mt-8 flex w-full max-w-md rounded-2xl overflow-hidden border border-gray-700">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-transparent text-white outline-none"
          />
          <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 transition">
            Notify Me
          </button>
        </div> */}
  
        {/* Footer */}
        <p className="mt-10 text-sm text-gray-500">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>
    );
  }
  