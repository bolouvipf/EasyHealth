import { Injectable } from "@nestjs/common"

@Injectable()
export class TokenBlacklistService {
  private readonly blacklist = new Set<string>()

  add(jti: string) {
    this.blacklist.add(jti)
  }

  has(jti: string): boolean {
    return this.blacklist.has(jti)
  }

  clear() {
    this.blacklist.clear()
  }
}
