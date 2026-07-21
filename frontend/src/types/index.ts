export type UserRole = "patient" | "medecin" | "infirmier" | "agent_communautaire" | "administratif" | "admin"
export type ProfessionalStatus = "pending" | "verified" | "rejected"

export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  role: UserRole
  telephone?: string
  professionalLicenseNumber?: string
  professionalStatus: ProfessionalStatus
  isActive: boolean
  consentGiven?: boolean
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface PatientRecord {
  id: string
  nom: string
  prenom: string
  dateNaissance?: string
  sexe?: string
  groupeSanguin?: string
  telephone?: string
  adresse?: string
  profession?: string
  consentGiven: boolean
  consentDate?: string
  isActive: boolean
  createdById: string
  clinicalEntries?: ClinicalEntry[]
  createdAt: string
  updatedAt: string
}

export interface ClinicalEntry {
  id: string
  patientRecordId: string
  authorId?: string
  entryType: string
  content: string
  metadata?: any
  specialty?: string
  clientId?: string
  createdAt: string
  recordedAt?: string
}

export type Specialty = "generale" | "neurologie" | "cardiologie"

export interface SharingCodeResponse {
  code: string
  expiresAt: string
  id: string
}

export interface AuditLog {
  id: string
  action: string
  userId?: string
  patientRecordId?: string
  details?: string
  ipAddress?: string
  user?: { nom: string; prenom: string }
  createdAt: string
}
