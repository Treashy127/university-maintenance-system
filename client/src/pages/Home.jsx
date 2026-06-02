import { useNavigate } from "react-router-dom"

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-white">
      <div className="w-full max-w-3xl mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-hidden">

            <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-indigo-600 text-white p-10">
            <h1 className="text-4xl font-extrabold mb-4 text-center">CampusCare</h1>
            <p className="text-lg mb-4 text-center">Maintenance & Requests Management</p>
            <div className="text-sm opacity-90 max-w-xs text-center">Streamline campus maintenance requests, track status in real-time, and collaborate with your team effortlessly.</div>
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Welcome to CampusCare</h2>
              <p className="text-center text-slate-600 text-sm mb-8">Manage maintenance requests and keep your campus running smoothly.</p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-medium transition"
                >
                  Sign In
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 p-3 rounded-lg font-medium transition"
                >
                  Create Account
                </button>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 text-center">
                  <span className="font-medium">New to CampusCare?</span> Create an account to submit and track maintenance requests. Already have an account? Sign in to get started.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home
