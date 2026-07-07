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
  consentGiven: boolean
}

export interface AuthResponse {
  user: User
  token: string
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
  allergies?: string
  antecedentsMedicaux?: string
  traitementsEnCours?: string
  consultations?: string
  notes?: string
  consentGiven: boolean
  isActive: boolean
  consentDate?: string
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface SharingCodeResponse {
  code: string
  expiresAt: string
  id: string
}

export interface AuditLog {
  id: string
  action: string
  userId: string
  patientRecordId?: string
  details?: string
  ipAddress?: string
  createdAt: string
  user?: User
}
