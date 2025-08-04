import { TokenGenerationService } from "../../domain/token-generation.service";

export class SimpleTokenGenerationService implements TokenGenerationService {
  private readonly TOKEN_EXPIRY_MINUTES = 30;

  generateToken(userId: string): string {
    const timestamp = Date.now();
    const expiryTime = timestamp + this.TOKEN_EXPIRY_MINUTES * 60 * 1000; // 30 minutes
    return Buffer.from(`${userId}:${expiryTime}`).toString("base64");
  }
}
