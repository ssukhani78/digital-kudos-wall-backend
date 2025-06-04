export interface EmailService {
  sendConfirmationEmail(email: string): Promise<void>;
}
