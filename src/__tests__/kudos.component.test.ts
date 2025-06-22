import request from "supertest";
import { createApp } from "../app";
import { RegisterUserUseCase } from "../modules/user/application/register-user.use-case";
import { UserRepository } from "../modules/user/domain/user.repository";
import { EmailService } from "../modules/user/domain/email.service";

describe("Kudos Component Tests", () => {
  let mockUserRepository: UserRepository;
  let mockEmailService: EmailService;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
    };

    mockEmailService = {
      sendConfirmationEmail: jest.fn(),
    };
  });

  describe("GET /kudos", () => {
    test("should return empty kudos list", async () => {
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(mockUserRepository, mockEmailService),
      });
      const response = await request(app).get("/kudos").expect(200);

      expect(response.body).toEqual({
        message: "Digital Kudos Wall API - MVP Version",
        kudos: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
        },
      });
    });
  });
});
