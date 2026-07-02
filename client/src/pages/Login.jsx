import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useNotification } from "../context/NotificationContext"
import { loginUser, requestPasswordReset, resetPassword } from "../services/authService"

function Login() {

  const navigate = useNavigate()
  const { showToast } = useNotification()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [savedAccounts, setSavedAccounts] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryCode, setRecoveryCode] = useState("")
  const [newRecoveryPassword, setNewRecoveryPassword] = useState("")
  const [recoveryMessage, setRecoveryMessage] = useState("")
  const [recoveryError, setRecoveryError] = useState("")
  const [recoveryStep, setRecoveryStep] = useState("request")

  useEffect(() => {
    const savedAccountsList = localStorage.getItem("savedAccounts")
    if (savedAccountsList) {
      try {
        const parsedAccounts = JSON.parse(savedAccountsList)
        setSavedAccounts(parsedAccounts)
      } catch (error) {
        console.error(error)
        localStorage.removeItem("savedAccounts")
      }
    }

    localStorage.removeItem("rememberedUser")
  }, [])

  useEffect(() => {
    if (savedAccounts.length > 1) {
      const timer = window.setTimeout(() => setShowSuggestions(true), 5000)
      return () => window.clearTimeout(timer)
    }

    setShowSuggestions(false)
  }, [savedAccounts.length])

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectAccount = (account) => {
    setFormData((prev) => ({
      ...prev,
      email: account.email,
      password: "",
    }))
    setRememberMe(false)
  }

  const saveAccountSuggestion = (email, name) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) return

    setSavedAccounts((prev) => {
      const filteredAccounts = prev.filter((account) => account.email !== normalizedEmail)
      const updatedAccounts = [{ email: normalizedEmail, name: name || normalizedEmail, lastUsedAt: new Date().toISOString() }, ...filteredAccounts].slice(0, 5)

      localStorage.setItem("savedAccounts", JSON.stringify(updatedAccounts))

      return updatedAccounts
    })
  }

  const handleRecoverySubmit = async (e) => {
    e.preventDefault()
    setRecoveryError("")
    setRecoveryMessage("")

    try {
      if (recoveryStep === "request") {
        const response = await requestPasswordReset(recoveryEmail || formData.email)
        setRecoveryMessage(response.message)
        if (response.recoveryCode) {
          setRecoveryCode(response.recoveryCode)
        }
        setRecoveryStep("reset")
        return
      }

      const response = await resetPassword({
        email: recoveryEmail || formData.email,
        code: recoveryCode,
        newPassword: newRecoveryPassword,
      })

      setRecoveryMessage(response.message)
      setShowRecovery(false)
      setRecoveryCode("")
      setNewRecoveryPassword("")
      setRecoveryStep("request")
      setFormData((prev) => ({ ...prev, password: "" }))
      showToast("Password reset successfully", "success")
    } catch (error) {
      console.error(error)
      setRecoveryError(error.response?.data?.message || "Recovery failed")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      }

      const data = await loginUser(payload)

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      saveAccountSuggestion(formData.email, data.user?.name || data.user?.email || formData.email)

      if (rememberMe && typeof window !== "undefined" && "PasswordCredential" in window && navigator.credentials?.store) {
        try {
          const credential = new window.PasswordCredential({
            id: formData.email.trim().toLowerCase(),
            password: formData.password,
            name: data.user?.name || formData.email,
          })

          await navigator.credentials.store(credential)
        } catch (error) {
          console.warn("Could not store credential securely", error)
        }
      }

      localStorage.removeItem("rememberedUser")

      showToast("Login successful", "success")
      navigate("/dashboard")

    } catch (error) {
      console.error(error)
      showToast("Invalid credentials", "error")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95 shadow-[0_30px_90px_-30px_rgba(2,6,23,0.95)] md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-slate-900 to-sky-500 p-8 text-white md:flex">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl" />
            <div className={`relative z-10 flex h-full w-full items-center justify-center transition-all duration-700 ${showSuggestions ? "pointer-events-none opacity-0 -translate-x-6" : "opacity-100 translate-x-0"}`}>
              <div className="text-center">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-100">
                  CampusCare
                </div>
                <h2 className="mt-6 text-3xl font-semibold">Secure access</h2>
                <p className="mt-3 max-w-xs text-sm leading-7 text-slate-200">Manage maintenance requests, track work progress, and coordinate with the team from a single command center.</p>
              </div>
            </div>

            <div className={`absolute inset-0 z-20 flex items-center justify-center p-6 transition-all duration-700 ${showSuggestions ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-6"}`}>
              <div className="w-full max-w-sm rounded-[1.5rem] border border-white/15 bg-slate-950/60 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">Choose an account</p>
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Secure</span>
                </div>
                <div className="mt-4 space-y-2">
                  {savedAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleSelectAccount(account)}
                      className="flex w-full items-center justify-between rounded-[0.95rem] border border-white/10 bg-white/10 px-3 py-3 text-left transition hover:border-indigo-300 hover:bg-white/20"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{account.name || account.email}</p>
                        <p className="text-xs text-slate-300">{account.email}</p>
                      </div>
                      <span className="text-xs font-medium text-indigo-200">Use</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center md:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Welcome back</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to your account</h1>
                <p className="mt-2 text-sm text-slate-400">Access the maintenance dashboard with your university credentials.</p>
              </div>

              {showRecovery && (
                <div className="mb-4 rounded-[1rem] border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-sm font-semibold text-slate-200">Recover your account</p>
                  <p className="mt-2 text-sm text-slate-400">Enter your email to receive a one-time recovery code and create a new password.</p>

                  <form onSubmit={handleRecoverySubmit} className="mt-4 space-y-3">
                    <input
                      type="email"
                      value={recoveryEmail || formData.email}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="w-full rounded-[0.95rem] border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400"
                      required
                    />

                    {recoveryStep === "reset" && (
                      <>
                        <div className="rounded-[0.85rem] border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                          Recovery code: <span className="font-semibold">{recoveryCode || "Check your response"}</span>
                        </div>
                        <input
                          type="text"
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value)}
                          placeholder="Enter recovery code"
                          className="w-full rounded-[0.95rem] border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400"
                          required
                        />
                        <input
                          type="password"
                          value={newRecoveryPassword}
                          onChange={(e) => setNewRecoveryPassword(e.target.value)}
                          placeholder="New password"
                          className="w-full rounded-[0.95rem] border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400"
                          required
                        />
                      </>
                    )}

                    {recoveryMessage && <p className="text-sm text-emerald-400">{recoveryMessage}</p>}
                    {recoveryError && <p className="text-sm text-rose-400">{recoveryError}</p>}

                    <button
                      type="submit"
                      className="w-full rounded-[0.95rem] border border-indigo-500/40 bg-indigo-500/10 px-3 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                    >
                      {recoveryStep === "request" ? "Send recovery code" : "Reset password"}
                    </button>
                  </form>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="username"
                    className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500"
                    />
                    <span>Save this account on this device</span>
                  </label>
                  <button type="button" onClick={() => { setShowRecovery((prev) => !prev); setRecoveryError(""); setRecoveryMessage(""); setRecoveryStep("request"); setRecoveryCode(""); setNewRecoveryPassword(""); }} className="text-indigo-400 transition hover:text-indigo-300">Forgot?</button>
                </div>

                <p className="text-xs leading-6 text-slate-500">
                  We keep recent account choices on this device and, when supported by the browser, store passwords through the secure password manager rather than in plain text.
                </p>

                <button
                  type="submit"
                  className="w-full rounded-[1rem] bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90"
                >
                  Sign In
                </button>

                <div className="pt-2 text-center text-sm text-slate-400">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => navigate('/register')} className="font-semibold text-indigo-400 transition hover:text-indigo-300">
                    Register
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

export default Login