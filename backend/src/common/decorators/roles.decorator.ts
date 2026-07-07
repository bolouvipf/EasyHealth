import { SetMetadata } from "@nestjs/common"

export enum UserRole {
  PATIENT = "patient",
  MEDECIN = "medecin",
  INFIRMIER = "infirmier",
  AGENT_COMMUNAUTAIRE = "agent_communautaire",
  ADMINISTRATIF = "administratif",
  ADMIN = "admin",
}

export const ROLES_KEY = "roles"
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
