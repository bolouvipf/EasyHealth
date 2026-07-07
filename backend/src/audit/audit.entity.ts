import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../auth/user.entity"
import { PatientRecord } from "../patients/patient.entity"

export enum AuditAction {
  CONSULTATION = "consultation",
  CREATION = "creation",
  MODIFICATION = "modification",
  SUPPRESSION = "suppression",
  PARTAGE = "partage",
  EXPORT = "export",
  CONNEXION = "connexion",
}

@Entity("audit_logs")
export class AccessLog {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "simple-enum", enum: AuditAction })
  action: AuditAction

  @Column({ nullable: true })
  userId: string

  @ManyToOne(() => User, (user) => user.accessLogs, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({ nullable: true })
  patientRecordId: string

  @ManyToOne(() => PatientRecord, (record) => record.accessLogs, { nullable: true })
  @JoinColumn({ name: "patient_record_id" })
  patientRecord: PatientRecord

  @Column({ type: "text", nullable: true })
  details: string

  @Column({ nullable: true })
  ipAddress: string

  @CreateDateColumn()
  createdAt: Date
}
