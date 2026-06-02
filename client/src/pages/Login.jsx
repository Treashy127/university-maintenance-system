import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useNotification } from "../context/NotificationContext"
import { loginUser } from "../services/authService"

function Login() {

  const navigate = useNavigate()
  const { showToast } = useNotification()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = await loginUser(formData)

      localStorage.setItem("token", data.token)

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      showToast("Login successful", "success")

      navigate("/dashboard")

    } catch (error) {
      console.error(error)

      showToast("Invalid credentials", "error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-white">

      <div className="w-full max-w-3xl mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-hidden">

          <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-indigo-600 text-white p-10">
            <h2 className="text-3xl font-extrabold mb-2">CampusCare</h2>
            <p className="text-sm opacity-90">Maintenance & Requests Dashboard</p>
            <div className="mt-8 text-sm opacity-90 max-w-xs text-center">Secure access for staff and administrators — manage requests, track status, and collaborate with your team.</div>
          </div>

          <div className="p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-semibold text-slate-700 text-center mb-6">Sign in to your account</h1>

              <form onSubmit={handleSubmit} className="space-y-4">

                <label className="block text-sm text-slate-600">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@university.edu"
                  onChange={handleChange}
                  className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />

                <label className="block text-sm text-slate-600">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600" />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <button type="button" className="text-indigo-600 hover:underline">Forgot?</button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-medium transition"
                >
                  Sign In
                </button>

                <div className="pt-2 text-center text-sm text-slate-500">Don't have an account? <button type="button" onClick={() => navigate('/register')} className="text-indigo-600 hover:underline">Register</button></div>

              </form>

            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Login