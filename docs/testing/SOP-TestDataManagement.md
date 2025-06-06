# Standard Operating Procedure: Test Data Management

**Status:** Mandatory
**Version:** 1.0
**Date:** {{CURRENT_DATE}}

**NON-NEGOTIABLE STANDARD:** Adherence to this SOP is mandatory for managing data in automated tests, particularly for commit-stage tests like Sociable Unit Tests and Narrow Integration Tests. Deviations are not permitted without explicit architectural review and approval.

## 1. Purpose

This SOP defines the standards for creating and managing test data to ensure our tests are fast, reliable, maintainable, and decoupled from implementation details, as per the principles of Continuous Delivery.

## 2. Guiding Principles (Non-Negotiable)

### 2.1. Isolate Test Execution Environment

- **Rule:** All automated tests that require a database MUST run against a separate, dedicated test database. Tests must **never** run against a shared development or production database.
- **Implementation:** Test scripts MUST set the `DATABASE_URL` environment variable to point to a dedicated test database (e.g., `test.db`).

### 2.2. Ensure a Clean State for Every Test

- **Rule:** Every individual test case must run against a known, clean set of data. Tests must be completely independent and must not rely on the state left behind by previous tests.
- **Implementation:** A setup hook (e.g., Jest's `beforeEach`) MUST be used to programmatically delete all data from the relevant database tables before each test runs.

### 2.3. Use Test Data Builders

- **Rule:** For creating instances of domain entities or complex value objects (e.g., `User`), tests MUST use a **Test Data Builder**. Direct instantiation (e.g., `User.create(...)`) within test cases is forbidden.
- **Rationale:** This decouples tests from the entity's construction logic. If a property is added to the `User` entity, we only need to update the `UserBuilder`, not every test that creates a user. This makes our test suite significantly more robust and easier to maintain.
- **Implementation:** A builder class (e.g., `UserBuilder`) must be created. The builder must provide sensible default values for all properties and expose a fluent interface (e.g., `withEmail()`, `withPassword()`) for customization.

### 2.4. Use the Minimum Necessary Data Customization

- **Rule:** When using a Test Data Builder, tests should only customize the properties that are directly relevant to the behavior being tested. All other properties should rely on the builder's sensible defaults.
- **Rationale:** This makes the test's intent clearer by highlighting "what's different" for this specific scenario. It avoids cluttering tests with irrelevant data, making them more readable and focused.

## 3. Example of Builder Usage

```typescript
// GOOD: Using a builder and specifying only the relevant data.
it("should return an error if the user is disabled", async () => {
  // Arrange
  const disabledUser = new UserBuilder().isDisabled().build();
  await userRepository.save(disabledUser);

  // Act & Assert...
});

// FORBIDDEN: Creating data directly and over-specifying.
it("should return an error if the user is disabled", async () => {
  // Arrange
  const disabledUser = User.create({
    email: Email.create("test@example.com").getValue(), // Irrelevant for this test
    password: Password.create("ValidPass123!").getValue(), // Irrelevant for this test
    isEmailVerified: true, // Irrelevant for this test
    status: "disabled", // This is the only relevant piece of data
  }).getValue();
  await userRepository.save(disabledUser);

  // Act & Assert...
});
```

## 4. Related SOPs

- `SOP-TestDoubles.md`
- `SOP-NarrowIntegrationTests.md`
- `SOP-SociableUnitTests.md`

## 5. Enforcement

Correct application of Test Data Management patterns as defined here is critical. Violations will be addressed during code reviews. These standards are non-negotiable.
