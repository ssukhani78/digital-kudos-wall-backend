import { Verifier, VerifierOptions } from "@pact-foundation/pact";
import { Server } from "http";
import { createApp } from "../../app";
import { RegisterUserUseCase } from "../../modules/user/application/register-user.use-case";
import { User } from "../../modules/user/domain/user.entity";
import { EmailService } from "../../modules/user/domain/email.service";
import { UserRepository } from "../../modules/user/domain/user.repository";

describe("Pact Verification", () => {
  let server: Server;
  const port = 8081;

  const mockUserRepository: UserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailService: EmailService = {
    sendConfirmationEmail: jest.fn(),
  };

  const registerUserUseCase = new RegisterUserUseCase(mockUserRepository, mockEmailService);
  const app = createApp({ registerUserUseCase });

  beforeAll((done) => {
    server = app.listen(port, () => {
      console.log(`Provider service listening on http://localhost:${port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("for the user registration flow", () => {
    it("validates the expectations of its consumers", () => {
      const opts: VerifierOptions = {
        provider: "DigitalKudosWallBackend",
        providerBaseUrl: `http://localhost:${port}`,
        pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
        pactBrokerToken: process.env.PACT_BROKER_TOKEN,
        consumerVersionSelectors: [{ tag: "main", latest: true }],
        publishVerificationResult: true,
        providerVersion: process.env.GITHUB_SHA || "1.0.0",
        logLevel: "info",
        stateHandlers: {
          "a user with email pact-test@example.com does not exist": async () => {
            (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
            (mockUserRepository.save as jest.Mock).mockImplementation((user: User) => Promise.resolve(user));
            return Promise.resolve("User does not exist state set up");
          },
          "a user with email existing@example.com already exists": async () => {
            (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue({
              id: "any-id",
              email: { value: "existing@example.com" },
            });
            return Promise.resolve("User already exists state set up");
          },
        },
      };

      return new Verifier(opts).verifyProvider();
    });
  });
});
