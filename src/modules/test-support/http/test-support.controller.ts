import { Request, Response } from "express";
import { CreateTestUserUseCase } from "../application/CreateTestUserUseCase";
import { CleanupTestDataUseCase } from "../application/CleanupTestDataUseCase";
import { TestEmailService } from "../../user/infrastructure/services/test-email.service";
import { RegisterDTO } from "../../auth/application/use-cases/register/register.use-case";

  export class TestSupportController {
  constructor(
    private readonly createTestUserUseCase: CreateTestUserUseCase,
    private readonly cleanupTestDataUseCase: CleanupTestDataUseCase
  ) {}

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, roleId } = req.body as RegisterDTO;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields: name, email, password" });
      }

      const user = await this.createTestUserUseCase.execute({ name, email, password, roleId });
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to create test user",
        message: error.message,
      });
    }
  }

  async cleanup(req: Request, res: Response): Promise<Response> {
    try {
      await this.cleanupTestDataUseCase.execute();
      // Also reset the email service stub
      TestEmailService.getInstance().reset();

      return res.status(200).json({ message: "Test data cleaned up successfully" });
    } catch (error: any) {
      console.error("Failed to cleanup test data:", error);
      return res.status(500).json({
        error: "Failed to cleanup test data",
        message: error.message,
      });
    }
  }

  async verifyEmailSent(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Missing required query parameter: email" });
      }

      const emailService = TestEmailService.getInstance();
      const wasEmailSent = emailService.wasEmailSentTo(email);

      return res.status(200).json({ sent: wasEmailSent });
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to verify email",
        message: error.message,
      });
    }
  }
}
