# Standard Operating Procedure: Component Tests

**Status:** Mandatory
**Version:** 1.0
**Date:** {{CURRENT_DATE}}

**NON-NEGOTIABLE STANDARD:** Adherence to this SOP is mandatory for all Component Tests. Deviations are not permitted without explicit architectural review and approval.

## 1. Purpose

This SOP defines the standards for writing Component Tests for the Digital Kudos Wall backend application. The goal is to verify that a component, typically encompassing a full use case from the web layer down to the application layer, is correctly wired and behaves as expected, while remaining isolated from other components and external infrastructure.

## 2. Scope

This SOP applies to tests that exercise a slice of the application's functionality through its entry point (e.g., an HTTP request) but use test doubles for all out-of-process dependencies (like databases, external APIs, and message queues).

These tests align with the "Component Tests" category in the Modern Test Pyramid, sitting between Sociable Unit Tests and broader, end-to-end System Tests.

## 3. Definitions

- **Component Test:** An automated test that verifies the behavior of a component through its public-facing interface, with its dependencies replaced by test doubles.
- **Component (in this context):** A group of related classes that collaborate to fulfill a specific piece of business functionality. For our backend, this is typically an Express route, its corresponding controller, and the application use case it invokes.
- **Boundary:** The line between the component under test and its out-of-process dependencies. In our case, the `UserRepository` and `EmailService` interfaces represent the boundaries.

## 4. Key Principles (Non-Negotiable)

### 4.1. Isolate the Component

- **Standard:** The component under test MUST be isolated from its real, out-of-process dependencies. All dependencies at the boundary (e.g., repository and external service interfaces) MUST be replaced with test doubles (stubs/spies).
- **Rationale:** This ensures the test is fast, reliable, and focuses solely on the logic of the component itself, not the behavior of external systems. Failures in a component test point directly to a bug within that component.

### 4.2. Test Through the Public Interface

- **Standard:** Tests MUST interact with the component through its public interface, which for our backend is the HTTP API. Tests will use a library like `supertest` to make real HTTP requests to a test instance of the application.
- **Rationale:** This ensures we are testing the component as its clients (e.g., the frontend) would use it, including HTTP routing, request/response serialization, status codes, and headers.

### 4.3. Use Dependency Injection

- **Standard:** The application MUST be architected to allow dependencies to be injected. The main application entry point (`createApp`) must accept its core dependencies (like use cases) as arguments.
- **Rationale:** Dependency Injection is the key mechanism that enables component testing. It allows us to supply the _real_ dependencies in production and _test doubles_ in a test environment.

## 5. Test Structure (Arrange-Act-Assert)

- **Standard:** All tests MUST follow the Arrange-Act-Assert (AAA) pattern.

  ```typescript
  // Example for the RegisterUser endpoint
  describe("POST /api/v1/users/register", () => {
    it("should return 201 when user is successfully registered", async () => {
      // Arrange
      // 1. Create mock dependencies
      const mockUserRepository: UserRepository = {
        /* jest.fn() mocks */
      };
      const mockEmailService: EmailService = {
        /* jest.fn() mocks */
      };

      // 2. Create the real use case with mock dependencies
      const registerUserUseCase = new RegisterUserUseCase(mockUserRepository, mockEmailService);

      // 3. Create the app with the test-configured use case
      const app = createApp({ registerUserUseCase });

      // 4. Define request body and stub mock responses
      const requestBody = { email: "test@example.com", password: "ValidPassword123!" };
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(undefined);

      // Act
      // 5. Make a real HTTP request to the test app instance
      const response = await request(app).post("/api/v1/users/register").send(requestBody).expect(201);

      // Assert
      // 6. Verify the HTTP response and any interactions with mocks
      expect(response.body.email).toBe(requestBody.email);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(requestBody.email);
    });
  });
  ```

## 6. What These Tests Are NOT

- **Not Unit Tests:** They are not focused on a single class but on the collaboration between several classes (route, controller, use case).
- **Not Integration Tests:** They do not talk to a real database or other live external services. They explicitly use test doubles at the boundaries.

## 7. Related SOPs

- `SOP-SociableUnitTests.md`
- `SOP-NarrowIntegrationTests.md`
- `SOP-TestDoubles.md`

## 8. Enforcement

Violation of these standards will result in build failures during CI and/or rejection during code review. These standards are non-negotiable to ensure the quality and maintainability of our component tests.
