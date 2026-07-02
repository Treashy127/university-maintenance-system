const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyRecoveryAnswers,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Password Recovery
router.post("/forgot-password", forgotPassword);

router.post(
  "/verify-recovery",
  verifyRecoveryAnswers
);

router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;