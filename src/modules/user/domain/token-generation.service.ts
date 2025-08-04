export interface TokenGenerationService {
  generateToken(userId: string): string;
}
