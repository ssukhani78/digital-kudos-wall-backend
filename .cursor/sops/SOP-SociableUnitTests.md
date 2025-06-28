# Standard Operating Procedure: Sociable Unit Tests

**Status:** Mandatory
**Version:** 1.0
**Date:** {{CURRENT_DATE}}

**NON-NEGOTIABLE STANDARD:** Adherence to this SOP is mandatory for all Sociable Unit Tests. Deviations are not permitted without explicit architectural review and approval.

## 1. Purpose

This SOP defines the standards for writing Sociable Unit Tests within the Digital Kudos Wall backend application. The primary goal is to ensure that our use cases (application services) are tested effectively, verifying their behavior and interactions while remaining decoupled from internal implementation details and fast to execute.

## 2. Scope

This SOP applies to all unit tests written for the application layer, specifically targeting Use Case classes.

## 3. Definitions

- **Sociable Unit Test:** A test that verifies the behavior of a "unit" (e.g., a use case class) by allowing it to collaborate with its direct, genuine dependencies (like value objects or domain entities) but uses Test Doubles for dependencies that cross process boundaries or represent significant external infrastructure (e.g., repositories, email services, external APIs).
- **Unit:** In the context of this SOP, a "unit" typically refers to a Use Case class and its closely related domain objects (Entities, Value Objects) that it orchestrates.

## 4. Key Principles (Non-Negotiable)

### 4.1. Behavior-Driven

- **Standard:** Tests MUST verify the observable behavior of the use case from the perspective of a client calling its public interface (e.g., the `execute` method).
- **Focus:** Test cases should cover primary success scenarios, key business rule enforcement (including failure scenarios like validation errors or domain errors), and significant interactions with direct collaborators.
- **Example:**
  - `it("should successfully register a new user", ...)`
  - `it("should return error when user already exists", ...)`
  - `it("should validate email format", ...)`

### 4.2. Collaboration Strategy

- **Standard A (Real Collaborators):** Use REAL instances of domain objects (Entities, Value Objects) that the use case directly creates or orchestrates.

  - **Rationale:** The behavior of these core domain objects is integral to the use case's functionality. Mocking them would obscure the true behavior being tested.
  - **Example:** When testing `RegisterUserUseCase`, real `Email` and `Password` value objects are created and used.
    ```typescript
    // From a test setup for RegisterUserUseCase
    const emailValueObject = Email.create("test@example.com").getValue();
    const passwordValueObject = Password.create("ValidPass123!").getValue();
    const existingUser = User.create({
      email: emailValueObject,
      password: passwordValueObject,
    }).getValue();
    ```

- **Standard B (Test Doubles for Boundaries):** Use Test Doubles (Stubs or Spies, see `SOP-TestDoubles.md`) for dependencies that represent interfaces to:
  - Infrastructure concerns (e.g., `UserRepository`, `EmailService`).
  - External systems or out-of-process communication.
  - **Rationale:** This ensures tests are fast, deterministic, and focused on the use case logic rather than the implementation details or reliability of external components. The contracts of these interfaces are tested separately (e.g., by Narrow Integration Tests for repository implementations).
  - **Example:**
    ```typescript
    // In beforeEach for RegisterUserUseCase tests
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    emailService = {
      sendConfirmationEmail: jest.fn(),
    };
    useCase = new RegisterUserUseCase(userRepository, emailService);
    ```

### 4.3. Decoupling from Structure, Coupling to Behavior

- **Standard:** Tests MUST interact with the Use Case _only_ through its public API. Tests MUST NOT rely on internal methods, properties, or implementation structure of the Use Case.
- **Rationale:** This ensures that refactoring the internal implementation of a Use Case (without changing its observable behavior) does not break its tests. This is a core principle of maintainable tests.
- **Verification:** Assertions should be made on:
  1.  The `Result` object returned by the use case's `execute` method.
  2.  The interactions with Test Doubles (as per `SOP-TestDoubles.md`), verifying that the correct methods on collaborators were called with expected arguments.

### 4.4. Speed and Determinism

- **Standard:** Sociable Unit Tests MUST be fast and deterministic.
- **Rationale:** Fast tests are run frequently, providing quick feedback. Determinism ensures reliability.
- **Implementation:** Achieved by using in-memory Test Doubles for I/O-bound or slow dependencies.

## 5. Test Structure (Arrange-Act-Assert)

- **Standard:** All tests MUST follow the Arrange-Act-Assert (AAA) pattern.

  - **Arrange:** Set up the preconditions, including instantiating the use case, preparing its dependencies (real objects or configuring test doubles).
  - **Act:** Execute the public method on the use case that is being tested.
  - **Assert:** Verify the outcome by checking the returned `Result` object and/or asserting interactions with test doubles.

  ```typescript
  it("should successfully register a new user", async () => {
    // Arrange
    const email = "test@example.com";
    const password = "ValidPass123!";
    // Configure Test Doubles (Stubs/Spies)
    userRepository.findByEmail = jest.fn().mockResolvedValue(null);
    userRepository.save = jest.fn().mockImplementation((user: User) => Promise.resolve(user));
    emailService.sendConfirmationEmail = jest.fn().mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute({ email, password });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(userRepository.save).toHaveBeenCalled(); // Verifying interaction with Spy
    expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(email); // Verifying interaction with Spy

    const savedUser = (userRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedUser).toBeInstanceOf(User);
    expect(savedUser.email.value).toBe(email);
  });
  ```

## 6. Related SOPs

- `SOP-TestDoubles.md`
- `SOP-NarrowIntegrationTests.md`

## 7. Enforcement

Violation of these standards will result in build failures during CI and/or rejection during code review. These standards are non-negotiable to maintain the integrity and effectiveness of our testing suite.
