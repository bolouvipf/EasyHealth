import axios from "axios"

let _refreshToken: string | null = null
let _refreshPromise: Promise<string | null> | null = null
let _onLogout: (() => void) | null = null

export function setStoredRefreshToken(t: string | null) {
  _refreshToken = t
}

export function getStoredRefreshToken() {
  return _refreshToken
}

export function setLogoutHandler(fn: () => void) {
  _onLogout = fn
}

async function doRefresh(): Promise<string | null> {
  const rt = _refreshToken
  if (!rt) {
    _onLogout?.()
    return null
  }
  try {
    const res = await axios.post(API_BASE + "/auth/refresh", { refreshToken: rt })
    _refreshToken = res.data.refreshToken
    localStorage.setItem("easyhealth_token", res.data.accessToken)
    return res.data.accessToken
  } catch {
    _refreshToken = null
    localStorage.removeItem("easyhealth_token")
    localStorage.removeItem("easyhealth_user")
    _onLogout?.()
    return null
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!_refreshPromise) {
    _refreshPromise = doRefresh().finally(() => {
      _refreshPromise = null
    })
  }
  return _refreshPromise
}

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1"

const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("easyhealth_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
    }
    return Promise.reject(err)
  },
)

export const auth = {
  register: (data: any) => api.post("/auth/register", data).then((r) => r.data),
  login: (data: any) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  forgotPassword: (data: any) => api.post("/auth/forgot-password", data).then((r) => r.data),
  resetPassword: (data: any) => api.post("/auth/reset-password", data).then((r) => r.data),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }).then((r) => r.data),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }).then((r) => r.data),
  logoutAll: () => api.post("/auth/logout-all").then((r) => r.data),
}

export const patients = {
  findAll: () => api.get("/patients").then((r) => r.data?.data ?? r.data),
  findAllPaginated: (page = 1, limit = 20) => api.get("/patients", { params: { page, limit } }).then((r) => r.data),
  findOne: (id: string) => api.get(`/patients/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/patients", data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/patients/${id}`).then((r) => r.data),
  addClinicalEntry: (id: string, data: any) => api.post(`/patients/${id}/entries`, data).then((r) => r.data),
  getClinicalEntries: (id: string) => api.get(`/patients/${id}/entries`).then((r) => r.data?.data ?? r.data),
  getClinicalEntriesPaginated: (id: string, page = 1, limit = 20) =>
    api.get(`/patients/${id}/entries`, { params: { page, limit } }).then((r) => r.data),
}

export const sharing = {
  generateCode: (data: any) => api.post("/sharing/generate", data).then((r) => r.data),
  accessByCode: (code: string) => api.post("/sharing/access", { code }).then((r) => r.data),
  getCodes: () => api.get("/sharing/codes").then((r) => r.data),
}

export const audit = {
  findAll: () => api.get("/audit").then((r) => r.data),
  findByPatient: (id: string) => api.get(`/audit/patient/${id}`).then((r) => r.data),
  findByUser: (id: string) => api.get(`/audit/user/${id}`).then((r) => r.data),
}

export const professionals = {
  findPending: () => api.get("/professionals/pending").then((r) => r.data),
  verify: (id: string) => api.post(`/professionals/${id}/verify`).then((r) => r.data),
  reject: (id: string, reason: string) => api.post(`/professionals/${id}/reject`, { reason }).then((r) => r.data),
}

export const admin = {
  getStats: () => api.get("/admin/stats").then((r) => r.data),
  getUsers: () => api.get("/admin/users").then((r) => r.data),
  toggleUserActive: (id: string) => api.post(`/admin/users/${id}/toggle-active`).then((r) => r.data),
}

export const dashboard = {
  getDashboard: () => api.get("/dashboard").then((r) => r.data),
}
