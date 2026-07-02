import { useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  requestPasswordReset,
  resetPassword,
} from "../services/authService"

import { useNotification } from "../context/NotificationContext"

function ForgotPassword() {

  const navigate = useNavigate()

  const { showToast } = useNotification()

  const [step, setStep] = useState(1)

  const [userId, setUserId] = useState(null)

  const [email, setEmail] = useState("")

  const [questions, setQuestions] = useState({})

  const [answers, setAnswers] = useState([
    "",
    "",
    "",
  ])

  const [password, setPassword] = useState("")

  const handleEmailSubmit = async (e) => {

    e.preventDefault()

    try {

      const data =
        await requestPasswordReset(email)

      setQuestions(data.questions)

      setUserId(data.userId)

      setStep(2)

    } catch {

      showToast(
        "Email not found",
        "error"
      )
    }
  }

  const verifyAnswers = async (e) => {

    e.preventDefault()

    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/verify-recovery",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            userId,

            answers,

          }),
        }
      )

      const data = await response.json()

      if (!response.ok)
        throw new Error()

      if (data.verified) {

        setStep(3)

      }

    } catch {

      showToast(
        "Incorrect answers",
        "error"
      )
    }
  }

  const changePassword = async (e) => {

    e.preventDefault()

    try {

      await resetPassword({

        userId,

        password,

      })

      showToast(
        "Password changed successfully",
        "success"
      )

      navigate("/")

    } catch {

      showToast(
        "Unable to reset password",
        "error"
      )
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-950">

      <div className="bg-slate-900 p-8 rounded-xl w-full max-w-md">

        <h1 className="text-3xl text-white font-bold mb-6">

          Password Recovery

        </h1>

        {step === 1 && (

          <form
            onSubmit={handleEmailSubmit}
            className="space-y-4"
          >

            <input

              type="email"

              placeholder="Email"

              value={email}

              onChange={(e)=>

                setEmail(e.target.value)

              }

              className="w-full p-3 rounded bg-slate-800 text-white"

              required

            />

            <button

              className="w-full bg-indigo-600 text-white p-3 rounded"

            >

              Continue

            </button>

          </form>

        )}

        {step === 2 && (

          <form
            onSubmit={verifyAnswers}
            className="space-y-4"
          >

            <div>

              <label className="text-white">

                {questions.question_1}

              </label>

              <input

                value={answers[0]}

                onChange={(e)=>{

                  const arr=[...answers]

                  arr[0]=e.target.value

                  setAnswers(arr)

                }}

                className="w-full p-3 rounded bg-slate-800 text-white"

              />

            </div>

            <div>

              <label className="text-white">

                {questions.question_2}

              </label>

              <input

                value={answers[1]}

                onChange={(e)=>{

                  const arr=[...answers]

                  arr[1]=e.target.value

                  setAnswers(arr)

                }}

                className="w-full p-3 rounded bg-slate-800 text-white"

              />

            </div>

            <div>

              <label className="text-white">

                {questions.question_3}

              </label>

              <input

                value={answers[2]}

                onChange={(e)=>{

                  const arr=[...answers]

                  arr[2]=e.target.value

                  setAnswers(arr)

                }}

                className="w-full p-3 rounded bg-slate-800 text-white"

              />

            </div>

            <button

              className="w-full bg-indigo-600 text-white p-3 rounded"

            >

              Verify

            </button>

          </form>

        )}

        {step === 3 && (

          <form
            onSubmit={changePassword}
            className="space-y-4"
          >

            <input

              type="password"

              placeholder="New Password"

              value={password}

              onChange={(e)=>

                setPassword(e.target.value)

              }

              className="w-full p-3 rounded bg-slate-800 text-white"

            />

            <button

              className="w-full bg-green-600 text-white p-3 rounded"

            >

              Reset Password

            </button>

          </form>

        )}

      </div>

    </div>

  )

}

export default ForgotPassword