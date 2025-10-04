# Contributing to KU Term Summary

Thank you for your interest in contributing to KU Term Summary! We welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker and Docker Compose (for database)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/The1Re/KU-Term-Summary.git
   cd KU-Term-Summary
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the database**

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database (optional)**

   ```bash
   npm run prisma:seed
   ```

7. **Start development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000` and Swagger documentation at `http://localhost:3000/docs`.

## 📝 Development Guidelines

### Code Style

We use ESLint and Prettier to maintain code quality. The configuration is already set up in the project.

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Pre-commit hooks**: Automatically run linting and formatting

### Code Standards

1. **TypeScript**: All code must be written in TypeScript
2. **Naming Conventions**:
   - Use PascalCase for classes, interfaces, and types
   - Use camelCase for variables, functions, and methods
   - Use SCREAMING_SNAKE_CASE for constants
   - Use kebab-case for file names

3. **File Structure**:

   ```
   src/
   ├── modules/                        # Feature modules
   │   └── student/
   │       ├── __tests__/              # Unit test
   │       ├── student.controller.ts
   │       ├── student.service.ts
   │       └── student.module.ts
   └── core/                           # Application core
   ```

4. **API Design**:
   - Use RESTful principles
   - Add proper Swagger decorators
   - Include input validation using class-validator
   - Return consistent response formats

### Testing

- Write unit tests for all services and utilities
- Write e2e tests for API endpoints
- Maintain test coverage above 80%

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Database Changes

When making database changes:

1. Create a new Prisma migration:

   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. Update the seed file if necessary:

   ```bash
   npm run prisma:seed
   ```

3. Update relevant DTOs and entities

## 🔄 Contribution Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation updates
- `refactor/code-improvement` - Code refactoring
- `chore/maintenance-task` - Maintenance tasks

### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code standards above
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit your changes**

   ```bash
   git add .
   git commit -m "[feat] add new feature description"
   ```

   **Commit Message Format**:

   ```
   type(scope): description

   [optional body]

   [optional footer]
   ```

   **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

4. **Push to your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use a descriptive title
   - Include a detailed description of changes
   - Reference any related issues
   - Ensure all CI checks pass
