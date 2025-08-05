import { Verifier, VerifierOptions } from "@pact-foundation/pact";
import { Server } from "http";
import { User } from "../../modules/user/domain/user.entity";
import { UserRepository } from "../../modules/user/domain/user.repository";
import setupUserRoutes from "../../modules/user/presentation/routes/user.routes";
import express from "express";
import { Email } from "../../modules/user/domain/value-objects/email";
import { Password } from "../../modules/user/domain/value-objects/password";
import { UniqueEntityID } from "../../shared/domain/unique-entity-id";
import { GetRecipientsUseCase } from "../../modules/user/application/use-cases/get-recipients/get-recipients.use-case";


const mockUserRepository: UserRepository = {
  findByEmail: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue(null),
  deleteAll: jest.fn().mockResolvedValue(null),
  findAllExceptUser: jest.fn().mockResolvedValue([]),
};

describe("Pact Verification", () => {
  let server: Server;
  const port = 8081;


  const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
  const app = express();
  app.use(express.json());
  const userRoutes = setupUserRoutes({ getRecipientsUseCase });
  app.use("/users", userRoutes);

  beforeAll((done) => {
    server = app.listen(port, () => {
      console.log(`Provider service listening on http://localhost:${port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  const pactBrokerUrl = process.env.PACT_BROKER_BASE_URL;
  const pactBrokerToken = process.env.PACT_BROKER_TOKEN;
  const pactUrl = process.env.PACT_URL;
  const gitSha = process.env.GITHUB_SHA || process.env.GIT_COMMIT || "local";
  const branch = process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH || "main";

  // Skip if we don't have either broker config or local pact file
  if (!pactBrokerUrl && !pactUrl) {
    console.log("Skipping Pact verification. Neither PACT_BROKER_BASE_URL nor PACT_URL is set.");
    test("skipping pact verification", () => {});
    return;
  }

  describe("for the user registration and login flows", () => {
    it("validates the expectations of its consumers", () => {
      const opts: VerifierOptions = {
        provider: "DigitalKudosWallBackend",
        providerBaseUrl: `http://localhost:${port}`,
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
          "a user exists with email pact-test@example.com": async () => {
            const hashedPasswordResult = await Password.create("ValidPassword123!");
            const emailResult = Email.create("pact-test@example.com");

            if (hashedPasswordResult.isFailure || emailResult.isFailure) {
              throw new Error("Failed to create test user credentials");
            }

            const existingUser = User.create(
              {
                name: "pact-test-user",
                email: emailResult.getValue(),
                password: hashedPasswordResult.getValue(),
                isEmailVerified: false,
                roleId: 1,
              },
              new UniqueEntityID("some-id")
            );

            if (existingUser.isFailure) {
              throw new Error("Failed to create test user");
            }

            (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser.getValue());
            return Promise.resolve("User exists state set up");
          },
        },
      };

      // Configure for Pact Broker if URL is provided
      if (pactBrokerUrl) {
        Object.assign(opts, {
          pactBrokerUrl,
          pactBrokerToken,
          publishVerificationResult: true,
          providerVersion: gitSha,
          providerVersionBranch: branch,
          consumerVersionSelectors: [{ mainBranch: true }, { branch }, { deployedOrReleased: true }],
        });
      }
      // Otherwise use local pact file
      else if (pactUrl) {
        opts.pactUrls = [pactUrl];
      }

      return new Verifier(opts).verifyProvider();
    });
  });
});
