import axios, { AxiosInstance } from "axios"

const api: AxiosInstance = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("easyhealth_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("easyhealth_token")
      localStorage.removeItem("easyhealth_user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export const auth = {
  register: (data: any) => api.post("/auth/register", data).then((r) => r.data),
  login: (data: any) => api.post("/auth/login", data).then((r) => r.data),
  verifyProfessional: (id: string) => api.patch(`/auth/verify/${id}`).then((r) => r.data),
  me: () => api.post("/auth/me").then((r) => r.data),
}

export const patients = {
  create: (data: any) => api.post("/patients", data).then((r) => r.data),
  findAll: () => api.get("/patients").then((r) => r.data),
  findOne: (id: string) => api.get(`/patients/${id}`).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/patients/${id}`).then((r) => r.data),
}

export const sharing = {
  generateCode: (data: any) => api.post("/sharing/generate", data).then((r) => r.data),
  accessByCode: (code: string) => api.post("/sharing/access", { code }).then((r) => r.data),
  getCodes: (patientRecordId: string) => api.get(`/sharing/codes/${patientRecordId}`).then((r) => r.data),
}

export const audit = {
  findAll: () => api.get("/audit").then((r) => r.data),
  findByPatient: (id: string) => api.get(`/audit/patient/${id}`).then((r) => r.data),
  findByUser: (id: string) => api.get(`/audit/user/${id}`).then((r) => r.data),
}

export const professionals = {
  findPending: () => api.get("/professionals/pending").then((r) => r.data),
  verify: (id: string) => api.post(`/professionals/verify/${id}`).then((r) => r.data),
  reject: (id: string, reason: string) => api.post(`/professionals/reject/${id}`, { reason }).then((r) => r.data),
}

export default api
