const crypto = require("crypto");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const ensureResetTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const ensureRecoveryTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recovery_questions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      question_1 VARCHAR(255) NOT NULL,
      answer_1 VARCHAR(255) NOT NULL,
      question_2 VARCHAR(255) NOT NULL,
      answer_2 VARCHAR(255) NOT NULL,
      question_3 VARCHAR(255) NOT NULL,
      answer_3 VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

ensureResetTable().catch((error) => {
  console.error("Reset table setup failed", error.message);
});

ensureRecoveryTable().catch((error) => {
  console.error("Recovery table setup failed", error.message);
});

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      recoveryQuestions,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [normalizedEmail]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, normalizedEmail, hashedPassword]
    );

    if (recoveryQuestions && recoveryQuestions.length === 3) {
      const [q1, q2, q3] = recoveryQuestions;
      const answerHashes = await Promise.all([
        bcrypt.hash(q1.answer.trim().toLowerCase(), 10),
        bcrypt.hash(q2.answer.trim().toLowerCase(), 10),
        bcrypt.hash(q3.answer.trim().toLowerCase(), 10),
      ]);

      await pool.query(
        `INSERT INTO recovery_questions (user_id, question_1, answer_1, question_2, answer_2, question_3, answer_3)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newUser.rows[0].id,
          q1.question,
          answerHashes[0],
          q2.question,
          answerHashes[1],
          q3.question,
          answerHashes[2],
        ]
      );
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser.rows[0],
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [normalizedEmail]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    const user = await pool.query(
      "SELECT * FROM users WHERE LOWER(email)=LOWER($1)",
      [normalizedEmail]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();

    const hashedCode = await bcrypt.hash(resetCode, 10);

    await pool.query(
      "DELETE FROM password_reset_tokens WHERE user_id=$1",
      [user.rows[0].id]
    );

    await pool.query(
      `INSERT INTO password_reset_tokens
      (user_id, token_hash, expires_at)
      VALUES($1,$2,NOW()+INTERVAL '15 minutes')`,
      [
        user.rows[0].id,
        hashedCode,
      ]
    );

    res.json({
      message:
        "Recovery code generated successfully.",
      recoveryCode: resetCode,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const normalizedEmail = normalizeEmail(email)

    const user = await pool.query(
      `SELECT id FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [normalizedEmail]
    )

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    const questions = await pool.query(
      `
      SELECT
      question_1,
      question_2,
      question_3

      FROM recovery_questions

      WHERE user_id = $1
      `,
      [user.rows[0].id]
    )

    if (questions.rows.length === 0) {
      return res.status(404).json({
        message: "Recovery questions not found",
      })
    }

    res.json({
      userId: user.rows[0].id,
      questions: questions.rows[0],
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

const verifyRecoveryAnswers = async (req, res) => {

  try {

    const {
      userId,
      answers,
    } = req.body

    const result = await pool.query(
      `
      SELECT *

      FROM recovery_questions

      WHERE user_id = $1
      `,
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Recovery questions not found",
      })
    }

    const data = result.rows[0]

    const checks = await Promise.all([
      bcrypt.compare(
        answers[0].trim().toLowerCase(),
        data.answer_1
      ),

      bcrypt.compare(
        answers[1].trim().toLowerCase(),
        data.answer_2
      ),

      bcrypt.compare(
        answers[2].trim().toLowerCase(),
        data.answer_3
      ),
    ])

    if (checks.every(Boolean)) {

      return res.json({
        verified: true,
      })
    }

    res.status(401).json({
      verified: false,
      message: "Incorrect answers",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

const resetPassword = async (req, res) => {

  try {

    const {
      userId,
      password,
    } = req.body

    const hashedPassword =
      await bcrypt.hash(password, 10)

    await pool.query(
      `
      UPDATE users

      SET password = $1

      WHERE id = $2
      `,
      [
        hashedPassword,
        userId,
      ]
    )

    res.json({
      message: "Password updated successfully",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server Error",
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyRecoveryAnswers,
  resetPassword,
};