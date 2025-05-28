# Digital Kudos Wall - Backend

Node.js Express API for the Digital Kudos Wall project.

## Overview

This is the backend component of the Digital Kudos Wall system, built with Node.js, Express, and TypeScript. It provides the REST API endpoints for user authentication, kudos management, and data persistence.

## Tech Stack

- **Node.js 20** with TypeScript
- **Express.js** for REST API framework
- **Jest** for unit testing
- **Supertest** for API integration testing
- **ESLint** for code quality
- **Docker** for containerization
- **CORS** for cross-origin resource sharing
- **Helmet** for security headers
- **dotenv** for environment configuration

## Project Structure

```
src/
├── controllers/        # Request handlers and business logic
├── middleware/         # Express middleware functions
├── models/            # Data models and schemas
├── routes/            # API route definitions
├── services/          # Business logic and external integrations
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── __tests__/         # Test files
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
# Add other environment variables as needed
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Kudos Management

- `GET /api/kudos` - Get all kudos
- `POST /api/kudos` - Create new kudos (Tech Leads only)
- `GET /api/kudos/:id` - Get specific kudos
- `PUT /api/kudos/:id` - Update kudos (Tech Leads only)
- `DELETE /api/kudos/:id` - Delete kudos (Tech Leads only)

### User Management

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user profile

## Testing Strategy

Following TDD principles with multiple test layers:

- **Unit Tests**: Individual function and service testing
- **Component Tests**: API endpoint integration testing
- **Contract Tests**: API contract verification with frontend
- **Linting**: Code quality and style enforcement

## CI/CD Pipeline

This repository includes a GitHub Actions workflow that implements the **Commit Stage** of our pipeline:

1. **Code Checkout**
2. **Dependency Installation**
3. **Code Compilation** (TypeScript)
4. **Unit Tests**
5. **Component Tests**
6. **Contract Tests**
7. **Linting & Code Analysis**
8. **Build Application**
9. **Docker Image Creation**
10. **Image Publishing** to GitHub Container Registry

## Docker

The application is containerized for consistent deployment across environments.

```bash
# Build Docker image
docker build -t digital-kudos-wall-backend .

# Run container
docker run -p 3001:3001 digital-kudos-wall-backend
```

## Security

- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Input validation** and sanitization
- **Environment variable** protection
- **Error handling** without information leakage

## Contributing

This project follows:

- **Trunk-based development**
- **Small, frequent commits**
- **Test-driven development**
- **Continuous integration**
- **Clean Architecture principles**
- **SOLID principles**

## Links

- [Main Project Repository](https://github.com/chirag1507/digital-kudos-wall)
- [Frontend Repository](https://github.com/chirag1507/digital-kudos-wall-frontend)
- [System Tests Repository](https://github.com/chirag1507/digital-kudos-wall-system-tests)
