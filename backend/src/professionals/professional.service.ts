import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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

    async createVerification(userId: string, licenseNumber: string, establishment?: string) {
        const existing = await this.verificationRepository.findOne({ where: { userId } });
        if (existing) return existing;

        const verification = this.verificationRepository.create({
            userId,
            licenseNumber,
            establishment,
            status: "pending",
        });
        return this.verificationRepository.save(verification);
    }

    async findPending() {
        const verifications = await this.verificationRepository.find({ where: { status: "pending" }, relations: ["user"] });
        return verifications;
    }

    async findById(id: string) {
        const professional = await this.verificationRepository.findOne({ where: { id }, relations: ["user"] });
        if (!professional) throw new NotFoundException("Professionnel introuvable");
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