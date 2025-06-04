# Standard Operating Procedure: Narrow Integration Tests

**Status:** Mandatory
**Version:** 1.0
**Date:** {{CURRENT_DATE}}

**NON-NEGOTIABLE STANDARD:** Adherence to this SOP is mandatory for all Narrow Integration Tests. Deviations are not permitted without explicit architectural review and approval.

## 1. Purpose

This SOP defines the standards for writing Narrow Integration Tests within the Digital Kudos Wall backend application. The primary goal is to verify the correct behavior of infrastructure components, particularly their interaction with external systems like databases, message queues, or third-party APIs, within a controlled and narrow scope.

## 2. Scope

This SOP applies to tests written for classes in the infrastructure layer that implement domain interfaces or interact directly with external systems. Common examples include:

- Repository implementations (e.g., `PrismaUserRepository` interacting with a database).
- External service clients (e.g., a client for a payment gateway or notification service).
- Message queue producers/consumers.

These tests align with the "Narrow Integration Tests" category in the Modern Test Pyramid.

## 3. Definitions

- **Narrow Integration Test:** A test that verifies a specific component's integration with a _live (test instance)_ of an external dependency (e.g., a test database, a stubbed external HTTP endpoint). It focuses on the interaction point and ensures the component can correctly send and/or receive data and handle responses from the external dependency.
- **Component:** Refers to the specific infrastructure class under test (e.g., `PrismaUserRepository`).
- **External Dependency:** A system outside the component's direct code, such as a database server, a message broker, or an external HTTP API. For testing, this will typically be a test-dedicated instance or a carefully controlled stub/fake if a live instance is impractical for this test type.

## 4. Key Principles (Non-Negotiable)

### 4.1. Focused Integration

- **Standard:** Tests MUST verify the component's direct interaction with ONE external dependency or a very small, tightly coupled set of external dependencies if inseparable for the component's function.
- **Rationale:** This keeps the test scope narrow, making it easier to pinpoint failures and maintain the test. Broad integration tests that span multiple components and their respective external dependencies are covered by other test types (e.g., Component Tests, Acceptance Tests) and are out of scope for this SOP.

### 4.2. Real Interaction (with Test Instances)

- **Standard:** Tests MUST interact with a real, albeit test-dedicated, instance of the external dependency (e.g., a separate test database schema, a local message queue broker, a wiremocked HTTP service for external APIs).
- **Rationale:** The purpose is to verify the actual communication, data mapping, query correctness, and contract adherence with the external system. Mocking the driver or client library for the external system would defeat the purpose of an integration test.
- **Exception:** If a live test instance is excessively difficult or slow to set up for this specific type of narrow test, a high-fidelity Fake (as per Martin Fowler's definition, see `SOP-TestDoubles.md`) might be permissible with architectural approval, provided it accurately simulates the critical interaction patterns of the real dependency.

### 4.3. Data Isolation and Management

- **Standard:** Each test or test suite MUST manage its own data within the test dependency. Data created by one test should not affect another. This typically involves:
  - Setting up required data before a test (Arrange phase).
  - Cleaning up data after a test (Teardown phase), e.g., by truncating tables, deleting specific records, or resetting state in a message queue.
- **Rationale:** Ensures test independence and repeatability.

### 4.4. Contract Verification

- **Standard:** Tests MUST verify that the component correctly adheres to the expected contract of the external dependency. This includes:
  - Correct data serialization/deserialization.
  - Correct query formation (for databases).
  - Correct request/response handling (for APIs).
  - Proper error handling based on responses from the external dependency.

### 4.5. Testing the Implementation, Not the Interface

- **Standard:** Narrow Integration Tests target the concrete _implementation_ class in the infrastructure layer (e.g., `PrismaUserRepository`), not just the domain interface (`UserRepository`).
- **Rationale:** The goal is to test the specific technology and integration logic within that implementation.

## 5. Test Structure (Arrange-Act-Assert)

- **Standard:** All tests MUST follow the Arrange-Act-Assert (AAA) pattern.

  ```typescript
  // Hypothetical example for a PrismaUserRepository
  describe("PrismaUserRepository - Narrow Integration Tests", () => {
    let userRepository: PrismaUserRepository;
    let prismaTestClient: PrismaClient; // Or your test DB utility

    beforeAll(async () => {
      // Initialize Prisma client for a dedicated test database
      prismaTestClient = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
      await prismaTestClient.$connect();
      userRepository = new PrismaUserRepository(prismaTestClient);
    });

    beforeEach(async () => {
      // Clean database before each test
      await prismaTestClient.user.deleteMany({});
    });

    afterAll(async () => {
      await prismaTestClient.$disconnect();
    });

    it("should save a user and retrieve them by email", async () => {
      // Arrange
      const email = Email.create("test@example.com").getValue();
      const password = Password.create("ValidPass123!").getValue();
      const user = User.create({ email, password }).getValue();

      // Act
      await userRepository.save(user);
      const foundUser = await userRepository.findByEmail(email.value);

      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser!.id.equals(user.id)).toBe(true);
      expect(foundUser!.email.value).toBe(email.value);
    });

    it("should return null when finding a non-existent user by email", async () => {
      // Arrange
      const email = "nonexistent@example.com";

      // Act
      const foundUser = await userRepository.findByEmail(email);

      // Assert
      expect(foundUser).toBeNull();
    });
  });
  ```

## 6. What These Tests Are NOT

- **Not Sociable Unit Tests:** They do not mock the external dependency; they integrate with it.
- **Not Broad Component/E2E Tests:** They focus on a single infrastructure component's interaction, not the entire application flow or inter-service communication.

## 7. Related SOPs

- `SOP-SociableUnitTests.md`
- `SOP-TestDoubles.md` (primarily for understanding _what not to do_ in Narrow Integration Tests, e.g., not mocking the database driver).

## 8. Enforcement

Violation of these standards will result in build failures during CI and/or rejection during code review. These standards are non-negotiable to ensure the reliability of our infrastructure layer integrations.
