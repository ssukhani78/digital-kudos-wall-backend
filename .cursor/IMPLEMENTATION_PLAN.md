# Non-Negotiable Implementation Plan

This document outlines the mandatory implementation steps that MUST be followed for every new story. These steps are not guidelines - they are required procedures.

## Implementation Steps

### 1. System Test Definition (MANDATORY)

- **Location**: `digital-kudos-wall-system-tests/src/acceptance/features/<story-name>.feature`
- **Tasks**:
  - Create feature file with Gherkin scenarios
  - Implement DSL layer (`src/acceptance/dsl/<story-name>.dsl.ts`)
  - Create required models (`src/acceptance/dsl/models/<model-name>.ts`)
- **Reference**: See `account_registration.feature` for example
- **Approval Gate**: Feature file and DSL review MUST be completed before proceeding

### 2. Backend Implementation (MANDATORY)

- **Location**: `digital-kudos-wall-backend/src/modules/<module-name>/`
- **Tasks**:
  1. Implement use case following Clean Architecture (NO EXCEPTIONS)
  2. Implement sociable unit tests (Follow `@SOP-SociableUnitTests.md`)
  3. Implement layers following Clean Architecture:
     - Domain layer
     - Application layer
     - Infrastructure layer
     - Interface layer
  4. Implement component tests (Follow `@SOP-ComponentTests.md`)
  5. Implement narrow integration tests (Follow `@SOP-NarrowIntegrationTests.md`)
- **Guidelines**:
  - Follow `@SOP-TestDataManagement.md` for test data
  - Follow `@SOP-TestDoubles.md` for test doubles
- **Approval Gate**: Backend implementation MUST be reviewed before proceeding

### 3. Frontend Implementation (MANDATORY)

- **Location**: `digital-kudos-wall-frontend/src/features/<feature-name>/`
- **Tasks**:
  1. Implement frontend following Clean Architecture (Follow `@SOP-Frontend-Clean-Architecture.md`)
  2. Add data test IDs to all components
  3. Implement component tests (Follow `@SOP-ComponentTests.md`)
  4. Implement sociable unit tests (Follow `@SOP-SociableUnitTests-FE.md`)
  5. Implement consumer-driven contract tests (Follow `@SOP-ContractTests.md`)
- **Guidelines**:
  - Follow `@SOP-TestDataManagement-FE.md` for test data
- **Approval Gate**: Frontend implementation MUST be reviewed before proceeding

### 4. Contract Testing (MANDATORY)

- **Location**: Backend and Frontend repositories
- **Tasks**:
  1. Implement provider contract verifier tests in backend (Follow `@SOP-ContractTests.md`)
- **Approval Gate**: Contract tests MUST be reviewed before proceeding

### 5. System Test Implementation (MANDATORY)

- **Location**: `digital-kudos-wall-system-tests/`
- **Tasks**:
  1. Implement step definition files
  2. Implement web driver layer with page objects
  3. Use test IDs in page objects for system interaction
- **Approval Gate**: System test implementation MUST be reviewed before proceeding

## Critical Rules

1. Each step MUST be completed and approved before moving to the next step
2. NO EXCEPTIONS to the order of steps
3. Each step MUST be reviewed and committed separately
4. All referenced SOPs MUST be followed exactly
5. All test data management MUST follow respective SOPs
6. Test IDs MUST be consistent across frontend and system tests

## Standard Operating Procedures (SOPs)

The following SOPs MUST be followed without exception:

- `@SOP-SociableUnitTests.md`
- `@SOP-ComponentTests.md`
- `@SOP-NarrowIntegrationTests.md`
- `@SOP-TestDataManagement.md`
- `@SOP-TestDoubles.md`
- `@SOP-Frontend-Clean-Architecture.md`
- `@SOP-SociableUnitTests-FE.md`
- `@SOP-ContractTests.md`
- `@SOP-TestDataManagement-FE.md`
- `@SOP-ContractTests-FE.md`
- `@SOP-ComponentTests-FE.md`
- `@SOP-AcceptanceTests.md`
- `@SOP-SmokeTests.md`
