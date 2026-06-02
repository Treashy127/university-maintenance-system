const express = require("express")
const upload = require("../middleware/uploadMiddleware")

const router = express.Router()

const {
  createRequest,
  getRequests,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
} = require("../controllers/requestController")

const { protect, adminOnly } = require("../middleware/authMiddleware")

router.post(
  "/",
  protect,
  upload.single("image"),
  createRequest
)

router.get("/", protect, getRequests)

router.put(
  "/:id",
  protect,
  updateRequest
)

router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateRequestStatus
)

router.delete(
  "/:id",
  protect,
  deleteRequest
)

module.exports = router