import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../auth/user.entity"
import { PatientRecord } from "../patients/patient.entity"

@Entity("access_grants")
export class AccessGrant {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  grantorId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "grantor_id" })
  grantor: User

  @Column()
  granteeId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "grantee_id" })
  grantee: User

  @Column()
  patientRecordId: string

  @ManyToOne(() => PatientRecord)
  @JoinColumn({ name: "patient_record_id" })
  patientRecord: PatientRecord

  @Column()
  expiresAt: Date

  @Column({ nullable: true })
  revokedAt: Date

  @CreateDateColumn()
  createdAt: Date
}
