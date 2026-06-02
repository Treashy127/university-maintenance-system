import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useNotification } from "../context/NotificationContext"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import RequestForm from "../components/RequestForm"

import { getRequests } from "../services/requestService"

function Dashboard() {

  const navigate = useNavigate()
  const { showToast, showConfirm } = useNotification()

  const [requests, setRequests] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  const user = JSON.parse(
    localStorage.getItem("user")
  )

  const categories = ["IT Support", "Electrical", "Plumbing", "Carpentry", "General Maintenance", "Other"]
  const severities = ["Low", "Medium", "High", "Uncertain"]
  const technicians = ["IT Department", "Electrical Team", "Plumbing Team", "Carpentry Team"]

  const fetchRequests = async () => {

    try {

      const data = await getRequests()

      setRequests(data)

    } catch (error) {

      console.error(error)
      showToast("Failed to fetch requests", "error")
    }
  }

  useEffect(() => {

    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/")
      return
    }

    const loadRequests = async () => {
      await fetchRequests()
    }

    loadRequests()

  }, [navigate])

  const updateStatus = async (id, status, technician_assigned) => {
  try {
    const token = localStorage.getItem("token")
    // If a technician is being assigned and the status isn't already In Progress
    // or Resolved, automatically mark the request as In Progress.
    let newStatus = status
    if (technician_assigned && technician_assigned !== "" && status !== "In Progress" && status !== "Resolved") {
      newStatus = "In Progress"
    }

    // Optimistic UI update: update local state immediately
    const previousRequests = [...requests]
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, technician_assigned: technician_assigned || r.technician_assigned } : r))

    try {
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ status: newStatus, technician_assigned }),
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Status update failed', res.status, body)
        // Revert on failure
        setRequests(previousRequests)
        showToast(body.message || 'Failed to update status', 'error')
        return
      }

      // Refresh to sync with server
      await fetchRequests()
    } catch (err) {
      console.error('Status update error', err)
      setRequests(previousRequests)
      showToast(err.message || 'Failed to update status', 'error')
      return
    }

      } catch (error) {

        console.error(error)

        showToast("Failed to update status", "error")
      }
    }

  const editRequest = (request) => {
    setEditingId(request.id)
    setEditFormData({
      title: request.title,
      description: request.description,
      location: request.location,
      category: request.category,
      severity: request.severity,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem("token")

      await fetch(
        `http://localhost:5000/api/requests/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(editFormData),
        }
      )

      fetchRequests()
      setEditingId(null)
      setEditFormData({})

    } catch (error) {

      console.error(error)
      showToast("Failed to update request", "error")
    }
  }

  const deleteRequest = async (id) => {
    const confirmed = await showConfirm("Are you sure you want to delete this request? This action cannot be undone.")
    if (!confirmed) return

    try {

    const token = localStorage.getItem("token")

    await fetch(
      `http://localhost:5000/api/requests/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    fetchRequests()

    } catch (error) {

      console.error(error)

      showToast("Failed to delete request", "error")
    }
  }

  const handleLogout = () => {

    localStorage.removeItem("token")

    navigate("/")
  }

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "Pending").length,
    inProgress: requests.filter(r => r.status === "In Progress").length,
    resolved: requests.filter(r => r.status === "Resolved").length,
  }

  // Prepare data for pie chart
  const statusData = [
    { name: "Pending", value: stats.pending, fill: "#f3f4f6" },
    { name: "In Progress", value: stats.inProgress, fill: "#fcd34d" },
    { name: "Resolved", value: stats.resolved, fill: "#86efac" },
  ]

  // Prepare data for timeline chart (requests per day)
  const timelineData = {}
  requests.forEach(req => {
    const date = new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    timelineData[date] = (timelineData[date] || 0) + 1
  })
  const timelineChartData = Object.entries(timelineData).map(([date, count]) => ({
    date,
    count,
  })).slice(-7) // Show last 7 days

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 py-12">

      <div className="max-w-7xl mx-auto px-4">

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_40px_120px_-30px_rgba(15,23,42,0.85)] mb-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute left-0 top-1/2 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative flex flex-col lg:flex-row justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 px-5 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg shadow-indigo-500/20">
                CampusCare Command Center
              </div>
              <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">{user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{user?.role === 'admin' ? 'Monitor request flow, team coordination, and service performance in a clean executive view.' : 'View your submitted requests, track status updates, and communicate with assigned technicians.'}</p>
            </div>

            <div className="grid gap-4 w-full max-w-sm">
              <div className="rounded-[2rem] bg-slate-950/95 p-6 shadow-2xl border border-white/10">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Signed in as</p>
                <p className="mt-3 text-xl font-semibold text-white">{user?.name || user?.email}</p>
                        <p className="mt-1 text-sm text-slate-400">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-[2rem] bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg transition hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-4 mb-10">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Total Requests</p>
            <p className="mt-4 text-4xl font-semibold text-white">{stats.total}</p>
            <p className="mt-2 text-sm text-slate-400">All active and historical maintenance tickets.</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Pending</p>
            <p className="mt-4 text-4xl font-semibold text-indigo-200">{stats.pending}</p>
            <p className="mt-2 text-sm text-slate-400">Requests waiting for review or assignment.</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">In Progress</p>
            <p className="mt-4 text-4xl font-semibold text-sky-200">{stats.inProgress}</p>
            <p className="mt-2 text-sm text-slate-400">Active work items currently being handled.</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Resolved</p>
            <p className="mt-4 text-4xl font-semibold text-emerald-200">{stats.resolved}</p>
            <p className="mt-2 text-sm text-slate-400">Issues successfully closed and archived.</p>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_35px_80px_-20px_rgba(15,23,42,0.8)] mb-10">
          <div className="absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Insights</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Operational intelligence</h2>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">Last 7 days</div>
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">Status Distribution</p>
                  <p className="mt-2 text-lg font-semibold text-white">Where requests stand</p>
                </div>
                <div className="rounded-full bg-slate-800/80 px-4 py-2 text-sm text-slate-200">{stats.total} total</div>
              </div>
              {stats.total > 0 ? (
                <div className="flex items-center gap-6">
                  <PieChart width={220} height={220}>
                    <Pie
                      data={statusData}
                      cx={110}
                      cy={110}
                      labelLine={false}
                      label={false}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Requests"]} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#e2e8f0' }} />
                  </PieChart>

                  <div className="flex-1">
                    {statusData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <span className="w-4 h-4 rounded" style={{ background: entry.fill }} />
                          <div>
                            <div className="text-sm font-semibold text-white">{entry.name}</div>
                            <div className="text-sm text-slate-400">{entry.value} requests</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-white">{Math.round((entry.value / stats.total) * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-500">No request activity yet</div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">Activity Timeline</p>
                  <p className="mt-2 text-lg font-semibold text-white">Requests created over time</p>
                </div>
                <div className="rounded-full bg-slate-800/80 px-4 py-2 text-sm text-slate-200">Trend view</div>
              </div>
              {timelineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#e2e8f0' }} />
                    <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ fill: '#38bdf8', r: 6 }}
                      activeDot={{ r: 8 }}
                      name="Requests Created"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-500">No activity data</div>
              )}
            </div>
          </div>
        </section>

        <RequestForm fetchRequests={fetchRequests} />

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_35px_80px_-20px_rgba(15,23,42,0.8)]">
          <div className="absolute -right-16 top-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Request Portfolio</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Review, update, and assign requests from a polished, presentation-ready dashboard.</p>
            </div>
            <div className="rounded-full bg-slate-800/80 px-4 py-2 text-sm text-slate-200">{requests.length} requests</div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {requests.map((request) => (
              editingId === request.id ? (
                <div key={request.id} className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-2xl">
                  <h3 className="text-xl font-semibold text-white mb-4">Edit Request</h3>
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                      placeholder="Title"
                    />
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 min-h-[120px]"
                      placeholder="Description"
                    />
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                      placeholder="Location"
                    />
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select
                      value={editFormData.severity}
                      onChange={(e) => setEditFormData({...editFormData, severity: e.target.value})}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                    >
                      {severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => saveEdit(request.id)}
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 text-white font-semibold shadow-lg transition hover:opacity-90"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-slate-200 font-semibold transition hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div key={request.id} className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-2xl transition hover:-translate-y-1 hover:shadow-[0_30px_70px_-30px_rgba(15,23,42,0.8)]">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{request.title}</h3>
                        <p className="mt-2 text-sm text-slate-400">Created by <span className="font-semibold text-slate-100">{request.created_by || request.name || 'Unknown'}</span></p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${request.status === 'Resolved' ? 'bg-emerald-100 text-emerald-900' : request.status === 'In Progress' ? 'bg-sky-100 text-sky-900' : 'bg-amber-100 text-amber-900'}`}>{request.status}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${request.severity === 'High' ? 'bg-red-100 text-red-900' : request.severity === 'Medium' ? 'bg-yellow-100 text-yellow-900' : request.severity === 'Low' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-800 text-slate-100'}`}>{request.severity} Priority</span>
                      {request.technician_assigned && (
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100">{request.technician_assigned}</span>
                      )}
                    </div>

                    <p className="text-sm leading-7 text-slate-300">{request.description}</p>

                    <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-300">
                      <div className="rounded-2xl bg-slate-900 border border-white/10 p-4">
                        <p className="font-semibold text-slate-100">Location</p>
                        <p className="mt-1 text-slate-400">{request.location}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-900 border border-white/10 p-4">
                        <p className="font-semibold text-slate-100">Category</p>
                        <p className="mt-1 text-slate-400">{request.category}</p>
                      </div>
                    </div>

                    {user?.role === "admin" ? (
                      <div className="space-y-3 pt-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select
                            onChange={(e) => updateStatus(request.id, e.target.value, request.technician_assigned)}
                            value={request.status}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <select
                            onChange={(e) => updateStatus(request.id, request.status, e.target.value)}
                            value={request.technician_assigned || ""}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                          >
                            <option value="">Assign Technician</option>
                            {technicians.map(tech => <option key={tech} value={tech}>{tech}</option>)}
                          </select>
                        </div>
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          Delete Request
                        </button>
                      </div>
                    ) : (
                      request.user_id === user?.id && (
                        <div className="grid gap-3 sm:grid-cols-2 pt-4">
                          <button
                            onClick={() => editRequest(request)}
                            className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
                          >
                            Edit Request
                          </button>
                          <button
                            onClick={() => deleteRequest(request.id)}
                            className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                          >
                            Delete Request
                          </button>
                        </div>
                      )
                    )}

                    {request.image_url && (
                      <img
                        src={`http://localhost:5000/uploads/${request.image_url}`}
                        alt="Maintenance Issue"
                        className="mt-4 w-full rounded-3xl object-cover shadow-sm"
                      />
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

      </div>

    </div>
  )
}

export default Dashboard