import { useEffect, useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useNotification } from "../context/NotificationContext"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import RequestForm from "../components/RequestForm"

import { getRequests } from "../services/requestService"

function Dashboard() {

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

  const currentView = location.pathname.includes("/insights") ? "insights" : location.pathname.includes("/portfolio") ? "portfolio" : location.pathname.includes("/submit") ? "submit" : "overview"
  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Insights", path: "/dashboard/insights" },
    ...(user?.role === "admin" ? [] : [{ label: "Submit Request", path: "/dashboard/submit" }]),
    { label: "Portfolio", path: "/dashboard/portfolio" },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_70px_-30px_rgba(2,6,23,0.9)] sm:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute left-0 top-1/2 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-8 lg:flex-row">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-slate-200">
                CampusCare Command Center
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{user?.role === 'admin' ? 'Monitor request flow, assign work, and keep maintenance operations moving with a structured command view.' : 'Follow your requests, review updates, and stay in sync with the team from one focused workspace.'}</p>
            </div>

            <div className="grid w-full max-w-sm gap-4">
              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/90 p-5 shadow-inner shadow-slate-950/40">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Signed in as</p>
                <p className="mt-3 text-lg font-semibold text-white">{user?.name || user?.email}</p>
                <p className="mt-1 text-sm text-slate-400">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-[1.25rem] bg-gradient-to-r from-indigo-500 to-sky-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <nav className="mb-6 flex flex-wrap gap-3 rounded-[1.25rem] border border-slate-800 bg-slate-900/95 p-3 shadow-[0_14px_45px_-20px_rgba(2,6,23,0.9)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `rounded-[1rem] px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {currentView === "overview" && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.35rem] border border-slate-800 bg-slate-900/90 p-5 shadow-[0_14px_45px_-20px_rgba(2,6,23,0.9)]">
                <div className="h-1.5 w-16 rounded-full bg-indigo-400" />
                <p className="mt-4 text-sm uppercase tracking-[0.28em] text-slate-400">Total Requests</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stats.total}</p>
                <p className="mt-2 text-sm text-slate-400">All active and historical maintenance tickets.</p>
              </div>

              <div className="rounded-[1.35rem] border border-slate-800 bg-slate-900/90 p-5 shadow-[0_14px_45px_-20px_rgba(2,6,23,0.9)]">
                <div className="h-1.5 w-16 rounded-full bg-slate-400" />
                <p className="mt-4 text-sm uppercase tracking-[0.28em] text-slate-400">Pending</p>
                <p className="mt-3 text-3xl font-semibold text-indigo-200">{stats.pending}</p>
                <p className="mt-2 text-sm text-slate-400">Requests waiting for review or assignment.</p>
              </div>

              <div className="rounded-[1.35rem] border border-slate-800 bg-slate-900/90 p-5 shadow-[0_14px_45px_-20px_rgba(2,6,23,0.9)]">
                <div className="h-1.5 w-16 rounded-full bg-sky-400" />
                <p className="mt-4 text-sm uppercase tracking-[0.28em] text-slate-400">In Progress</p>
                <p className="mt-3 text-3xl font-semibold text-sky-200">{stats.inProgress}</p>
                <p className="mt-2 text-sm text-slate-400">Active work items currently being handled.</p>
              </div>

              <div className="rounded-[1.35rem] border border-slate-800 bg-slate-900/90 p-5 shadow-[0_14px_45px_-20px_rgba(2,6,23,0.9)]">
                <div className="h-1.5 w-16 rounded-full bg-emerald-400" />
                <p className="mt-4 text-sm uppercase tracking-[0.28em] text-slate-400">Resolved</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-200">{stats.resolved}</p>
                <p className="mt-2 text-sm text-slate-400">Issues successfully closed and archived.</p>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_80px_-30px_rgba(2,6,23,0.9)]">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Quick access</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Jump between the key dashboard areas</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-400">Use the navigation above to move between the overview, operational insights, and request portfolio views.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Need a closer look?</p>
                  <div className="mt-4 flex flex-col gap-3">
                    <NavLink to="/dashboard/insights" className="rounded-[1rem] bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Open insights</NavLink>
                    {user?.role !== 'admin' && (
                      <NavLink to="/dashboard/submit" className="rounded-[1rem] bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Open submit request</NavLink>
                    )}
                    <NavLink to="/dashboard/portfolio" className="rounded-[1rem] bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">Open portfolio</NavLink>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {currentView === "insights" && (
          <section className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_80px_-30px_rgba(2,6,23,0.9)]">
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
              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6 shadow-[0_12px_40px_-18px_rgba(2,6,23,0.85)]">
                <div className="mb-5 flex items-center justify-between">
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

              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6 shadow-[0_12px_40px_-18px_rgba(2,6,23,0.85)]">
                <div className="mb-5 flex items-center justify-between">
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
        )}

        {currentView === "submit" && (
          <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_80px_-30px_rgba(2,6,23,0.9)]">
            <RequestForm fetchRequests={fetchRequests} />
          </section>
        )}

        {currentView === "portfolio" && (
          <>
            <section className="mb-6 rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_80px_-30px_rgba(2,6,23,0.9)]">
              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Portfolio</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Request portfolio</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">Review and manage the full request list from one place.</p>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_20px_80px_-30px_rgba(2,6,23,0.9)]">
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
                    <div key={request.id} className="rounded-[1.5rem] border border-slate-800 bg-slate-950/80 p-6 shadow-[0_12px_40px_-18px_rgba(2,6,23,0.85)] transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-[0_18px_50px_-22px_rgba(2,6,23,0.95)]">
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
                                value={request.status || ""}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                              >
                                <option value="" disabled>Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                              <select
                                onChange={(e) => updateStatus(request.id, request.status, e.target.value)}
                                value={request.technician_assigned || ""}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                              >
                                <option value="" disabled>Assign Technician</option>
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
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard