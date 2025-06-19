import { Verifier, VerifierOptions } from "@pact-foundation/pact";
import { Server } from "http";
import { RegisterUserUseCase } from "../../modules/user/application/register-user.use-case";
import { User } from "../../modules/user/domain/user.entity";
import { EmailService } from "../../modules/user/domain/email.service";
import { UserRepository } from "../../modules/user/domain/user.repository";
import setupUserRoutes from "../../modules/user/presentation/user.routes";
import express from "express";

describe("Pact Verification", () => {
  let server: Server;
  const port = 8081;

  const mockUserRepository: UserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    deleteAll: jest.fn(),
  };

  const mockEmailService: EmailService = {
    sendConfirmationEmail: jest.fn(),
  };

  const registerUserUseCase = new RegisterUserUseCase(mockUserRepository, mockEmailService);

  // We create a slimmed down version of the app, only mounting the routes
  // we need for the contract tests.
  const app = express();
  app.use(express.json());
  const userRoutes = setupUserRoutes(registerUserUseCase);
  app.use("/api/v1/users", userRoutes);

  beforeAll((done) => {
    server = app.listen(port, () => {
      console.log(`Provider service listening on http://localhost:${port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  const brokerUrl = process.env.PACT_BROKER_BASE_URL;

  // Only run Pact verification if the broker URL is set
  if (brokerUrl) {
    describe("for the user registration flow", () => {
      it("validates the expectations of its consumers", () => {
        const pactUrl = process.env.PACT_URL;

        const opts: VerifierOptions = {
          provider: "DigitalKudosWallBackend",
          providerBaseUrl: `http://localhost:${port}`,
          pactBrokerUrl: brokerUrl,
          pactBrokerToken: process.env.PACT_BROKER_TOKEN,
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

        if (pactUrl) {
          opts.pactUrls = [pactUrl];
        } else {
          opts.consumerVersionSelectors = [{ tag: "main", latest: true }];
        }

        return new Verifier(opts).verifyProvider();
      });
    });
  } else {
    console.log("Skipping Pact verification. PACT_BROKER_BASE_URL not set.");
    // This empty test is here to prevent Jest from complaining about no tests in a file.
    test("skipping pact verification", () => {});
  }
});
