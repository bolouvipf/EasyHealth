import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "../auth/user.entity";

@Entity("professional_verifications")
export class ProfessionalVerification {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    userId: string;

    @Column()
    licenseNumber: string;

    @Column({ nullable: true })
    issuingAuthority: string;

    @Column({ nullable: true })
    speciality: string;

    @Column({ nullable: true })
    establishment: string;

    @Column({ default: "pending" })
    status: string;

    @Column({ nullable: true })
    verifiedAt: Date;

    @Column({ nullable: true })
    verifiedById: string;

    @Column({ nullable: true })
    rejectionReason: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}