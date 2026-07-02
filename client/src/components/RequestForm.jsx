import { useState } from "react"
import axios from "axios"
import { useNotification } from "../context/NotificationContext"

function RequestForm({ fetchRequests }) {

  const user = JSON.parse(localStorage.getItem("user"))

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    severity: "Uncertain",
    image: null,
  })

  const categories = ["IT Support", "Electrical", "Plumbing", "Carpentry", "General Maintenance", "Other"]
  const severities = ["Low", "Medium", "High", "Uncertain"]
  const { showToast } = useNotification()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      const requestData = new FormData()

      requestData.append("title", formData.title)
      requestData.append("description", formData.description)
      requestData.append("location", formData.location)
      requestData.append("category", formData.category)
      requestData.append("severity", formData.severity)

      if (formData.image) {
        requestData.append("image", formData.image)
      }

      await axios.post(
        "http://localhost:5000/api/requests",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      showToast("Request submitted successfully", "success")

      setFormData({
        title: "",
        description: "",
        location: "",
        category: "",
        severity: "Uncertain",
        image: null,
      })

      fetchRequests()
    } catch (error) {
      console.error(error)
      showToast("Failed to submit request", "error")
    }
  }

  // Hide form for admins
  if (user?.role === "admin") {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_80px_-30px_rgba(2,6,23,0.9)] sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Submit request</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Submit Maintenance Request</h2>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
          Quick intake form
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Issue title</label>
          <input
            type="text"
            name="title"
            placeholder="Issue Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
          <textarea
            name="description"
            placeholder="Describe the issue"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full rounded-[1rem] border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
            >
              {severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Optional image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  image: e.target.files[0],
                })
              }
              className="w-full rounded-[1rem] border border-dashed border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-100 hover:file:bg-slate-700"
            />
          </div>
        </div>

        <button type="submit" className="w-full rounded-[1rem] bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90">Submit Request</button>
      </div>
    </form>
  )
}

export default RequestForm