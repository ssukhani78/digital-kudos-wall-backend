import { EmailService } from "../../domain/email.service";

export class TestEmailService implements EmailService {
  private static instance: TestEmailService;
  private sentEmails: string[] = [];

  static getInstance(): TestEmailService {
    if (!TestEmailService.instance) {
      TestEmailService.instance = new TestEmailService();
    }
    return TestEmailService.instance;
  }

  async sendConfirmationEmail(email: string): Promise<void> {
    this.sentEmails.push(email);
  }

  getSentEmails(): string[] {
    return [...this.sentEmails];
  }

  wasEmailSentTo(email: string): boolean {
    return this.sentEmails.includes(email);
  }

  reset(): void {
    this.sentEmails = [];
  }
}
