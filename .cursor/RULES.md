# Non-Negotiable Development Rules

This document establishes the fundamental, non-negotiable rules that MUST be followed for ALL development work. These are not preferences or guidelines - they are mandatory requirements.

## Core Principles

1. Test-Driven Development (TDD) is MANDATORY

   - No production code without a failing test
   - Red-Green-Refactor cycle must be followed
   - No exceptions to this rule

2. Clean Architecture is NON-NEGOTIABLE

   - All code must follow Clean Architecture principles
   - Layers must be properly separated
   - Dependencies must point inward

3. SOLID Principles are REQUIRED

   - Single Responsibility Principle
   - Open-Closed Principle
   - Liskov Substitution Principle
   - Interface Segregation Principle
   - Dependency Inversion Principle

4. XP Practices are MANDATORY

   - Pair Programming
   - Continuous Integration
   - Simple Design
   - Refactoring
   - Small Releases
   - Collective Code Ownership

5. Continuous Delivery is REQUIRED

   - Automated Testing
   - Continuous Integration Pipeline
   - Deployment Pipeline
   - Infrastructure as Code

6. Code Smells are not acceptable

## Implementation Process

The implementation process defined in `.cursor/IMPLEMENTATION_PLAN.md` MUST be followed for every new story. No deviations are allowed.

## Standard Operating Procedures

All SOPs in `.cursor/sops/` directory MUST be followed exactly as specified. These are not guidelines but required procedures.

## Authority Sources

The following authorities' principles must be followed:

- Kent Beck
- Martin Fowler
- Dev Farley
- Robert C. Martin
- Dan North
- Ivar Jacobson
- Mary Poppendieck

## Compliance

Any code that does not comply with these rules will be rejected. These rules are non-negotiable and must be followed without exception.
