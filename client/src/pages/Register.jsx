import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useNotification } from "../context/NotificationContext"
import { registerUser } from "../services/authService"

function Register() {

  const navigate = useNavigate()
  const { showToast } = useNotification()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [recoveryQuestions, setRecoveryQuestions] = useState([
    { question: "What is your favorite school subject?", answer: "" },
    { question: "What is the name of your first pet?", answer: "" },
    { question: "What city were you born in?", answer: "" },
  ])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRecoveryAnswerChange = (index, value) => {
    setRecoveryQuestions((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, answer: value } : item))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        recoveryQuestions,
      }

      const data = await registerUser(payload)

      localStorage.setItem(
        "token",
        data.token
      )

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      showToast(
        "Registration successful",
        "success"
      )

      navigate("/dashboard")

    } catch (error) {

      console.error(error)

      showToast(
        "Registration failed",
        "error"
      )
    }
  }

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
              <h2 className="mt-6 text-3xl font-semibold">Create your account</h2>
              <p className="mt-3 max-w-xs text-sm leading-7 text-slate-200">Join the maintenance workspace to submit requests, follow progress, and collaborate with the team.</p>
            </div>
          </div>

          <div className="p-8 sm:p-10 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center md:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">New account</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Create your account</h1>
                <p className="mt-2 text-sm text-slate-400">Get started with secure access to the campus maintenance portal.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                    required
                  />
                </div>

                <div className="rounded-[1rem] border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm font-semibold text-slate-200">Recovery questions</p>
                  <p className="mt-2 text-sm text-slate-400">Choose answers you can remember. These will help recover your account later if you forget your password.</p>

                  {recoveryQuestions.map((item, index) => (
                    <div key={item.question} className="mt-4 space-y-2">
                      <label className="block text-sm font-medium text-slate-300">{item.question}</label>
                      <input
                        type="text"
                        value={item.answer}
                        onChange={(e) => handleRecoveryAnswerChange(index, e.target.value)}
                        placeholder="Your answer"
                        className="w-full rounded-[0.95rem] border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400"
                        required
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-[1rem] bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90"
                >
                  Register
                </button>

                <div className="pt-2 text-center text-sm text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register