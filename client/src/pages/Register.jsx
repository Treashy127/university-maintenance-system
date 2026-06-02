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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = await registerUser(formData)

      localStorage.setItem("token", data.token)

      showToast("Registration successful", "success")

      navigate("/dashboard")

    } catch (error) {
      console.error(error)

      showToast("Registration failed", "error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-white">

      <div className="w-full max-w-3xl mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-hidden">

          <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-indigo-600 text-white p-10">
            <h2 className="text-3xl font-extrabold mb-2">CampusCare</h2>
            <p className="text-sm opacity-90">Create an account to submit and manage maintenance requests.</p>
            <div className="mt-8 text-sm opacity-90 max-w-xs text-center">Accounts are provisioned for staff — if you need access, contact your administrator.</div>
          </div>

          <div className="p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-semibold text-slate-700 text-center mb-6">Create your account</h1>

              <form onSubmit={handleSubmit} className="space-y-4">

                <label className="block text-sm text-slate-600">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  onChange={handleChange}
                  className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />

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
                  placeholder="Create a password"
                  onChange={handleChange}
                  className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-medium transition"
                >
                  Register
                </button>

                <div className="pt-2 text-center text-sm text-slate-500">Already have an account? <button type="button" onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Sign in</button></div>

              </form>

            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Register