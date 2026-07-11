import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { PatientRecord } from "./patient.entity"
import { User } from "../auth/user.entity"

export enum ClinicalEntryType {
  CONSULTATION = "consultation",
  NOTE = "note",
  PRESCRIPTION = "prescription",
  RESULTAT = "resultat",
  ANTECEDENT = "antecedent",
  ALLERGIE = "allergie",
  TRAITEMENT = "traitement",
}

@Entity("clinical_entries")
export class ClinicalEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  patientRecordId: string

  @ManyToOne(() => PatientRecord, (record) => record.clinicalEntries)
  @JoinColumn({ name: "patient_record_id" })
  patientRecord: PatientRecord

  @Column({ nullable: true })
  authorId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "author_id" })
  author: User

  @Column({ type: "simple-enum", enum: ClinicalEntryType })
  entryType: ClinicalEntryType

  @Column({ type: "text" })
  content: string

  @Column({ type: "text", nullable: true })
  metadata?: string

  @Column({ type: "varchar", nullable: true })
  clientId?: string

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: "timestamp", nullable: true })
  recordedAt?: Date
}
