import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
})

export const registerUser = async (userData) => {
  const response = await API.post("/register", userData)
  return response.data
}
export const requestPasswordReset = async (email) => {
  const response = await API.post("/forgot-password", { email })
  return response.data
}

export const resetPassword = async (payload) => {
  const response = await API.post("/reset-password", payload)
  return response.data
}
export const loginUser = async (userData) => {
  const response = await API.post("/login", userData)
  return response.data
}