import request from "supertest";
import { createApp } from "../app";

describe("App Component Tests", () => {
  const app = createApp();

  describe("GET /", () => {
    test("should return welcome message", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.body).toEqual({
        message: "Welcome to Digital Kudos Wall Backend API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          kudos: "/api/v1/kudos",
        },
      });
    });
  });

  describe("GET /health", () => {
    test("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toMatchObject({
        status: "healthy",
        service: "digital-kudos-wall-backend",
        version: "1.0.0",
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe("GET /api/v1/kudos", () => {
    test("should return empty kudos list", async () => {
      const response = await request(app).get("/api/v1/kudos").expect(200);

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

  describe("GET /nonexistent", () => {
    test("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/nonexistent").expect(404);

      expect(response.body).toMatchObject({
        error: "Not Found",
        message: "Route /nonexistent not found",
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
