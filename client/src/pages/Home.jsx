import { useNavigate } from "react-router-dom"

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95 shadow-[0_30px_90px_-30px_rgba(2,6,23,0.95)] md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-slate-900 to-sky-500 p-10 text-white md:flex">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-100">
                CampusCare
              </div>
              <h1 className="mt-6 text-3xl font-semibold">Maintenance made simple</h1>
              <p className="mt-3 max-w-xs text-sm leading-7 text-slate-200">Streamline campus maintenance requests, track progress in real time, and coordinate work from a single dashboard.</p>
            </div>
          </div>

          <div className="p-8 sm:p-10 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center md:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Welcome</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Welcome to CampusCare</h2>
                <p className="mt-2 text-sm text-slate-400">Manage maintenance requests and keep your campus running smoothly.</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-[1rem] bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90"
                >
                  Sign In
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  Create Account
                </button>
              </div>

              <div className="mt-6 rounded-[1rem] border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-center text-sm text-slate-400">
                  <span className="font-medium text-slate-200">New to CampusCare?</span> Create an account to submit and track maintenance requests. Already have an account? Sign in to get started.
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
