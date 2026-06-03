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
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-6 mb-8">

      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Submit Maintenance Request</h2>

      <div className="grid gap-4">

        <input
          type="text"
          name="title"
          placeholder="Issue Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-slate-200 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />

        <textarea
          name="description"
          placeholder="Describe the issue"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full border border-slate-200 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-slate-200 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border border-slate-200 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          className="w-full border border-slate-200 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
        </select>

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
          className="w-full border border-slate-200 p-3 rounded-lg text-slate-900"
        />

        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium">Submit Request</button>

      </div>

    </form>
  )
}

export default RequestForm