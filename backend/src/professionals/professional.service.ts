import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { ProfessionalVerification } from "./professional.entity";
import { User } from "../auth/user.entity";

@Injectable()
export class ProfessionalService {
    constructor(
        @InjectRepository(ProfessionalVerification)
        private readonly verificationRepository: Repository<ProfessionalVerification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private stripPassword(user: User) {
        const { password, ...rest } = user;
        return rest;
    }

    async createVerification(userId: string, licenseNumber: string, establishment?: string) {
        const existing = await this.verificationRepository.findOne({ where: { userId } });
        if (existing) return existing;

        const verification = this.verificationRepository.create({
            userId,
            user: { id: userId } as User,
            licenseNumber,
            establishment,
            status: "pending",
        });
        return this.verificationRepository.save(verification);
    }

    async findPending() {
        const verifications = await this.verificationRepository.find({ where: { status: "pending" } });
        if (verifications.length === 0) return [];
        const userIds = verifications.map((v) => v.userId).filter(Boolean);
        const users = userIds.length
            ? await this.userRepository.find({ where: { id: In(userIds) } })
            : [];
        const userMap = new Map(users.map((u) => [u.id, this.stripPassword(u)]));
        return verifications.map((v) => ({
            ...v,
            user: v.userId ? userMap.get(v.userId) ?? null : null,
        }));
    }

    async findById(id: string) {
        const professional = await this.verificationRepository.findOne({ where: { id } });
        if (!professional) throw new NotFoundException("Professionnel introuvable");
        if (professional.userId) {
            const user = await this.userRepository.findOne({ where: { id: professional.userId } });
            return { ...professional, user: user ? this.stripPassword(user) : null };
        }
        return professional;
    }

    async rejectProfessional(id: string, reason: string) {
        const professional = await this.verificationRepository.findOne({ where: { id } });
        if (!professional) throw new NotFoundException("Professionnel introuvable");

        professional.status = "rejected";
        professional.rejectionReason = reason;
        await this.verificationRepository.save(professional);
        await this.userRepository.update(professional.userId, { professionalStatus: "rejected" });

        return professional;
    }

    async activateProfessional(id: string, verifiedById: string) {
        const professional = await this.verificationRepository.findOne({ where: { id } });
        if (!professional) throw new NotFoundException("Professionnel introuvable");

        professional.status = "verified";
        professional.verifiedAt = new Date();
        professional.verifiedById = verifiedById;

        await this.verificationRepository.save(professional);
        await this.userRepository.update(professional.userId, { professionalStatus: "verified" });

        return professional;
    }
}