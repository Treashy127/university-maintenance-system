import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:5000/api/requests",
})

API.interceptors.request.use((req) => {

  const token = localStorage.getItem("token")

  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }

  return req
})

export const getRequests = async () => {

  const response = await API.get("/")

  return response.data
}