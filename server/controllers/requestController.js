const fs = require("fs")
const path = require("path")
const pool = require("../config/db")

const createRequest = async (req, res) => {
  try {
    const { title, description, location, category, severity } = req.body

    const image_url = req.file ? req.file.filename : null

    const newRequest = await pool.query(
      `
      INSERT INTO maintenance_requests
      (title, description, location, category, severity, image_url, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [title, description, location, category, severity || "Uncertain", image_url, req.user.id]
    )

    res.status(201).json(newRequest.rows[0])
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      message: "Server Error",
    })
  }
}

const getRequests = async (req, res) => {
  try {
    let requests

    if (req.user && req.user.role === "admin") {
      requests = await pool.query(
        `
        SELECT r.*, u.name AS created_by
        FROM maintenance_requests r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
        `
      )
    } else {
      requests = await pool.query(
        `
        SELECT r.*, u.name AS created_by
        FROM maintenance_requests r
        JOIN users u ON r.user_id = u.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
        `,
        [req.user.id]
      )
    }

    res.status(200).json(requests.rows)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      message: "Server Error",
    })
  }
}

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, technician_assigned } = req.body

    // Debug: log who is attempting the update and the payload
    console.error('updateRequestStatus called', { user: req.user, id, status, technician_assigned })

    // Ensure the technician_assigned column exists (handle older DBs)
    const colCheck = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'maintenance_requests' AND column_name = 'technician_assigned'`
    )

    if (colCheck.rows.length === 0) {
      console.error('technician_assigned column missing — creating column')
      await pool.query(`ALTER TABLE maintenance_requests ADD COLUMN technician_assigned VARCHAR(100)`)    
    }

    const updatedRequest = await pool.query(
      `
      UPDATE maintenance_requests
      SET status = $1, technician_assigned = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [status, technician_assigned || null, id]
    )

    if (updatedRequest.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    res.status(200).json(updatedRequest.rows[0])
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      message: "Server Error",
    })
  }
}

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, location, category, severity } = req.body
    const userId = req.user.id

    // Check if request belongs to user
    const requestCheck = await pool.query(
      `SELECT * FROM maintenance_requests WHERE id = $1 AND user_id = $2`,
      [id, userId]
    )

    if (requestCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to edit this request" })
    }

    const updatedRequest = await pool.query(
      `
      UPDATE maintenance_requests
      SET title = $1, description = $2, location = $3, category = $4, severity = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [title, description, location, category, severity, id]
    )

    res.status(200).json(updatedRequest.rows[0])
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      message: "Server Error",
    })
  }
}

const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    // Check authorization: user can delete own requests, admin can delete any
    const requestCheck = await pool.query(
      `SELECT * FROM maintenance_requests WHERE id = $1`,
      [id]
    )

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    if (userRole !== "admin" && requestCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this request" })
    }

    const deletedRequest = await pool.query(
      `
      DELETE FROM maintenance_requests
      WHERE id = $1
      RETURNING *
      `,
      [id]
    )

    const deletedRow = deletedRequest.rows[0]

    if (deletedRow.image_url) {
      const imagePath = path.join(__dirname, "..", "uploads", deletedRow.image_url)
      fs.unlink(imagePath, (unlinkError) => {
        if (unlinkError && unlinkError.code !== "ENOENT") {
          console.error("Error deleting uploaded image:", unlinkError)
        }
      })
    }

    res.status(200).json({ message: "Request deleted successfully" })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: "Server Error",
    })
  }
}

module.exports = {
  createRequest,
  getRequests,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
}
