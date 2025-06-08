# SOP: Contract Testing

This document outlines the principles and practices for writing and maintaining contract tests in the Digital Kudos Wall project, following the consumer-driven approach.

### Guiding Principles

- **Independent Deployability**: The primary goal of our contract tests is to enable the frontend (consumer) and backend (provider) to be developed and deployed independently, with confidence that they can still interoperate correctly.
- **Fast, Reliable Feedback**: Contract tests must be fast and deterministic. They are a critical part of our commit stage, providing immediate feedback if a change breaks an agreed-upon contract.
- **Consumer-Driven**: The consumer's expectations drive the contract. The contract is generated from the consumer's codebase and verified by the provider. The provider cannot dictate the terms.

### The Contract Testing Workflow

1.  **Consumer Writes Test & Generates Contract**:

    - The consumer (e.g., frontend) writes a unit-level test for its API client code.
    - This test uses a mock service (provided by Pact) to define the expected request and the desired response for a given interaction.
    - Running this consumer test generates a `pact.json` file (the "contract"). This file is a tangible artifact of the consumer's requirements.

2.  **Contract is Shared**:

    - The generated `pact.json` file must be made available to the provider.
    - The preferred method is using a **Pact Broker**, which versions the contracts and provides rich tooling to understand integration dependencies.
    - For initial development, the contract file can be manually copied or shared via build artifacts.

3.  **Provider Verifies Contract**:
    - The provider (e.g., backend) creates a verification test.
    - This test is responsible for:
      - Starting a real instance of the provider application.
      - Fetching the contract from the Pact Broker or a local file.
      - Using **State Handlers** (`stateHandlers`) to set up the provider's state for each interaction described in the contract (e.g., "Given a user with this ID exists"). This typically involves preparing a database or mocking repository layers.
      - Allowing the Pact framework to fire the requests from the contract against the running provider.
      - Verifying that the actual responses match the expectations in the contract.

### Best Practices for Our Provider-Side Tests

- **Black-Box Verification**: The provider verification test should treat the running service as a black box. It should only be concerned with starting the server and setting state via the defined `stateHandlers`. It should not know about the internal workings (e.g., use cases, controllers) of the provider.
- **State Setup is Key**: The `stateHandlers` are the most critical part of the provider test. They must accurately prepare the system for the specific scenario defined in the contract. For our backend, this means using our mock repositories (`mockUserRepository`) to simulate the exact database state required for the test.
- **Isolate from External Services**: The provider verification should not talk to real, external third-party services. Any dependencies should be stubbed out. In our current implementation, `mockEmailService` handles this correctly.
- **Run in CI**: Contract tests **must** be part of the provider's `commit-stage` CI pipeline. A failure indicates a breaking change for a consumer and must stop the pipeline. We have configured this via the `test:contract` script in our `commit-stage.yml`.
